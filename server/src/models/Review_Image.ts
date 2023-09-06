import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Model,
  Sequelize,
  ForeignKey,
  NonAttribute,
} from "sequelize";
import Review from "./Review";

class Review_Image extends Model<
  InferAttributes<Review_Image>,
  InferCreationAttributes<Review_Image>
> {
  declare id: CreationOptional<number>;
  declare src: string;

  declare ReviewId: ForeignKey<Review["id"]>;
  declare Review?: NonAttribute<Review>;
  static initialize = (sequelize: Sequelize) =>
    Review_Image.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        src: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: false,
      }
    );
}

export default Review_Image;
