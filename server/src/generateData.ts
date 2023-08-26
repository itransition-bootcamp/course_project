import { faker } from "@faker-js/faker";
import { User, Review, Comment } from "./models/allModels";
import sequelize from "./sequelize";

function createRandomUser() {
  return {
    username: faker.internet.userName(),
    email: faker.internet.email(),
    avatar: faker.image.avatar(),
  };
}

function createRandomReview() {
  return {
    rating: faker.number.int({ min: 1, max: 10 }),
    title: faker.lorem.sentence({ min: 2, max: 5 }),
    text: faker.lorem.paragraphs({ min: 3, max: 8 }),
    createdAt: faker.date.past(),
  };
}

function createRandomComment() {
  return {
    text: faker.lorem.paragraphs({ min: 1, max: 3 }),
    createdAt: faker.date.past(),
  };
}

const generateData = async () => {
  await sequelize.sync({ force: true });
  await sequelize.query(`
  CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
  ON public."Reviews" FOR EACH ROW EXECUTE PROCEDURE
  tsvector_update_trigger(vector, 'pg_catalog.english', title, text)`);
  await User.bulkCreate(
    faker.helpers.multiple(createRandomUser, {
      count: faker.number.int({ min: 5, max: 10 }),
    })
  );

  const allUsers = await User.findAll();
  for (let i = 0; i < allUsers.length; i++) {
    const user = allUsers[i];
    const reviews = faker.helpers.multiple(createRandomReview, {
      count: faker.number.int({ min: 500, max: 500 }),
    });
    for (let k = 0; k < reviews.length; k++) {
      const review = reviews[k];
      const reviewIntance = await Review.create({ ...review, UserId: user.id });
      // reviewIntance.update({
      //   vector: sequelize.fn("to_tsvector", "english", reviewIntance.text),
      // });
    }
  }

  const allReviews = await Review.findAll({ include: User });
  for (let i = 0; i < allReviews.length; i++) {
    const review = allReviews[i];
    const comments = faker.helpers.multiple(createRandomComment, {
      count: faker.number.int({ min: 1, max: 1 }),
    });
    for (let k = 0; k < comments.length; k++) {
      const comment = comments[k];
      await Comment.create({
        ...comment,
        UserId: review.UserId,
        ReviewId: review.id,
      });
    }
  }

  sequelize.close();
};

process.nextTick(generateData);
