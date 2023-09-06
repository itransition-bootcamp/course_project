import express from "express";
import { Review, Tag } from "../models/allModels";
import sequelize from "../sequelize";
import { FindOptions, InferAttributes } from "sequelize";

const router = express.Router();
router.get("/", async (req, res) => {
  let dbQuery: FindOptions<
    InferAttributes<
      Tag,
      {
        omit: never;
      }
    >
  > = { attributes: ["name"] };
  if (Object.prototype.hasOwnProperty.call(req.query, "count"))
    dbQuery = {
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
    };
  res.send(await Tag.findAll(dbQuery));
});

export default router;
