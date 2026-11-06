import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUrl = process.env.MONGODB_URL;

    if (!mongoUrl) {
      throw new Error("MONGODB_URL is not defined in .env");
    }

    await mongoose.connect(mongoUrl, {
      dbName: "spotifyDb",
    });

    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};

export default connectDB;
