import sequelize from "../sequelize";
import Comment from "./Comment";
import Review from "./Review";
import User from "./User";
import Like from "./Like";
import Tag from "./Tag";

User.initialize(sequelize);
Review.initialize(sequelize);
Comment.initialize(sequelize);
Like.initialize(sequelize);
Tag.initialize(sequelize);

const Review_Tag = sequelize.define(
  "Review_Tags",
  {},
  {
    timestamps: false,
  }
);

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
Review.belongsToMany(Tag, { through: Review_Tag });

Tag.belongsToMany(Review, { through: Review_Tag });

Comment.belongsTo(User);
Comment.belongsTo(Review);

Like.belongsTo(User);
Like.belongsTo(Review);

// sequelize.sync();
export { User, Review, Comment, Like, Tag };
