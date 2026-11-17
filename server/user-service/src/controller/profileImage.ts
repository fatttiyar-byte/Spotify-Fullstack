
import type { Response } from "express";

import cloudinary from "../config/cloudinary.js";

import type { AuthenticatedRequest } from "../middleware.js";

interface UploadedFile {
  buffer: Buffer;
  mimetype: string;
}

// Upload Profile Image
export const uploadProfileImage = async (
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

    const file = req.file as UploadedFile | undefined;

    if (!file) {
      res.status(400).json({
        success: false,
        message: "لطفاً یک تصویر انتخاب کنید.",
      });
      return;
    }

    if (!file.mimetype.startsWith("image/")) {
      res.status(400).json({
        success: false,
        message: "فقط فایل تصویری مجاز است.",
      });
      return;
    }

    if (file.buffer.length > 5 * 1024 * 1024) {
      res.status(400).json({
        success: false,
        message: "حجم تصویر نباید بیشتر از ۵ مگابایت باشد.",
      });
      return;
    }

    const uploadResult = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "topmusic/profile-images",
            public_id: `user-${user._id}`,
            overwrite: true,
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(error);
              return;
            }

            if (!result) {
              reject(new Error("آپلود تصویر ناموفق بود."));
              return;
            }

            resolve({
              secure_url: result.secure_url,
            });
          }
        );

        stream.end(file.buffer);
      }
    );

    user.profileImage = uploadResult.secure_url;

    await user.save();

    res.status(200).json({
      success: true,
      message: "تصویر پروفایل با موفقیت تغییر کرد.",
      profileImage: user.profileImage,
    });
  } catch (error) {
    console.error("Upload profile image error:", error);

    res.status(500).json({
      success: false,
      message: "خطا در آپلود تصویر پروفایل.",
    });
  }
};

// Delete Profile Image
export const deleteProfileImage = async (
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

    if (!user.profileImage) {
      res.status(404).json({
        success: false,
        message: "تصویر پروفایلی برای حذف وجود ندارد.",
      });
      return;
    }

    await cloudinary.uploader.destroy(
      `topmusic/profile-images/user-${user._id}`,
      {
        resource_type: "image",
      }
    );

    user.profileImage = "";

    await user.save();

    res.status(200).json({
      success: true,
      message: "تصویر پروفایل با موفقیت حذف شد.",
      profileImage: "",
    });
  } catch (error) {
    console.error("Delete profile image error:", error);

    res.status(500).json({
      success: false,
      message: "خطا در حذف تصویر پروفایل.",
    });
  }
};