import { User, Like, Product, Review } from "../models/allModels";

export default async function getUserById(id: number | string) {
  return User.findByPk(id, {
    attributes: { exclude: ["hashedPassword", "salt"] },

    include: {
      model: Review,
      attributes: { exclude: ["vector"] },
      include: [Like, Product],
    },
  });
}
