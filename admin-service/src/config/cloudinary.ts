
import 'dotenv/config'
import type { Request } from "express";
import { v2 as cloudinary } from 'cloudinary'


const cloudName = process.env.CLOUD_NAME;
const apiKey = process.env.CLOUD_API_KEY;
const apiSecret = process.env.CLOUD_API_SECRET;

console.log("Cloudinary env status:", {
    cloudName: !!cloudName,
    apiKey: !!apiKey,
    apiSecret: !!apiSecret,
});

if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are missing");
}

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
});
interface AuthenticateRequest extends Request {
    user?: {
        _id: string;
        role: string;
    }
}

export default cloudinary







