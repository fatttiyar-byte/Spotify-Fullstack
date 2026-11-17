
import cloudinary from "./cloudinary.js";
import { Readable } from "stream";
import type {
  UploadApiOptions,
  UploadApiResponse,
} from "cloudinary";

export const uploadBuffer = (
  buffer: Buffer,
  options: UploadApiOptions
): Promise<UploadApiResponse> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (err, result) => {
        if (err) {
          console.error("Cloudinary upload error:", err);
          return reject(err);
        }

        if (!result) {
          return reject(
            new Error("Cloudinary returned an empty result")
          );
        }

        if (!result.secure_url || !result.public_id) {
          return reject(
            new Error(
              "Cloudinary response is missing secure_url or public_id"
            )
          );
        }

        resolve(result);
      }
    );

    Readable.from(buffer).pipe(stream);
  });
