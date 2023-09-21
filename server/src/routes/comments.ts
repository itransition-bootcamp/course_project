import express, { Response } from "express";
import { User, Comment } from "../sequelize/models/allModels";
import { StatusCodes } from "http-status-codes";
import { authenticated } from "./handlers";
import { body, matchedData, param, validationResult } from "express-validator";

const comments = express.Router();

const subscribers: { [key: string]: Response[] } = {};

comments.get("/", (req, res) => {
  const reviewId = matchedData(req).id;

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

comments.post(
  "/",
  authenticated(),
  body("comment").isString().trim().isLength({ min: 1, max: 1000 }),
  async (req, res) => {
    const validation = validationResult(req);
    if (!validation.isEmpty())
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ errors: validation.array() });

    const data = matchedData(req);
    const reviewId: number = data.id;
    const comment: string = data.comment;

    const newComment = await Comment.create({
      UserId: req.user!.id,
      ReviewId: reviewId,
      text: comment,
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

comments.delete(
  "/:commentId",
  authenticated(),
  param("commentId").isInt().toInt(),
  async (req, res) => {
    const validation = validationResult(req);
    if (!validation.isEmpty())
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ errors: validation.array() });

    const commentId: number = matchedData(req).commentId;
    const user = await User.findByPk(req.user!.id);
    const comment = await Comment.findByPk(commentId);
    if (!user || !comment) return res.sendStatus(StatusCodes.NOT_FOUND);
    if (comment.UserId != user.id && user.role != "admin")
      res.sendStatus(StatusCodes.UNAUTHORIZED);
    else await comment?.destroy();
    res.sendStatus(200);
  }
);

export default comments;
