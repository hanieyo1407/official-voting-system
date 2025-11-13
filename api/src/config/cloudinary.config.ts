// api/src/config/cloudinary.config.ts

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
// Re-adding dotenv.config() here forces the env load at module import time
// This is non-standard but is the only way to beat execution-order issues.
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export default cloudinary;