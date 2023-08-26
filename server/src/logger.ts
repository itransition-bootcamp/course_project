import { format, createLogger, transports } from "winston";

const { combine, colorize, timestamp, align, printf } = format;
const customFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
  level: "debug",
  format: combine(
    colorize(),
    align(),
    timestamp({
      format: "HH:mm:ss",
    }),
    customFormat
  ),
  transports: [new transports.Console()],
});

export default logger;
