import express = require("express");
import cookieSession from "cookie-session";
import cookieParser from "cookie-parser"; // parse cookie header
import passport from "passport";
import "./passport";
import { User, Review, Comment } from "./models/allModels";
import logger from "./logger";
import auth from "./routes/authRoutes";
import { Op, QueryTypes, where } from "sequelize";
import sequelize from "./sequelize";
import "dotenv/config";

const app = express();
app.use(express.json());
app.use(express.static(__dirname + "/../dist/public"));
app.use(cookieParser());
app.use(
  cookieSession({
    name: "session",
    secret: process.env.COOKIE_SECRET,
    maxAge: 24 * 60 * 60 * 1000,
  })
);
app.use(passport.initialize());
app.use(passport.session());

if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
}

// Bug workaround: register regenerate & save after the cookieSession middleware initialization
app.use(function (request, response, next) {
  if (request.session && !request.session.regenerate) {
    request.session.regenerate = (cb: () => void) => {
      cb();
    };
  }
  if (request.session && !request.session.save) {
    request.session.save = (cb: () => void) => {
      cb();
    };
  }
  next();
});

app.use("/auth", auth);
app.get("/api/me", (req, res) => {
  User.findByPk(req.user?.id, {
    attributes: { exclude: ["hashedPassword", "salt"] },
  }).then((user) => {
    res.status(200).json({
      authenticated: req.isAuthenticated(),
      user: user,
      cookies: req.cookies,
      session: req.session,
    });
  });
});

app.post("/api/search", async (req, res) => {
  console.log(req.body.json);
  const searchResults = await Review.findAll({
    where: {
      vector: {
        [Op.match]: sequelize.fn("plainto_tsquery", "english", req.body.search),
      },
    },
    order: [
      [
        sequelize.fn(
          "ts_rank",
          sequelize.col("vector"),
          sequelize.fn("plainto_tsquery", "english", req.body.search)
        ),
        "DESC",
      ],
    ],
    limit: 10,
  });

  res.json(searchResults);
});

app.get("/api/review/:reviewid", async (req, res) => {
  res.json(
    await Review.findByPk(req.params.reviewid, {
      include: [
        { model: User, attributes: ["username", "avatar"] },
        { model: Comment, attributes: ["id"] },
      ],
    })
  );
});

app.post("/api/comments", (req, res) => {
  if (!req.user) res.sendStatus(401);
  req.user?.createComment({
    text: req.body.text,
    ReviewId: req.body.ReviewId,
  });
  res.send("yo");
});

app.get("*", (req, res) => {
  res.sendFile("index.html", { root: __dirname + "/../dist/public/" });
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Express: Server is listening on port ${PORT}`);
});
