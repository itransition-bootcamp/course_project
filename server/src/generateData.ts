import { faker, fakerEN } from "@faker-js/faker";
import {
  User,
  Review,
  Comment,
  Tag,
  Review_Image,
  Product,
} from "./models/allModels";
import crypto from "crypto";
import sequelize from "./sequelize";

enum Categories {
  Movie = "Movie",
  Book = "Book",
  Videogame = "Videogame",
}

function createRandomProduct() {
  return {
    category: fakerEN.helpers.enumValue(Categories),
    name: fakerEN.music.songName(),
    poster: fakerEN.image.urlLoremFlickr({ category: "media" }),
  };
}

function createRandomUser() {
  return {
    username: faker.internet.userName(),
    email: faker.internet.email(),
    avatar: faker.image.avatar(),
    createdAt: faker.date.past(),
  };
}

function createRandomReview(allProducts: Product[]) {
  return {
    rating: faker.number.int({ min: 1, max: 10 }),
    title: fakerEN.lorem.sentence({ min: 2, max: 5 }),
    text: fakerEN.lorem.paragraphs({ min: 3, max: 8 }, "\n\r"),
    createdAt: faker.date.past(),
    ProductId: fakerEN.helpers.arrayElement(allProducts).id,
  };
}

function createRandomComment() {
  return {
    text: fakerEN.lorem.paragraphs({ min: 1, max: 3 }),
    createdAt: faker.date.past(),
  };
}

function createRandomReviewImage() {
  return {
    src: fakerEN.image.urlLoremFlickr({ category: "movie" }),
  };
}

function createRandomTag() {
  return {
    name: fakerEN.word.noun(),
  };
}

async function generateUser(
  username: string,
  password: string,
  role: "admin" | "user"
) {
  const salt = crypto.randomBytes(16).toString("base64");
  const hashedPassword = crypto
    .pbkdf2Sync(password, salt, 1000, 32, "sha256")
    .toString("base64");

  await User.create({
    username: username,
    email: faker.internet.email(),
    avatar: faker.image.avatar(),
    role: role,
    salt: salt,
    hashedPassword: hashedPassword,
    createdAt: faker.date.past(),
  });
}

const generateData = async () => {
  await sequelize.sync({ force: true });
  await sequelize.query(`
  CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
  ON public."Reviews" FOR EACH ROW EXECUTE PROCEDURE
  tsvector_update_trigger(vector, 'pg_catalog.english', title, text)`);
  await sequelize.query(`
  CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
  ON public."Comments" FOR EACH ROW EXECUTE PROCEDURE
  tsvector_update_trigger(vector, 'pg_catalog.english', text)`);

  await Product.bulkCreate(
    faker.helpers.multiple(createRandomProduct, {
      count: 10,
    })
  );

  const allProducts = await Product.findAll();

  await User.bulkCreate(
    faker.helpers.multiple(createRandomUser, {
      count: faker.number.int({ min: 5, max: 10 }),
    })
  );

  const allUsers = await User.findAll();
  for (let i = 0; i < allUsers.length; i++) {
    const user = allUsers[i];
    const reviews = faker.helpers.multiple(
      () => createRandomReview(allProducts),
      {
        count: faker.number.int({ min: 2, max: 5 }),
      }
    );
    for (let k = 0; k < reviews.length; k++) {
      const review = reviews[k];
      await user.createReview(review);
    }
  }

  const allReviews = await Review.findAll({ include: User });
  for (let i = 0; i < allReviews.length; i++) {
    const review = allReviews[i];
    const comments = faker.helpers.multiple(createRandomComment, {
      count: faker.number.int({ min: 1, max: 4 }),
    });
    for (let k = 0; k < comments.length; k++) {
      const comment = comments[k];
      await Comment.create({
        ...comment,
        UserId: faker.helpers.arrayElement(allUsers).id,
        ReviewId: review.id,
      });
    }
    const reviewImages = faker.helpers.multiple(createRandomReviewImage, {
      count: faker.number.int({ min: 1, max: 4 }),
    });
    for (let k = 0; k < reviewImages.length; k++) {
      const reviewImage = reviewImages[k];
      await Review_Image.create({
        ...reviewImage,
        ReviewId: review.id,
      });
    }
  }

  await Tag.bulkCreate(faker.helpers.multiple(createRandomTag, { count: 10 }));
  const allTags = await Tag.findAll();
  for (let i = 0; i < allReviews.length; i++) {
    const review = allReviews[i];
    await review.setTags(
      faker.helpers.arrayElements(allTags, { min: 0, max: 5 })
    );
  }

  await generateUser("Adam", "123", "admin");
  await generateUser("Eve", "123", "user");

  sequelize.close();
};

process.nextTick(generateData);
