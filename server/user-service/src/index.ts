import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

import connectDB from "./config/db.js";
import "./config/cloudinary.js";
import userRoute from "./route.js";

const app = express();

const PORT = Number(process.env.PORT) || 4000;

const allowedOrigins = [
  // app.use(بدون هاست
//   cors({
//     origin: [
//       "http://localhost:5173",
//       "http://127.0.0.1:5173",
//     ],
//     credentials: true,
//   })
// );
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

// Connect database and start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`User Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start User Service:", error);
    process.exit(1);
  }
};

startServer();
