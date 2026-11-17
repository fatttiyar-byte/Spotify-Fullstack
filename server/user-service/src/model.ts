
import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  playlist: string[];
  tokenVersion: number;
  favorites: string[];
  profileImage: string;
}

const schema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },

    profileImage: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    tokenVersion: {
      type: Number,
      default: 0,
    },

    playlist: {
      type: [String],
      default: [],
    },

    favorites: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", schema);
