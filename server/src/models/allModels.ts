import sequelize from "../sequelize";
import User from "./User";
import Review from "./Review";
import Comment from "./Comment";
import Like from "./Like";
import Tag from "./Tag";
import Product from "./Product";
import Review_Image from "./Review_Image";

User.initialize(sequelize);
Review.initialize(sequelize);
Comment.initialize(sequelize);
Like.initialize(sequelize);
Tag.initialize(sequelize);
Review_Image.initialize(sequelize);
Product.initialize(sequelize);

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
Review.hasMany(Review_Image, {
  foreignKey: { allowNull: false },
  onDelete: "CASCADE",
});
Review.belongsToMany(Tag, { through: Review_Tag });
Review.belongsTo(Product);

Tag.belongsToMany(Review, { through: Review_Tag });

Review_Image.belongsTo(Review);

Product.hasMany(Review, {
  foreignKey: { allowNull: false },
  onDelete: "CASCADE",
});

Comment.belongsTo(User);
Comment.belongsTo(Review);

Like.belongsTo(User);
Like.belongsTo(Review);

// sequelize.sync();
export { User, Review, Review_Image, Comment, Like, Tag, Product };
