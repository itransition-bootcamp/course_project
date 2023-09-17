import express from "express";
import { Comment, Like, Review } from "../models/allModels";
import sequelize from "../sequelize";

const search = express.Router();
search.post("/", async (req, res) => {
  const searchResults = await Review.findAll({
    attributes: [
      "id",
      "title",
      [
        sequelize.fn(
          "MAX",
          sequelize.fn(
            "ts_rank",
            sequelize.literal(
              `"Review"."vector" || coalesce("Comments"."vector", '')`
            ),
            sequelize.fn("websearch_to_tsquery", "english", req.body.search)
          )
        ),
        "rankV",
      ],
    ],
    include: [
      {
        model: Comment,
        attributes: [],
        subQuery: true,
      },
      Like,
    ],
    where: sequelize.literal(
      `"Review"."vector" || coalesce("Comments"."vector", '') @@ websearch_to_tsquery('english', '${req.body.search}')`
    ),
    group: [sequelize.col(`Review.id`)],
    order: [[sequelize.col(`rankV`), "DESC"]],
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

export default search;
