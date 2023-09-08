import express from "express";
import passport from "passport";
import { User } from "../models/allModels";
import crypto from "crypto";
import logger from "../logger";
import { StatusCodes } from "http-status-codes";
const auth = express.Router();

auth.post("/login", (req, res, next) => {
  passport.authenticate(
    "local",
    function (err: Error, user: User, message: { message: string }) {
      if (err) {
        return next(err);
      } else if (message) {
        return res.status(StatusCodes.BAD_REQUEST).json(message);
      } else
        req.logIn(user, function (err) {
          if (err) {
            return next(err);
          }
          return res.json({
            user: user,
          });
        });
    }
  )(req, res);
});

auth.post("/register", async (req, res, next) => {
  const data = req.body;
  if (data.username == "" || data.password == "")
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Username or password can't be empty" });

  const userDB = await User.findOne({ where: { username: data.username } });
  if (userDB) {
    res.status(StatusCodes.CONFLICT).json({ message: "User already exists!" });
  } else {
    const salt = crypto.randomBytes(16).toString("base64");
    const hashedPassword = crypto
      .pbkdf2Sync(data.password, salt, 1000, 32, "sha256")
      .toString("base64");

    const newUser = await User.create({
      username: data.username,
      hashedPassword: hashedPassword,
      salt: salt,
    });
    req.logIn(newUser, function (err) {
      if (err) {
        return next(err);
      }
      return res.json({
        user: newUser,
      });
    });
  }
});

auth.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
  function () {
    // The request will be redirected to GitHub for authentication, so this
    // function will not be called.
  }
);

auth.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/auth/github",
  }),
  function (req, res) {
    res.redirect("/");
  }
);

auth.all("/logout", (req, res, next) => {
  if (req.isAuthenticated()) {
    req.logout((err) => {
      if (err) {
        logger.error(err);
        return next(err);
      }
      res.redirect("/login");
    });
  } else
    res.status(StatusCodes.FORBIDDEN).send("You are already not logged in");
});

export default auth;
