import {
  CreationOptional,
  DataTypes,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManySetAssociationsMixin,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import Review from "./Review";
import Comment from "./Comment";

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare githubId: string | null;
  declare twitterId: string | null;
  declare email: string | null;
  declare username: string;
  declare hashedPassword: string | null;
  declare salt: string | null;
  declare avatar: string | null;
  declare role: CreationOptional<"admin" | "user">;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare getReviews: HasManyGetAssociationsMixin<Review>;
  declare addReview: HasManyAddAssociationMixin<Review, number>;
  declare addReviews: HasManyAddAssociationsMixin<Review, number>;
  declare setReviews: HasManySetAssociationsMixin<Review, number>;
  declare hasReview: HasManyHasAssociationMixin<Review, number>;
  declare hasReviews: HasManyHasAssociationsMixin<Review, number>;
  declare countReviews: HasManyCountAssociationsMixin;
  declare createReview: HasManyCreateAssociationMixin<Review, "UserId">;

  declare getComments: HasManyGetAssociationsMixin<Comment>;
  declare addComment: HasManyAddAssociationMixin<Comment, number>;
  declare addComments: HasManyAddAssociationsMixin<Comment, number>;
  declare setComments: HasManySetAssociationsMixin<Comment, number>;
  declare hasComment: HasManyHasAssociationMixin<Comment, number>;
  declare hasComments: HasManyHasAssociationsMixin<Comment, number>;
  declare countComments: HasManyCountAssociationsMixin;
  declare createComment: HasManyCreateAssociationMixin<Comment, "UserId">;

  static initialize = (sequelize: Sequelize) =>
    User.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        githubId: {
          type: DataTypes.STRING(16),
          unique: true,
        },
        twitterId: {
          type: DataTypes.STRING(16),
          unique: true,
        },
        email: {
          type: DataTypes.STRING(60),
          unique: true,
        },
        username: {
          type: DataTypes.STRING(30),
          unique: true,
          allowNull: false,
        },
        hashedPassword: {
          type: DataTypes.CHAR(44),
        },
        salt: {
          type: DataTypes.CHAR(24),
        },
        avatar: {
          type: DataTypes.STRING(127),
        },
        role: {
          type: DataTypes.ENUM("admin", "user"),
          allowNull: false,
          defaultValue: "user",
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
      },
      { sequelize }
    );
}

export default User;
