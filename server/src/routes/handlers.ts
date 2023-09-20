import { RequestHandler } from "express-serve-static-core";
import { StatusCodes } from "http-status-codes";
import Review from "../sequelize/models/Review";
import { User } from "../sequelize/models/allModels";

export function validIdParam(): RequestHandler {
  return async (req, res, next) => {
    if (isNaN(parseInt(req.params.id)))
      return res.sendStatus(StatusCodes.BAD_REQUEST);
    else next();
  };
}

export function authorized(): RequestHandler {
  return async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(StatusCodes.UNAUTHORIZED);
    const me = await User.findByPk(req.user.id);
    const user =
      req.user.id!.toString() == req.params.id
        ? me
        : await User.findByPk(req.params.id);
    if (!user || !me) return res.sendStatus(StatusCodes.NOT_FOUND);
    if (me.id != user.id && me.role != "admin")
      return res.sendStatus(StatusCodes.UNAUTHORIZED);
    else {
      req.user = user;
      next();
    }
  };
}

export function authenticated(): RequestHandler {
  return async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(StatusCodes.UNAUTHORIZED);
    else next();
  };
}

export function adminOrAuthor(): RequestHandler {
  return async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(StatusCodes.UNAUTHORIZED);

    const user = await User.findByPk(req.user.id);
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.sendStatus(StatusCodes.NOT_FOUND);

    const isAdmin = user!.role == "admin";
    const isAuthor = await user?.hasReview(review);
    if (!isAdmin && !isAuthor) return res.sendStatus(StatusCodes.UNAUTHORIZED);

    res.locals.user = user;
    res.locals.review = review;
    next();
  };
}
