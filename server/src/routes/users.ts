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

    include: {
      model: Review,
      attributes: { exclude: ["vector"] },
      include: [Like],
    },
  }).then((user) => {
    if (!user) return res.sendStatus(StatusCodes.NOT_FOUND);
    const formated = user.sanitize();
    formated.Reviews?.map((review) => {
      review.likesCount = review.Likes!.length;
    });
    res.send(formated);
  });
});

router.put("/:id", async (req, res) => {
  if (isNaN(parseInt(req.params.id)))
    return res.sendStatus(StatusCodes.BAD_REQUEST);
  if (!req.isAuthenticated()) return res.sendStatus(StatusCodes.UNAUTHORIZED);
  const me = await User.findByPk(req.user.id);
  const user =
    req.user.id!.toString() == req.params.id
      ? me
      : await User.findByPk(req.params.id);
  if (!user || !me) return res.sendStatus(StatusCodes.NOT_FOUND);
  if (me.id != user.id && me.role != "admin")
    return res.sendStatus(StatusCodes.UNAUTHORIZED);
  if (Object.prototype.hasOwnProperty.call(req.body, "email"))
    user.email = req.body.email;
  if (Object.prototype.hasOwnProperty.call(req.body, "avatar"))
    user.avatar = req.body.avatar;
  if (Object.prototype.hasOwnProperty.call(req.body, "username"))
    user.username = req.body.username;

  await user.save();
  res.send("OK");
});

export default router;
