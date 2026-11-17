
import multer from "multer";
import type { Request } from "express";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    callback: multer.FileFilterCallback
  ) => {
    if (file.mimetype.startsWith("image/")) {
      callback(null, true);
    } else {
      callback(new Error("فقط فایل تصویری مجاز است."));
    }
  },
});

export const uploadProfileImageMiddleware = upload.single("file");
