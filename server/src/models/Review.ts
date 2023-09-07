import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManySetAssociationsMixin,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
  Sequelize,
} from "sequelize";
import User from "./User";
import Comment from "./Comment";
import Tag from "./Tag";
import Like from "./Like";
import Review_Image from "./Review_Image";
import Product from "./Product";

class Review extends Model<
  InferAttributes<Review>,
  InferCreationAttributes<Review>
> {
  declare id: CreationOptional<number>;
  declare rating: number;
  declare title: string;
  declare text: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare vector: CreationOptional<string>;

  declare ProductId: ForeignKey<Product["id"]>;
  declare UserId: ForeignKey<User["id"]>;
  declare Product?: NonAttribute<Product>;
  declare User?: NonAttribute<User>;
  declare Likes?: NonAttribute<Like[]>;
  declare Review_Images?: NonAttribute<Review_Image[]>;
  declare likesCount?: NonAttribute<number>;

  declare getComments: HasManyGetAssociationsMixin<Comment>;
  declare addComment: HasManyAddAssociationMixin<Comment, number>;
  declare addComments: HasManyAddAssociationsMixin<Comment, number>;
  declare setComments: HasManySetAssociationsMixin<Comment, number>;
  declare removeComment: HasManyRemoveAssociationMixin<Comment, number>;
  declare removeComments: HasManyRemoveAssociationsMixin<Comment, number>;
  declare hasComment: HasManyHasAssociationMixin<Comment, number>;
  declare hasComments: HasManyHasAssociationsMixin<Comment, number>;
  declare countComments: HasManyCountAssociationsMixin;
  declare createComment: HasManyCreateAssociationMixin<Comment, "UserId">;

  declare setTags: HasManySetAssociationsMixin<Tag, number>;
  declare addTags: HasManyAddAssociationsMixin<Tag, number>;
  declare createTag: HasManyCreateAssociationMixin<Tag, "name">;

  static initialize = (sequelize: Sequelize) =>
    Review.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        title: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        text: {
          type: DataTypes.STRING(2000),
          allowNull: false,
        },
        rating: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
        vector: {
          type: DataTypes.TSVECTOR,
        },
      },
      {
        sequelize,
        indexes: [
          {
            name: "revtext_fts",
            fields: ["vector"],
            using: "GIN",
          },
        ],
      }
    );
}

export default Review;
