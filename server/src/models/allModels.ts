import sequelize from "../sequelize";
import Comment from "./Comment";
import Review from "./Review";
import User from "./User";
import Like from "./Like";

User.initialize(sequelize);
Review.initialize(sequelize);
Comment.initialize(sequelize);
Like.initialize(sequelize);

User.hasMany(Review, {
  foreignKey: { allowNull: false },
  onDelete: "CASCADE",
});
User.hasMany(Comment, {
  foreignKey: { allowNull: false },
  onDelete: "CASCADE",
});
User.hasMany(Like, {
  foreignKey: { allowNull: false },
  onDelete: "CASCADE",
});

Review.belongsTo(User);
Review.hasMany(Comment, {
  foreignKey: { allowNull: false },
  onDelete: "CASCADE",
});
Review.hasMany(Like, {
  foreignKey: { allowNull: false },
  onDelete: "CASCADE",
});

Comment.belongsTo(User);
Comment.belongsTo(Review);

Like.belongsTo(User);
Like.belongsTo(Review);

// sequelize.sync({ force: true });
export { User, Review, Comment, Like };
