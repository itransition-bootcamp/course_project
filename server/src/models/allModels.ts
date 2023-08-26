import sequelize from "../sequelize";
import Comment from "./Comment";
import Review from "./Review";
import User from "./User";

User.initialize(sequelize);
Review.initialize(sequelize);
Comment.initialize(sequelize);

User.hasMany(Review, {
  foreignKey: { allowNull: false },
  onDelete: "CASCADE",
});
User.hasMany(Comment, {
  foreignKey: { allowNull: false },
  onDelete: "CASCADE",
});

Review.belongsTo(User);
Review.hasMany(Comment, {
  foreignKey: { allowNull: false },
  onDelete: "CASCADE",
});

Comment.belongsTo(User);
Comment.belongsTo(Review);

export { User, Review, Comment };
