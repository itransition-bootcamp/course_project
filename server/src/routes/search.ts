import express from "express";
import { Like, Review } from "../models/allModels";
import sequelize from "../sequelize";
import { Op } from "sequelize";

const router = express.Router();
router.post("/", async (req, res) => {
  const searchResults = await Review.findAll({
    attributes: { exclude: ["updatedAt"] },
    include: Like,
    where: {
      vector: {
        [Op.match]: sequelize.fn("plainto_tsquery", "english", req.body.search),
      },
    },
    order: [
      [
        sequelize.fn(
          "ts_rank",
          sequelize.col("vector"),
          sequelize.fn("plainto_tsquery", "english", req.body.search)
        ),
        "DESC",
      ],
    ],
    limit: req.body.limit,
  });
  type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
  const formated = searchResults.map((review) => review.toJSON()) as Optional<
    Review,
    "vector"
  >[];
  formated.forEach((review) => delete review.vector);
  res.json(formated);
});

export default router;
