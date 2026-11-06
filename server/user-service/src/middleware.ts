import jwt, { type JwtPayload } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { User, type IUser } from "./model.js";

export interface AuthenticatedRequest extends Request {
  user?: IUser | null;
}

const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // دریافت توکن از هدر درخواست
    const token = req.headers.token as string;

    if (!token) {
      res.status(401).json({
        message: "لطفاً ابتدا وارد حساب کاربری شوید."
      });
      return;
    }

    // بررسی وجود JWT_SECRET
    const JWT_SEC = process.env.JWT_SEC;

    if (!JWT_SEC) {
      throw new Error("JWT_SEC در فایل env تعریف نشده است.");
    }

    // بررسی اعتبار توکن و دریافت اطلاعات آن
    const decoded = jwt.verify(token, JWT_SEC) as JwtPayload;

    if (!decoded || !decoded._id) {
      res.status(401).json({
        message: "توکن نامعتبر است."
      });
      return;
    }

    // پیدا کردن کاربر بر اساس آیدی داخل توکن
    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
      res.status(401).json({
        message: "کاربر یافت نشد."
      });
      return;
    }

    // بررسی نسخه توکن برای جلوگیری از استفاده مجدد از توکن باطل‌شده
    const currentTokenVersion = user.tokenVersion ?? 0;

    if (decoded.tokenVersion !== currentTokenVersion) {
      res.status(401).json({
        message: "توکن شما باطل شده است. لطفاً دوباره وارد شوید."
      });
      return;
    }

    // ذخیره اطلاعات کاربر در req
    req.user = user;

    next();

  } catch (error) {
    res.status(401).json({
      message: "توکن نامعتبر است یا اعتبار آن به پایان رسیده است."
    });
  }
};

export default isAuth;