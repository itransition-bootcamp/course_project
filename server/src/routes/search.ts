import express from "express";
import { Review } from "../models/allModels";
import sequelize from "../sequelize";
import { Op } from "sequelize";

const router = express.Router();
router.post("/", async (req, res) => {
  console.log(req.body);
  const searchResults = await Review.findAll({
    attributes: { exclude: ["vector", "updatedAt"] },
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

  res.json(searchResults);
});

export default router;
