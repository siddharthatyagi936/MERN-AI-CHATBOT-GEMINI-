import express from "express";
import { config } from "dotenv";
import morgan from 'morgan'
import appRouter from "./routes/index.js"
import cookieParser from "cookie-parser";
import cors from 'cors'
config();
const app = express();

//middlewares;
app.use(cors({origin:'http://localhost:5173',credentials: true}))
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.urlencoded({ extended: true }));

//remove it in production
app.use(morgan("dev"));

app.use("/api/", appRouter);

export default app;