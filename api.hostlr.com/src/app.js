import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./startup/routes.js";
import { apiLimiter } from "./services/rateLimiter.service.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
if (process.env.NODE_ENV !== 'test') app.use(apiLimiter);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

routes(app);

export { app };
