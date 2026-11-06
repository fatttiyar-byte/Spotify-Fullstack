import cloudinary from "./cloudinary.js"
import { Readable } from "stream"

export const uploadBuffer = (buffer: Buffer, options: Record<string, unknown>) =>
  new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) =>
      err || !result ? reject(err) : resolve(result)
    )
    Readable.from(buffer).pipe(stream)
  })