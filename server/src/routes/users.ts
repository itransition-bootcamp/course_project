import express from "express";
import User from "../sequelize/models/User";
import { StatusCodes } from "http-status-codes";
import { admin } from "./handlers";
import { body, matchedData } from "express-validator";

const users = express.Router();

users.all("/", admin());

users.get("/", (req, res) => {
  User.findAll({ attributes: ["id", "username", "status", "createdAt"] }).then(
    (users) =>
      users.length !== 0
        ? res.json(users)
        : res.status(StatusCodes.NOT_FOUND).send("Unable to find any users")
  );
});

users.delete("/", body("id").isInt(), (req, res) => {
  User.destroy({ where: { id: req.body.id } }).then((count) => {
    res.send(`Removed ${count} users`);
  });
});

users.put(
  "/",
  body("action").isIn(["block", "unblock"]),
  body("id").isInt(),
  (req, res) => {
    const data = matchedData(req);
    if (!data.action || !data.id)
      return res.sendStatus(StatusCodes.BAD_REQUEST);
    switch (data.action) {
      case "block":
        User.update({ status: "banned" }, { where: { id: data.id } }).then(() =>
          res.sendStatus(200)
        );

        break;
      case "unblock":
        User.update({ status: "active" }, { where: { id: data.id } }).then(() =>
          res.sendStatus(200)
        );
        break;
      default:
        res.sendStatus(StatusCodes.METHOD_NOT_ALLOWED);
        break;
    }
    return;
  }
);

export default users;
