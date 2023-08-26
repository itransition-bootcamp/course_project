import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
  Sequelize,
} from "sequelize";
import User from "./User";
import Review from "./Review";

class Comment extends Model<
  InferAttributes<Comment>,
  InferCreationAttributes<Comment>
> {
  declare id: CreationOptional<number>;
  declare text: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare UserId: ForeignKey<User["id"]>;
  declare ReviewId: ForeignKey<Review["id"]>;

  declare User?: NonAttribute<User>;
  declare Review?: NonAttribute<User>;

  static initialize = (sequelize: Sequelize) =>
    Comment.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        text: {
          type: DataTypes.STRING(1000),
          allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
      },
      {
        sequelize,
        indexes: [
          {
            name: "comtext_fts",
            fields: ["text"],
          },
        ],
      }
    );
}

export default Comment;
