import express from "express";
import User from "../models/User";
import { StatusCodes } from "http-status-codes";

const users = express.Router();

users.all("/", async (req, res, next) => {
  if (!req.isAuthenticated()) return res.sendStatus(StatusCodes.UNAUTHORIZED);
  const user = await User.findByPk(req.user.id);
  if (!user || user.role != "admin")
    return res.sendStatus(StatusCodes.UNAUTHORIZED);
  else next();
});

users.get("/", (req, res) => {
  User.findAll({ attributes: ["id", "username", "status", "createdAt"] }).then(
    (users) =>
      users.length !== 0
        ? res.json(users)
        : res.status(StatusCodes.NOT_FOUND).send("Unable to find any users")
  );
});

users.delete("/", (req, res) => {
  User.destroy({ where: { id: req.body.id } }).then((count) => {
    res.send(`Removed ${count} users`);
  });
});

users.put("/", (req, res) => {
  if (!req.body.action || !req.body.id) res.sendStatus(405);
  switch (req.body.action) {
    case "block":
      User.update({ status: "banned" }, { where: { id: req.body.id } }).then(
        () => res.sendStatus(200)
      );

      break;
    case "unblock":
      User.update({ status: "active" }, { where: { id: req.body.id } }).then(
        () => res.sendStatus(200)
      );
      break;
    default:
      res.sendStatus(405);
      break;
  }
});

export default users;
