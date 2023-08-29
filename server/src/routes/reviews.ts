import express from "express";
import sequelize from "../sequelize";
import { Review, User, Comment, Like } from "../models/allModels";
import { FindOptions, Includeable, InferAttributes } from "sequelize";
import { StatusCodes } from "http-status-codes";

const router = express.Router();

router.get("/:id", async (req, res) => {
  const dbQuery = {
    attributes: { exclude: ["updatedAt", "vector"] },
    include: [Like] as Includeable[],
  };
  if (Object.prototype.hasOwnProperty.call(req.query, "comments"))
    dbQuery.include.push(Comment);
  else if (Object.prototype.hasOwnProperty.call(req.query, "user"))
    dbQuery.include.push({
      model: User,
      attributes: ["username", "avatar"],
    });
  res.send(await Review.findByPk(req.params.id, dbQuery));
});

router.get("/:id/like", async (req, res) => {
  if (!req.isAuthenticated()) res.sendStatus(StatusCodes.UNAUTHORIZED);
  const findLike = await Like.findOrCreate({
    where: { ReviewId: req.params.id, UserId: req.user!.id },
  });
  const [like, created] = findLike;
  if (!created) like.destroy();

  res.send("OK");
});

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
      exclude: ["poster", "rating", "updatedAt", "vector", "UserId"],
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

router.post("/", async (req, res) => {
  if (!req.isAuthenticated()) return;
  await Review.update(
    { title: req.body.title, text: req.body.text },
    { where: { id: 1 } }
  );
  res.send("123");
});

export default router;
