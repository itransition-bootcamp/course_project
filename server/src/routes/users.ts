import express from "express";
import { Review, User, Like } from "../models/allModels";
import { StatusCodes } from "http-status-codes";

const router = express.Router();

router.get("/me", (req, res) => {
  User.findByPk(req.user?.id, {
    attributes: { exclude: ["hashedPassword", "salt"] },
    include: { model: Like, attributes: ["ReviewId"] },
  }).then((user) => {
    res.json({
      authenticated: req.isAuthenticated(),
      user: user?.sanitize(),
    });
  });
});

router.get("/:id", (req, res) => {
  User.findByPk(req.params.id, {
    attributes: { exclude: ["hashedPassword", "salt"] },
    //@ts-ignore
    include: {
      model: Review,
      attributes: { exclude: ["vector"] },
      include: Like,
    },
  }).then((user) => {
    if (!user) return res.sendStatus(StatusCodes.NOT_FOUND);
    const formated = user?.sanitize();
    formated.Reviews?.forEach((review) => {
      review.likesCount = review.Likes!.length;
    });
    console.log(formated);
    res.send(formated);
  });
});

export default router;
