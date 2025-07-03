import express from "express";
import { config } from "dotenv";
import { dbConnection } from "./database/dbConnection.js";
import jobRouter from "./router/jobRouter.js";
import userRouter from "./router/userRouter.js";
import applicationRouter from "./router/applicationRouter.js";
import adminRouter from "./router/adminRouter.js";
import linkedinRouter from "./router/linkedinRouter.js";
import cors from "cors";
import { errorMiddleware } from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";

const app = express();
config({ path: "./config/config.env" });

app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    method: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/job", jobRouter);
app.use("/api/v1/application", applicationRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/linkedin", linkedinRouter);
dbConnection();

app.use(errorMiddleware);
export default app;