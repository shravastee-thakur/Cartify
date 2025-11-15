import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import multer, { Multer } from "multer";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});
const storage = multer.memoryStorage();

export async function imageUploadUtil(
  file: Buffer
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      { resource_type: "image", folder: "Cartify" },
      (err, result) => {
        if (err) reject(err);
        else resolve(result as UploadApiResponse);
      }
    );

    upload.end(file);
  });
}

const upload: Multer = multer({ storage });

export default upload;
