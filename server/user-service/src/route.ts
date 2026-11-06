import express from "express"
import { registerUser } from "./controller/register.js"
import { loginUser } from "./controller/login.js"
import { myProfile } from "./controller/profile.js"
import isAuth from "./middleware.js"
import {addToPlaylist,getPlaylist,removeFromPlaylist,} from "./controller/playlist.js";
import { logoutUser } from "./controller/logout.js"
import { updateProfile } from "./controller/updateprofile.js"
import { changePassword } from "./controller/changepassword.js"
import { User } from "./model.js";
export const router = express.Router()
//استفاده از روتر های اکسپرس برای مسیر یابی

router.post('/user/register' , registerUser)
router.post('/user/login' , loginUser)
router.get('/user/me',isAuth,myProfile)
router.post("/user/playlist/:songId", isAuth, addToPlaylist);
router.get("/user/playlist", isAuth, getPlaylist);
router.delete("/user/playlist/:songId", isAuth, removeFromPlaylist);
router.post("/user/logout", isAuth, logoutUser);
router.put("/user/update-profile", isAuth, updateProfile);
router.put("/user/change-password", isAuth, changePassword);
// دریافت لیست کاربران توسط ادمین
router.get(
  "/user/admin/users",
  isAuth,
  async (req: any, res) => {
    try {
      // بررسی سطح دسترسی
      if (req.user?.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "شما دسترسی ادمین ندارید.",
        });
      }

      const users = await User.find()
        .select("-password -tokenVersion")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      console.error("Get admin users error:", error);

      return res.status(500).json({
        success: false,
        message: "خطا در دریافت کاربران",
      });
    }
  }
);





export default router