import express from "express";
import Review from "../models/Review";
import sequelize from "../sequelize";
import { FindOptions, InferAttributes } from "sequelize";
import Like from "../models/Like";

const router = express.Router();

router.get("/:id", async (req, res) => {
  res.send(await Review.findByPk(req.params.id));
});

router.get("/", async (req, res) => {
  const limit: number = parseInt(req.query.limit as string);
  const top = req.query.top === "true";

  const dbQuery: FindOptions<
    InferAttributes<
      Review,
      {
        omit: never;
      }
    >
  > = {
    attributes: ["id", "title", "text", "createdAt"],
    order: [["createdAt", "DESC"]],
  };

  if (top)
    Object.assign(dbQuery, {
      attributes: {
        exclude: ["poster", "rating", "updatedAt", "vector", "UserId"],
        include: [
          [
            sequelize.fn("COUNT", sequelize.col("Likes.ReviewId")),
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
      order: [["likesCount", "DESC"]],
    });

  if (limit) Object.assign(dbQuery, { limit: limit, subQuery: false });

  res.send(await Review.findAll(dbQuery));
});

export default router;
