import { User, Like } from "../models/allModels";
import sequelize from "../sequelize";

export default async function getUserMe(id: number) {
  return User.findByPk(id, {
    attributes: {
      exclude: ["hashedPassword", "salt", "githubId", "twitterId"],
      include: [
        [
          sequelize.literal(`(
            SELECT
            coalesce(SUM("likesPerReview"), '0')::integer
            FROM
              (
                SELECT
                  id,
                  COUNT("User->Reviews->Likes"."ReviewId") AS "likesPerReview"
                FROM
                  "Reviews" AS "User->Reviews"
                  LEFT OUTER JOIN "Likes" AS "User->Reviews->Likes" ON "User->Reviews"."id" = "User->Reviews->Likes"."ReviewId"
                WHERE
                  "User->Reviews"."UserId" = "User"."id"
                GROUP BY
                  "User->Reviews"."id"
              ) "User->Reviews->Likes.likesPerReview"
          )`),

          "likesCount",
        ],
      ],
    },
    include: [{ model: Like, attributes: ["ReviewId"] }],
  });
}
