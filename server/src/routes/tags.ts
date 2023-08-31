import express from "express";
import { Review, Tag } from "../models/allModels";
import sequelize from "../sequelize";

const router = express.Router();
router.get("/", async (req, res) => {
  const searchResults = await Tag.findAll({
    attributes: [
      ["name", "value"],
      [sequelize.fn("count", sequelize.col("Tag.id")), "count"],
    ],
    include: [
      {
        model: Review,
        attributes: [],
        through: { attributes: [] },
      },
    ],
    group: ["Tag.id"],
  });
  res.send(searchResults);
});

export default router;
