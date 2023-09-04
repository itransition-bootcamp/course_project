import express, { Response } from "express";
import sequelize from "../sequelize";
import { Review, User, Comment, Like, Tag } from "../models/allModels";
import { FindOptions, Includeable, InferAttributes } from "sequelize";
import { StatusCodes } from "http-status-codes";

const router = express.Router();

router.get("/", async (req, res) => {
  const limit: number = parseInt(req.query.limit as string);
  const top = Object.prototype.hasOwnProperty.call(req.query, "top");

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
    ],
    group: ["Review.id"],
    order: [["createdAt", "DESC"]],
  };

  if (top)
    Object.assign(dbQuery, {
      order: [["likesCount", "DESC"]],
    });

  if (limit) Object.assign(dbQuery, { limit: limit, subQuery: false });
  res.send(await Review.findAll(dbQuery));
});

router.all("/:id", async (req, res, next) => {
  if (isNaN(parseInt(req.params.id)))
    return res.sendStatus(StatusCodes.BAD_REQUEST);
  else next();
});
router.get("/:id", async (req, res) => {
  const dbQuery: FindOptions<InferAttributes<Review>> & {
    include: Includeable[];
  } = {
    attributes: { exclude: ["updatedAt", "vector"] },
    include: [Like, Tag],
  };
  if (Object.prototype.hasOwnProperty.call(req.query, "comments")) {
    dbQuery.include.push({
      model: Comment,
      include: [{ model: User, attributes: ["username", "avatar"] }],
    });
    dbQuery.order = [sequelize.col("Comments.createdAt")];
  } else if (Object.prototype.hasOwnProperty.call(req.query, "user"))
    dbQuery.include.push({
      model: User,
      attributes: ["username", "avatar"],
    });
  const result = await Review.findByPk(req.params.id, dbQuery);
  if (!result) res.sendStatus(StatusCodes.NOT_FOUND);
  else res.send(result);
});

router.all("/:id", async (req, res, next) => {
  if (req.method != "PUT" && req.method != "DELETE") return next();
  if (!req.isAuthenticated()) return res.sendStatus(StatusCodes.UNAUTHORIZED);
  const user = await User.findByPk(req.user.id);
  const review = await Review.findByPk(req.params.id);
  if (!review) return res.sendStatus(StatusCodes.NOT_FOUND);
  if (user?.role != "admin" && !user?.hasReview(review))
    return res.sendStatus(StatusCodes.UNAUTHORIZED);
  if (req.method == "PUT")
    await review.update({ title: req.body.title, text: req.body.text });
  else if (req.method == "DELETE") await review.destroy();
  res.send("OK");
});

router.get("/:id/like", async (req, res) => {
  if (isNaN(parseInt(req.params.id)))
    return res.sendStatus(StatusCodes.BAD_REQUEST);
  if (!req.isAuthenticated()) res.sendStatus(StatusCodes.UNAUTHORIZED);
  const findLike = await Like.findOrCreate({
    where: { ReviewId: req.params.id, UserId: req.user!.id },
  });
  const [like, created] = findLike;
  if (!created) like.destroy();

  res.send("OK");
});

const subscribers: { [key: string]: Response[] } = {};

router.get("/:id/comments", (req, res) => {
  const reviewId = req.params.id;
  if (isNaN(parseInt(reviewId))) return res.sendStatus(StatusCodes.BAD_REQUEST);

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

router.post("/:id/comments", async (req, res) => {
  if (!req.isAuthenticated() || !req.user)
    return res.sendStatus(StatusCodes.UNAUTHORIZED);
  const reviewId = parseInt(req.params.id);

  const newComment = await Comment.create({
    UserId: req.user.id,
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
});

export default router;
