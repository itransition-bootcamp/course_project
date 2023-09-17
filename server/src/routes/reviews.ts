import express, { Response } from "express";
import sequelize from "../sequelize";
import {
  Review,
  User,
  Comment,
  Like,
  Tag,
  Review_Image,
  Product,
} from "../models/allModels";
import { FindOptions, Includeable, InferAttributes, Op } from "sequelize";
import { StatusCodes } from "http-status-codes";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import { adminOrAuthor, authenticated, validIdParam } from "./handlers";

cloudinary.config({
  cloud_name: "dxb2qepsn",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({});
const reviews = express.Router();

reviews.get("/", async (req, res) => {
  const limit: number = parseInt(req.query.limit as string);
  const top = Object.prototype.hasOwnProperty.call(req.query, "top");
  const category = req.query.cat;
  if (category && typeof category != "string") return;
  const tags = req.query.tags;
  const dbQuery: FindOptions<
    InferAttributes<
      Review,
      {
        omit: never;
      }
    >
  > = {
    attributes: {
      exclude: ["updatedAt", "vector"],
      include: [
        [
          sequelize.cast(
            sequelize.fn("COUNT", sequelize.col("Likes.ReviewId")),
            "integer"
          ),
          "likesCount",
        ],
      ],
    },
    include: [
      {
        model: Like,
        attributes: [],
      },
      { model: Product, attributes: ["category", "name"] },
    ],
    group: ["Review.id", "Product.id"],
    order: [["createdAt", "DESC"]],
  };

  if (top)
    Object.assign(dbQuery, {
      order: [["likesCount", "DESC"]],
    });

  if (category) {
    dbQuery.where = {
      "$Product.category$": category,
    };
  }
  if (tags) {
    dbQuery.include = [
      ...(dbQuery.include as Includeable[]),
      {
        model: Tag,
        attributes: [],
        through: { attributes: [] },
      },
    ];

    dbQuery.having = sequelize.where(
      sequelize.fn("ARRAY_AGG", sequelize.col("Tags.name")),
      {
        [Op.contains]: sequelize.cast(
          Array.isArray(tags) ? tags : [tags],
          "varchar[]"
        ),
      }
    );
  }
  if (limit) Object.assign(dbQuery, { limit: limit, subQuery: false });
  res.send(await Review.findAll(dbQuery));
});

reviews.post("/", authenticated(), async (req, res) => {
  const newReviewValues = {
    title: req.body.title,
    text: req.body.text,
    rating: req.body.rating,
    ProductId: req.body.ProductId,
    UserId: req.user!.id,
  };

  if (
    Object.values(newReviewValues).some(
      (value) => value === undefined || value === null
    )
  )
    return res.sendStatus(StatusCodes.BAD_REQUEST);

  const newReview = await Review.create(newReviewValues);

  await Review_Image.bulkCreate(
    req.body.gallery.map((img: { src: string }) => {
      return { ...img, ReviewId: newReview.id };
    })
  );

  const newTags = await Promise.all(
    req.body.tags.map(async (tag: string) => {
      const [newTag] = await Tag.findOrCreate({ where: { name: tag } });
      return newTag;
    })
  );

  await newReview.setTags(newTags);

  res.status(200).send(newReview.id.toString());
});

reviews.post(
  "/gallery",
  authenticated(),
  upload.array("gallery"),
  async (req, res) => {
    const files = req.files as Express.Multer.File[];
    if (!files) {
      return res.status(StatusCodes.BAD_REQUEST).send("No file was uploaded.");
    }

    files.map((file) => {
      if (!file) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .send("No file was uploaded.");
      }
      const maxSizeMB = 3;
      if (file.size > 1024 * 1024 * maxSizeMB) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .send(`Size exceeded ${maxSizeMB} MB`);
      }

      if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/png") {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .send("File format is incorrect.");
      }
    });

    const cloudUrls: { src: string | undefined }[] = [];
    files.map((file) => {
      const stream = new Readable({
        read() {
          this.push(file.buffer);
          this.push(null);
        },
      });

      const cldUploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "review_images",
          transformation: {
            format: "jpg",
          },
        },
        function (error, result) {
          cloudUrls.push({ src: result?.secure_url });
          if (cloudUrls.length == files.length) res.json({ urls: cloudUrls });
        }
      );
      stream.pipe(cldUploadStream);
    });
  }
);

reviews.all("/:id", validIdParam());
reviews.get("/:id", async (req, res) => {
  const dbQuery: FindOptions<InferAttributes<Review>> & {
    include: Includeable[];
  } = {
    attributes: { exclude: ["updatedAt", "vector"] },
    include: [Like, Tag, Product],
  };
  const userInReq = Object.prototype.hasOwnProperty.call(req.query, "user");
  const galleryInReq = Object.prototype.hasOwnProperty.call(
    req.query,
    "gallery"
  );
  const commentsInReq = Object.prototype.hasOwnProperty.call(
    req.query,
    "comments"
  );

  if (userInReq) {
    dbQuery.include.push({
      model: User,
      attributes: ["username", "avatar"],
    });
  }
  if (galleryInReq) {
    dbQuery.include.push({
      model: Review_Image,
      attributes: ["id", "src"],
    });
  }
  if (commentsInReq) {
    dbQuery.group = [
      "Review.id",
      "Likes.ReviewId",
      "Likes.UserId",
      "Tags.id",
      "Tags.Review_Tags.ReviewId",
      "Tags.Review_Tags.TagId",
      "Product.id",
      "Comments.id",
      "Comments.User.id",
    ];
    if (userInReq) dbQuery.group.push("User.id");
    if (galleryInReq) dbQuery.group.push("Review_Images.id");
    dbQuery.include.push({
      model: Comment,
      attributes: { exclude: ["updatedAt", "vector", "UserId"] },
      include: [
        {
          model: User,
          attributes: [
            "id",
            "username",
            "avatar",
            [
              sequelize.literal(`(
                  SELECT
                  coalesce(SUM("likesPerReview"), '0')::integer
                  FROM
                    (
                      SELECT
                        id,
                        COUNT("Comments->User->Reviews->Likes"."ReviewId") AS "likesPerReview"
                      FROM
                        "Reviews" AS "Comments->User->Reviews"
                        LEFT OUTER JOIN "Likes" AS "Comments->User->Reviews->Likes" ON "Comments->User->Reviews"."id" = "Comments->User->Reviews->Likes"."ReviewId"
                      WHERE
                        "Comments->User->Reviews"."UserId" = "Comments->User"."id"
                      GROUP BY
                        "Comments->User->Reviews"."id"
                    ) "Comments->User->Reviews->Likes.likesPerReview"
                )`),

              "likesCount",
            ],
          ],
        },
      ],
    });
    dbQuery.order = [sequelize.col("Comments.createdAt")];
  }
  const result = await Review.findByPk(req.params.id, dbQuery);
  if (!result) res.sendStatus(StatusCodes.NOT_FOUND);
  else res.send(result);
});

reviews.delete("/:id", adminOrAuthor(), async (req, res) => {
  await res.locals.review.destroy();
  res.send("OK");
});

reviews.put("/:id", adminOrAuthor(), async (req, res) => {
  const gallery = await Promise.all(
    req.body.gallery.map(async (image: { id?: number; src: string }) => {
      const [newImage] = await Review_Image.findOrCreate({
        where: {
          ReviewId: res.locals.review.id,
          src: image.src,
        },
      });
      return newImage;
    })
  );

  await Review_Image.destroy({
    where: {
      id: { [Op.notIn]: gallery.map((img) => img.id) },
      ReviewId: res.locals.review.id,
    },
  });

  const newTags = await Promise.all(
    req.body.tags.map(async (tag: string) => {
      const [newTag] = await Tag.findOrCreate({ where: { name: tag } });
      return newTag;
    })
  );

  res.locals.review.set({
    title: req.body.title,
    text: req.body.text,
    rating: req.body.rating,
  });

  await res.locals.review.setTags(newTags);
  await res.locals.review.save();

  res.send("OK");
});

reviews.get("/:id/like", authenticated(), validIdParam(), async (req, res) => {
  const findLike = await Like.findOrCreate({
    where: { ReviewId: req.params.id, UserId: req.user!.id },
  });
  const [like, created] = findLike;
  if (!created) like.destroy();

  res.send("OK");
});

const subscribers: { [key: string]: Response[] } = {};

reviews.get("/:id/comments", validIdParam(), (req, res) => {
  const reviewId = req.params.id;

  res.set({
    Connection: "keep-alive", // allowing TCP connection to remain open for multiple HTTP requests/responses
    "Content-Type": "text/event-stream", // media type for Server Sent Events (SSE)
    "X-Accel-Buffering": "no",
    "Cache-Control": "no-cache",
  });
  res.flushHeaders();
  if (subscribers[reviewId] === undefined) subscribers[reviewId] = [res];
  else subscribers[reviewId] = [...subscribers[reviewId], res];

  res.on("close", () => {
    subscribers[reviewId] = subscribers[reviewId].filter(
      (response) => response != res
    );

    res.end();
  });
});

reviews.post(
  "/:id/comments",
  authenticated(),
  validIdParam(),
  async (req, res) => {
    const reviewId = parseInt(req.params.id);

    const newComment = await Comment.create({
      UserId: req.user!.id,
      ReviewId: reviewId,
      text: req.body.comment,
    });

    const newCommentWithUser = await Comment.findByPk(newComment.id, {
      include: { model: User, attributes: ["avatar", "id", "username"] },
    });
    subscribers[reviewId] &&
      subscribers[reviewId].map((subscriber) => {
        subscriber.write(`data: ${JSON.stringify(newCommentWithUser)}\n\n`);
        subscriber.flush();
      });
    res.sendStatus(200);
  }
);

reviews.delete(
  "/:id/comments/:commentId",
  authenticated(),
  validIdParam(),
  async (req, res) => {
    const commentId = parseInt(req.params.commentId);
    const user = await User.findByPk(req.user!.id);
    const comment = await Comment.findByPk(commentId);
    if (!user || !comment) return res.sendStatus(StatusCodes.NOT_FOUND);
    if (comment.UserId != user.id && user.role != "admin")
      res.sendStatus(StatusCodes.UNAUTHORIZED);
    else await comment?.destroy();
    res.sendStatus(200);
  }
);

export default reviews;
