import express from "express";
import { Comment, Like, Review } from "../models/allModels";
import sequelize from "../sequelize";
import { StatusCodes } from "http-status-codes";

const search = express.Router();

search.get("/", async (req, res) => {
  if (
    !req.query.search ||
    typeof req.query.limit != "string" ||
    isNaN(parseInt(req.query.limit)) ||
    typeof req.query.offset != "string" ||
    isNaN(parseInt(req.query.offset))
  )
    return res.sendStatus(StatusCodes.BAD_REQUEST);

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
            sequelize.fn("websearch_to_tsquery", "english", req.query.search)
          )
        ),
        "rankV",
      ],
      [sequelize.literal("count(*) OVER()"), "fullCount"],
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
      `"Review"."vector" || coalesce("Comments"."vector", '') @@ websearch_to_tsquery('english', '${req.query.search}')`
    ),
    group: [sequelize.col(`Review.id`)],
    order: [
      [sequelize.col(`rankV`), "DESC"],
      [sequelize.col("Review.id"), "ASC"],
    ],
    limit: parseInt(req.query.limit),
    offset: parseInt(req.query.offset),
  });
  if (searchResults.length == 0) return res.sendStatus(StatusCodes.NO_CONTENT);
  const processed = searchResults.map((review) =>
    review.toJSON()
  ) as (Review & {
    fullCount?: number;
  })[];
  const results = { fullCount: processed[0].fullCount, results: processed };
  processed.forEach((review) => delete review.fullCount);

  res.json(results);
});

export default search;
