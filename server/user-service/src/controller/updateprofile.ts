import type { Response } from "express";
import { User } from "../model.js";
import Trycatch from "../Trycatch.js";
import type { AuthenticatedRequest } from "../middleware.js";

export const updateProfile = Trycatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({
        message: "لطفاً ابتدا وارد حساب کاربری شوید."
      });
      return;
    }

    const { name, email } = req.body;

    if (!name && !email) {
      res.status(400).json({
        message: "اطلاعات جدیدی برای ویرایش ارسال نشده است."
      });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        message: "کاربر یافت نشد."
      });
      return;
    }

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        res.status(400).json({
          message: "نام واردشده معتبر نیست."
        });
        return;
      }

      user.name = name.trim();
    }

    if (email !== undefined) {
      if (typeof email !== "string" || !email.trim()) {
        res.status(400).json({
          message: "ایمیل واردشده معتبر نیست."
        });
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();

      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: userId }
      });

      if (existingUser) {
        res.status(409).json({
          message: "این ایمیل قبلاً ثبت شده است."
        });
        return;
      }

      user.email = normalizedEmail;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "پروفایل با موفقیت ویرایش شد.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  }
);