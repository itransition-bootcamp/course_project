import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Model,
  Sequelize,
  NonAttribute,
} from "sequelize";
import Review from "./Review";

class Product extends Model<
  InferAttributes<Product>,
  InferCreationAttributes<Product>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare poster: string;
  declare category: "Movie" | "Book" | "Videogame";
  declare Reviews?: NonAttribute<Review[]>;

  static initialize = (sequelize: Sequelize) =>
    Product.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        category: {
          type: DataTypes.ENUM("Movie", "Book", "Videogame"),
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        poster: DataTypes.STRING(150),
      },
      {
        sequelize,
        timestamps: false,
      }
    );
}

export default Product;
