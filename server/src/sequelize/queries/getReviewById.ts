import { FindOptions, InferAttributes, Includeable } from "sequelize";
import {
  Review,
  Like,
  Tag,
  Product,
  Review_Image,
  User,
  Comment,
} from "../models/allModels";
import sequelize from "../sequelize";

export default async function getReviewById(
  reviewId: string | number,
  withUser?: boolean,
  withGallery?: boolean,
  withComments?: boolean
) {
  const dbQuery: FindOptions<InferAttributes<Review>> & {
    include: Includeable[];
  } = {
    attributes: { exclude: ["updatedAt", "vector"] },
    include: [Like, Tag, Product],
  };

  if (withUser) {
    dbQuery.include.push({
      model: User,
      attributes: ["username", "avatar"],
    });
  }
  if (withGallery) {
    dbQuery.include.push({
      model: Review_Image,
      attributes: ["id", "src"],
    });
  }
  if (withComments) {
    dbQuery.group = [
      "Review.id",
      "Likes.ReviewId",
      "Likes.UserId",
      "Tags.id",
      "Tags.Review_Tags.ReviewId",
      "Tags.Review_Tags.TagId",
      "Product.id",
      "Comments.id",
      "Comments.User.id",
    ];
    if (withUser) dbQuery.group.push("User.id");
    if (withGallery) dbQuery.group.push("Review_Images.id");
    dbQuery.include.push({
      model: Comment,
      attributes: { exclude: ["updatedAt", "vector", "UserId"] },
      include: [
        {
          model: User,
          attributes: [
            "id",
            "username",
            "avatar",
            [
              sequelize.literal(`(
                  SELECT
                  coalesce(SUM("likesPerReview"), '0')::integer
                  FROM
                    (
                      SELECT
                        id,
                        COUNT("Comments->User->Reviews->Likes"."ReviewId") AS "likesPerReview"
                      FROM
                        "Reviews" AS "Comments->User->Reviews"
                        LEFT OUTER JOIN "Likes" AS "Comments->User->Reviews->Likes" ON "Comments->User->Reviews"."id" = "Comments->User->Reviews->Likes"."ReviewId"
                      WHERE
                        "Comments->User->Reviews"."UserId" = "Comments->User"."id"
                      GROUP BY
                        "Comments->User->Reviews"."id"
                    ) "Comments->User->Reviews->Likes.likesPerReview"
                )`),

              "likesCount",
            ],
          ],
        },
      ],
    });
    dbQuery.order = [sequelize.col("Comments.createdAt")];
  }
  return Review.findByPk(reviewId, dbQuery);
}
