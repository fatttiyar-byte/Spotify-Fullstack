import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware.js";
import Trycatch from "../Trycatch.js";

export const logoutUser = Trycatch(
  async (req: AuthenticatedRequest, res: Response) => {

    const user = req.user;

    if (!user) {
      res.status(401).json({
        message: "ابتدا وارد حساب کاربری شوید."
      });
      return;
    }

    user.tokenVersion += 1;

    await user.save();

    res.status(200).json({
      success: true,
      message: "با موفقیت از حساب کاربری خارج شدید."
    });
  }
);