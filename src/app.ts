import express from "express";
import type{ Request,Response } from "express";
import morgan from "morgan";
import authRoute from "./routes/auth.routes.ts"
import cookieParser from 'cookie-parser';

const app = express();


//middlewares
app.use(express.json());
app.use(cookieParser()); 
app.use(morgan("dev"));


//routes
app.use("/api/auth/",authRoute);

export default app;