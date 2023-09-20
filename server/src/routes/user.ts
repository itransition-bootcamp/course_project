import express from "express";
import { StatusCodes } from "http-status-codes";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import multer from "multer";
import { validIdParam, authorized } from "./handlers";
import getUserMe from "../sequelize/queries/getUserMe";
import getUserById from "../sequelize/queries/getUserById";
const upload = multer({});

cloudinary.config({
  cloud_name: "dxb2qepsn",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const user = express.Router();

user.get("/me", (req, res) => {
  if (!req.user || !req.user.id)
    return res.sendStatus(StatusCodes.UNAUTHORIZED);
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

user.get("/:id", validIdParam(), (req, res) => {
  getUserById(req.params.id).then((user) => {
    if (!user) return res.sendStatus(StatusCodes.NOT_FOUND);
    const formated = user.sanitize();
    formated.Reviews?.map((review) => {
      review.likesCount = review.Likes!.length;
    });
    res.send(formated);
  });
});

user.put("/:id", validIdParam(), authorized(), async (req, res) => {
  if (Object.prototype.hasOwnProperty.call(req.body, "email"))
    req.user!.email = req.body.email === "" ? null : req.body.email;
  if (Object.prototype.hasOwnProperty.call(req.body, "avatar"))
    req.user!.avatar = req.body.avatar === "" ? null : req.body.avatar;
  if (Object.prototype.hasOwnProperty.call(req.body, "username"))
    req.user!.username = req.body.username === "" ? null : req.body.username;

  await req.user!.save!();
  res.send("OK");
});

user.post(
  "/:id/avatar",
  validIdParam(),
  authorized(),
  upload.single("avatar"),
  async (req, res) => {
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
