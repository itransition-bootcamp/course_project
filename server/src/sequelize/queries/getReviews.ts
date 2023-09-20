import { FindOptions, InferAttributes, Includeable, Op } from "sequelize";
import { Review, Like, Tag, Product } from "../models/allModels";
import sequelize from "../sequelize";

export default async function getReviews(
  limit?: number,
  top?: boolean,
  category?: string,
  tags?: string[] | string
) {
  const dbQuery: FindOptions<
    InferAttributes<
      Review,
      {
        omit: never;
      }
    >
  > = {
    attributes: {
      exclude: ["updatedAt", "vector"],
      include: [
        [
          sequelize.cast(
            sequelize.fn(
              "COUNT",
              sequelize.fn("DISTINCT", sequelize.col("Likes.ReviewId"))
            ),
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
      { model: Product, attributes: ["category", "name"] },
    ],
    group: ["Review.id", "Product.id"],
    order: [["createdAt", "DESC"]],
  };

  if (top)
    Object.assign(dbQuery, {
      order: [["likesCount", "DESC"]],
    });

  if (category) {
    dbQuery.where = {
      "$Product.category$": category,
    };
  }
  if (tags) {
    dbQuery.include = [
      ...(dbQuery.include as Includeable[]),
      {
        model: Tag,
        attributes: [],
        through: { attributes: [] },
      },
    ];

    dbQuery.having = sequelize.where(
      sequelize.fn(
        "ARRAY_AGG",
        sequelize.fn("DISTINCT", sequelize.col("Tags.name"))
      ),
      {
        [Op.contains]: sequelize.cast(
          Array.isArray(tags) ? tags : [tags],
          "varchar[]"
        ),
      }
    );
  }
  if (limit) Object.assign(dbQuery, { limit: limit, subQuery: false });
  return Review.findAll(dbQuery);
}
