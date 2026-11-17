

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
];

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("TopMusic User Service is running!");
});

app.use("/api/v1", userRoute);

const port = Number(process.env.PORT) || 3000;

const startServer = async () => {
  try {
    await connectDB();

    // app.listen(port, () => {
    app.listen(port, "0.0.0.0", () => {
      console.log(`User service running on port ${port}`);
      console.log(`API: http://localhost:${port}/api/v1`);
    });
  } catch (error) {
    console.error("Failed to start user service:", error);
    process.exit(1);
  }
};

startServer();
