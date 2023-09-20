import express, { Response } from "express";
import {
  Review,
  User,
  Comment,
  Like,
  Tag,
  Review_Image,
} from "../sequelize/models/allModels";
import { Op } from "sequelize";
import { StatusCodes } from "http-status-codes";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import { adminOrAuthor, authenticated, validIdParam } from "./handlers";
import puppeteer from "puppeteer";
import getReviews from "../sequelize/queries/getReviews";
import getReviewById from "../sequelize/queries/getReviewById";

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
  const tags = req.query.tags as string | string[] | undefined;

  res.send(await getReviews(limit, top, category, tags));
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
  const userInReqQuery = Object.prototype.hasOwnProperty.call(
    req.query,
    "user"
  );
  const galleryInReqQuery = Object.prototype.hasOwnProperty.call(
    req.query,
    "gallery"
  );
  const commentsInReqQuery = Object.prototype.hasOwnProperty.call(
    req.query,
    "comments"
  );

  const result = await getReviewById(
    req.params.id,
    userInReqQuery,
    galleryInReqQuery,
    commentsInReqQuery
  );
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

async function printPDF(reviewId: string | number) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.emulateMediaFeatures([
    { name: "prefers-color-scheme", value: "light" },
  ]);

  await page.goto(`${process.env.BASE_URL}/reviews/${reviewId}`, {
    waitUntil: "networkidle2",
  });

  const reviewEl = await page.$("main > div.MuiPaper-root");
  if (!reviewEl) {
    await browser.close();
    return false;
  }

  const rootFound = await page.evaluate((reviewEl) => {
    const root: HTMLElement | null = document.querySelector("#root");
    if (!root) return false;
    root.innerHTML = reviewEl.innerHTML;
    root.style.padding = "20px";
    return true;
  }, reviewEl);

  if (!rootFound) {
    await browser.close();
    return false;
  }

  const pdf = await page.pdf({ format: "A4", printBackground: true });

  await browser.close();
  return pdf;
}

reviews.get("/:id/pdf", authenticated(), validIdParam(), async (req, res) => {
  const pdf = await printPDF(req.params.id);
  if (!pdf) return res.sendStatus(StatusCodes.NOT_FOUND);
  else
    res
      .set({ "Content-Type": "application/pdf", "Content-Length": pdf.length })
      .send(pdf);
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
