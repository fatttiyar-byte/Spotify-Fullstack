
import express, { type Response } from "express";

import { registerUser } from "./controller/register.js";
import { loginUser } from "./controller/login.js";
import { myProfile } from "./controller/profile.js";
import isAuth, { type AuthenticatedRequest } from "./middleware.js";

import {
  addToPlaylist,
  getPlaylist,
  removeFromPlaylist,
} from "./controller/playlist.js";

import { logoutUser } from "./controller/logout.js";
import { updateProfile } from "./controller/updateprofile.js";
import { changePassword } from "./controller/changepassword.js";

import {
  addToFavorites,
  getFavorites,
  removeFromFavorites,
} from "./controller/favorite.js";

import {
  uploadProfileImage,
  deleteProfileImage,
} from "./controller/profileImage.js";

import { uploadProfileImageMiddleware } from "./controller/upload.js";

import { User } from "./model.js";

export const router = express.Router();

// Authentication
router.post("/user/register", registerUser);
router.post("/user/login", loginUser);
router.get("/user/me", isAuth, myProfile);

// Playlist
router.post("/user/playlist/:songId", isAuth, addToPlaylist);
router.get("/user/playlist", isAuth, getPlaylist);
router.delete("/user/playlist/:songId", isAuth, removeFromPlaylist);

// Favorites
router.post("/user/favorites/:songId", isAuth, addToFavorites);
router.get("/user/favorites", isAuth, getFavorites);
router.delete("/user/favorites/:songId", isAuth, removeFromFavorites);

// Profile
router.put("/user/update-profile", isAuth, updateProfile);
router.put("/user/change-password", isAuth, changePassword);

// Profile Image
router.put(
  "/user/profile-image",
  isAuth,
  uploadProfileImageMiddleware,
  uploadProfileImage
);

router.delete(
  "/user/profile-image",
  isAuth,
  deleteProfileImage
);

// Logout
router.post("/user/logout", isAuth, logoutUser);

// Admin: Get all users
router.get(
  "/user/admin/users",
  isAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user || req.user.role !== "admin") {
        res.status(403).json({
          success: false,
          message: "شما دسترسی ادمین ندارید.",
        });
        return;
      }

      const users = await User.find()
        .select("-password -tokenVersion")
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      console.error("Get admin users error:", error);

      res.status(500).json({
        success: false,
        message: "خطا در دریافت کاربران",
      });
    }
  }
);

export default router;
