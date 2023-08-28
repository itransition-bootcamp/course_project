import {
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

class Like extends Model<InferAttributes<Like>, InferCreationAttributes<Like>> {
  declare UserId: ForeignKey<User["id"]>;
  declare ReviewId: ForeignKey<Review["id"]>;

  declare User?: NonAttribute<User>;
  declare Review?: NonAttribute<User>;

  static initialize = (sequelize: Sequelize) =>
    Like.init(
      {
        ReviewId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
        },
        UserId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
        },
      },
      {
        sequelize,
        timestamps: false,
      }
    );
}

export default Like;
