import express from "express";
import { Review, Like, Tag, Review_Image } from "../sequelize/models/allModels";
import { Op } from "sequelize";
import { StatusCodes } from "http-status-codes";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import { adminOrAuthor, authenticated } from "./handlers";
import puppeteer from "puppeteer";
import getReviews from "../sequelize/queries/getReviews";
import getReviewById from "../sequelize/queries/getReviewById";
import {
  body,
  matchedData,
  oneOf,
  param,
  query,
  validationResult,
} from "express-validator";
import comments from "./comments";

cloudinary.config({
  cloud_name: "dxb2qepsn",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({});
const reviews = express.Router();

reviews.get(
  "/",
  query("limit").optional().isInt().toInt(),
  query("top").optional(),
  query("cat").optional().isString().notEmpty(),
  oneOf([
    query("tags").optional().isString().notEmpty(),
    query("tags").optional().isArray().notEmpty(),
  ]),
  async (req, res) => {
    const validation = validationResult(req);
    if (!validation.isEmpty())
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ errors: validation.array() });

    const data = matchedData(req);
    const limit: number = data.limit;
    const top = "top" in data;
    const category = data.cat;
    const tags: string | string[] | undefined = data.tags;

    res.send(await getReviews(limit, top, category, tags));
  }
);

reviews.post(
  "/",
  authenticated(),
  body(["title", "text", "rating", "ProductId"]).notEmpty(),
  body("rating").isInt({ min: 1, max: 10 }),
  body("ProductId").isInt(),
  async (req, res) => {
    const validation = validationResult(req);
    if (!validation.isEmpty())
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ errors: validation.array() });

    const data = matchedData(req);
    const reviewAttributes = {
      title: data.title,
      text: data.text,
      rating: data.rating,
      ProductId: data.ProductId,
      UserId: req.user!.id,
    };

    const newReview = await Review.create(reviewAttributes);

    await Review_Image.bulkCreate(
      req.body.gallery.map((img: { src: string }) => {
        return { ...img, ReviewId: newReview.id };
      })
    );

    const newTags = await Promise.all(
      req.body.tags.map(async (tag: string) => {
        const [newTag] = await Tag.findOrCreate({ where: { name: tag } });
        return newTag;
      })
    );

    await newReview.setTags(newTags);

    res.status(200).send(newReview.id.toString());
  }
);

reviews.post(
  "/gallery",
  authenticated(),
  upload.array("gallery"),
  async (req, res) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length == 0) {
      return res.status(StatusCodes.BAD_REQUEST).send("No file was uploaded.");
    }

    files.map((file) => {
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
    });

    const cloudUrls: { src: string | undefined }[] = [];
    files.map((file) => {
      const stream = new Readable({
        read() {
          this.push(file.buffer);
          this.push(null);
        },
      });

      const cldUploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "review_images",
          transformation: {
            format: "jpg",
          },
        },
        function (error, result) {
          cloudUrls.push({ src: result?.secure_url });
          if (cloudUrls.length == files.length) res.json({ urls: cloudUrls });
        }
      );
      stream.pipe(cldUploadStream);
    });
  }
);

reviews.all("/:id*", param("id").isInt().toInt(), async (req, res, next) => {
  const validation = validationResult(req);
  if (!validation.isEmpty())
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ errors: validation.array() });
  else next();
});

reviews.get(
  "/:id",
  query(["user", "gallery", "comments"]).optional(),
  async (req, res) => {
    const data = matchedData(req);

    const review = await getReviewById(
      data.id,
      "user" in data,
      "gallery" in data,
      "comments" in data
    );
    if (!review) res.sendStatus(StatusCodes.NOT_FOUND);
    else res.send(review);
  }
);

reviews.delete("/:id", adminOrAuthor(), async (req, res) => {
  await res.locals.review.destroy();
  res.send("OK");
});

reviews.put("/:id", adminOrAuthor(), async (req, res) => {
  const gallery = await Promise.all(
    req.body.gallery.map(async (image: { id?: number; src: string }) => {
      const [newImage] = await Review_Image.findOrCreate({
        where: {
          ReviewId: res.locals.review.id,
          src: image.src,
        },
      });
      return newImage;
    })
  );

  await Review_Image.destroy({
    where: {
      id: { [Op.notIn]: gallery.map((img) => img.id) },
      ReviewId: res.locals.review.id,
    },
  });

  const newTags = await Promise.all(
    req.body.tags.map(async (tag: string) => {
      const [newTag] = await Tag.findOrCreate({ where: { name: tag } });
      return newTag;
    })
  );

  res.locals.review.set({
    title: req.body.title,
    text: req.body.text,
    rating: req.body.rating,
  });

  await res.locals.review.setTags(newTags);
  await res.locals.review.save();

  res.send("OK");
});

reviews.get("/:id/like", authenticated(), async (req, res) => {
  const findLike = await Like.findOrCreate({
    where: { ReviewId: req.params.id, UserId: req.user!.id },
  });
  const [like, created] = findLike;
  if (!created) like.destroy();

  res.send("OK");
});

async function printPDF(reviewId: string | number) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.emulateMediaFeatures([
    { name: "prefers-color-scheme", value: "light" },
  ]);

  await page.goto(`${process.env.BASE_URL}/reviews/${reviewId}`, {
    waitUntil: "networkidle2",
  });

  const reviewEl = await page.$("main > div.MuiPaper-root");
  if (!reviewEl) {
    await browser.close();
    return false;
  }

  const rootFound = await page.evaluate((reviewEl) => {
    const root: HTMLElement | null = document.querySelector("#root");
    if (!root) return false;
    root.innerHTML = reviewEl.innerHTML;
    root.style.padding = "20px";
    return true;
  }, reviewEl);

  if (!rootFound) {
    await browser.close();
    return false;
  }

  const pdf = await page.pdf({ format: "A4", printBackground: true });

  await browser.close();
  return pdf;
}

reviews.get("/:id/pdf", authenticated(), async (req, res) => {
  const pdf = await printPDF(req.params.id);
  if (!pdf) return res.sendStatus(StatusCodes.NOT_FOUND);
  else
    res
      .set({ "Content-Type": "application/pdf", "Content-Length": pdf.length })
      .send(pdf);
});

reviews.use("/:id/comments", comments);

export default reviews;
