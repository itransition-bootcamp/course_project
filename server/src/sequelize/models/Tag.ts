import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Model,
  Sequelize,
} from "sequelize";

class Tag extends Model<InferAttributes<Tag>, InferCreationAttributes<Tag>> {
  declare id: CreationOptional<number>;
  declare name: string;
  static initialize = (sequelize: Sequelize) =>
    Tag.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(20),
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: false,
      }
    );
}

export default Tag;
