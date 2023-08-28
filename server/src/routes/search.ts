import express from "express";
import Review from "../models/Review";
import sequelize from "../sequelize";
import { Op } from "sequelize";

const router = express.Router();
router.post("/", async (req, res) => {
  console.log(req.body.json);
  const searchResults = await Review.findAll({
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
    limit: 10,
  });

  res.json(searchResults);
});

export default router;
