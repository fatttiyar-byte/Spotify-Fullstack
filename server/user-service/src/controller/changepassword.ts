import type { Response } from "express";
import { User } from "../model.js";
import Trycatch from "../Trycatch.js";
import type { AuthenticatedRequest } from "../middleware.js";
import bcrypt from "bcrypt";

export const changePassword = Trycatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({
        message: "لطفاً ابتدا وارد حساب کاربری شوید."
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        message: "رمز عبور فعلی و رمز عبور جدید را وارد کنید."
      });
      return;
    }

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      newPassword.length < 8
    ) {
      res.status(400).json({
        message: "رمز عبور جدید باید حداقل ۸ کاراکتر باشد."
      });
      return;
    }

    // دریافت کاربر به همراه رمز عبور
    const user = await User.findById(userId).select("+password");

    if (!user) {
      res.status(404).json({
        message: "کاربر یافت نشد."
      });
      return;
    }

    // بررسی رمز عبور فعلی
    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      res.status(400).json({
        message: "رمز عبور فعلی اشتباه است."
      });
      return;
    }

    // جلوگیری از انتخاب رمز قبلی
    const samePassword = await bcrypt.compare(
      newPassword,
      user.password
    );

    if (samePassword) {
      res.status(400).json({
        message: "رمز عبور جدید باید با رمز قبلی متفاوت باشد."
      });
      return;
    }

    // رمزنگاری رمز جدید
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;

    // باطل کردن توکن‌های قبلی
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;

    await user.save();

    res.status(200).json({
      success: true,
      message: "رمز عبور با موفقیت تغییر کرد. لطفاً دوباره وارد شوید."
    });
  }
);