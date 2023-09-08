import express from "express";
import { StatusCodes } from "http-status-codes";
import { Product } from "../models/allModels";

const products = express.Router();

products.get("/", (req, res) => {
  Product.findAll({ attributes: ["id", "category", "name"] }).then((products) =>
    products.length !== 0
      ? res.json(products)
      : res.status(StatusCodes.NOT_FOUND).send("Unable to find any products")
  );
});

export default products;
