import { Sequelize } from "sequelize";
import logger from "../logger";
import "./models/allModels";
import "dotenv/config";

if (!process.env.DB_URI)
  throw new Error("Missing 'DB_URI' enviroment variable");

const sequelize = new Sequelize(process.env.DB_URI, {
  // ssl: true,
  benchmark: true,
  logging: (msg, execTime) =>
    logger.debug(msg + " Execution time: " + execTime + " ms"),
});

export default sequelize;
