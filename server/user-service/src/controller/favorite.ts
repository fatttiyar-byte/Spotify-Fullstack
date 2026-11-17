
import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware.js";

// افزودن آهنگ به علاقه‌مندی‌ها
export const addToFavorites = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    const { songId } = req.params;

    if (!user) {
      res.status(401).json({
        success: false,
        message: "ابتدا وارد حساب کاربری شوید.",
      });
      return;
    }

    if (!songId) {
      res.status(400).json({
        success: false,
        message: "شناسه آهنگ ارسال نشده است.",
      });
      return;
    }

    if (user.favorites.includes(songId)) {
      res.status(409).json({
        success: false,
        message: "این آهنگ قبلاً به علاقه‌مندی‌ها اضافه شده است.",
      });
      return;
    }

    user.favorites.push(songId);
    await user.save();

    res.status(200).json({
      success: true,
      message: "آهنگ به علاقه‌مندی‌ها اضافه شد.",
      favorites: user.favorites,
    });
  } catch (error) {
    console.error("Add favorite error:", error);

    res.status(500).json({
      success: false,
      message: "خطا در افزودن آهنگ به علاقه‌مندی‌ها.",
    });
  }
};

// دریافت آهنگ‌های موردعلاقه
export const getFavorites = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: "ابتدا وارد حساب کاربری شوید.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      favorites: user.favorites ?? [],
    });
  } catch (error) {
    console.error("Get favorites error:", error);

    res.status(500).json({
      success: false,
      message: "خطا در دریافت علاقه‌مندی‌ها.",
    });
  }
};

// حذف آهنگ از علاقه‌مندی‌ها
export const removeFromFavorites = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    const { songId } = req.params;

    if (!user) {
      res.status(401).json({
        success: false,
        message: "ابتدا وارد حساب کاربری شوید.",
      });
      return;
    }

    user.favorites = (user.favorites ?? []).filter(
      (id) => id !== songId
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: "آهنگ از علاقه‌مندی‌ها حذف شد.",
      favorites: user.favorites,
    });
  } catch (error) {
    console.error("Remove favorite error:", error);

    res.status(500).json({
      success: false,
      message: "خطا در حذف آهنگ از علاقه‌مندی‌ها.",
    });
  }
};
