

import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

import connectDB from "./config/db.js";
import "./config/cloudinary.js";
import userRoute from "./route.js";



// app.use(بدون هاست
//   cors({
//     origin: [
//       "http://localhost:5173",
//       "http://127.0.0.1:5173",
//     ],
//     credentials: true,
//   })
// );

const app = express();

const allowedOrigins: string[] = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://topmusic-frontend.onrender.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("TopMusic User Service is running!");
});

app.use("/api/v1", userRoute);
