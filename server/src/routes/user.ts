import express from "express";
import { StatusCodes } from "http-status-codes";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import multer from "multer";
import { authorized } from "./handlers";
import getUserMe from "../sequelize/queries/getUserMe";
import getUserById from "../sequelize/queries/getUserById";
import { body, matchedData, param, validationResult } from "express-validator";
const upload = multer({});

cloudinary.config({
  cloud_name: "dxb2qepsn",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const user = express.Router();

user.get("/me", (req, res) => {
  if (!req.user || !req.user.id) {
    req.session = null;
    return res.status(StatusCodes.OK).json({
      authenticated: false,
    });
  }
  getUserMe(req.user.id).then((user) => {
    if (!user || user.status == "banned") {
      req.session = null;
      return res.json({
        authenticated: false,
      });
    }
    res.json({
      authenticated: req.isAuthenticated(),
      user: user,
    });
  });
});

user.get("/:id", param("id").isInt().toInt(), (req, res) => {
  const validation = validationResult(req);
  if (!validation.isEmpty())
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ errors: validation.array() });

  getUserById(matchedData(req).id).then((user) => {
    if (!user) return res.sendStatus(StatusCodes.NOT_FOUND);
    const formated = user.sanitize();
    formated.Reviews?.map((review) => {
      review.likesCount = review.Likes!.length;
    });
    res.send(formated);
  });
});

user.put(
  "/:id",
  param("id").isInt().toInt(),
  body("email")
    .optional()
    .if(body("email").notEmpty())
    .isEmail()
    .normalizeEmail({ all_lowercase: true }),
  body("avatar").optional().isURL(),
  body("username")
    .optional()
    .trim()
    .matches(/^[A-Za-z0-9._]+$/),
  authorized(),
  async (req, res) => {
    const validation = validationResult(req);
    if (!validation.isEmpty())
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ errors: validation.array() });

    const data = matchedData(req);

    if ("email" in data)
      req.user!.email = data.email === "" ? null : data.email;
    if ("avatar" in data)
      req.user!.avatar = data.avatar === "" ? null : data.avatar;
    if ("username" in data)
      req.user!.username = data.username === "" ? null : data.username;

    await req.user!.save!();
    res.send("OK");
  }
);

user.post(
  "/:id/avatar",
  param("id").isInt().toInt(),
  authorized(),
  upload.single("avatar"),
  async (req, res) => {
    const validation = validationResult(req);
    if (!validation.isEmpty())
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ errors: validation.array() });

    const file = req.file;
    if (!file) {
      return res.status(StatusCodes.BAD_REQUEST).send("No file was uploaded.");
    }
    const maxSizeMB = 3;
    if (file.size > 1024 * 1024 * maxSizeMB) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(`Size exceeded ${maxSizeMB} MB`);
    }

    if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/png") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send("File format is incorrect.");
    }

    const stream = new Readable({
      read() {
        this.push(file.buffer);
        this.push(null);
      },
    });

    const cldUploadStream = cloudinary.uploader.upload_stream(
      {
        transformation: {
          crop: "fill",
          width: 250,
          height: 250,
          format: "jpg",
        },
      },
      function (error, result) {
        res.json({ url: result?.secure_url });
      }
    );
    stream.pipe(cldUploadStream);
  }
);

export default user;
