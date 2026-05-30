import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuid } from "uuid";
import { createHttpError } from "../utils/createHttpError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "..", "..", "uploads");

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp"
]);

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, `${uuid()}${extension}`);
  }
});

export const uploadDocuments = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024,
    files: 5
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(createHttpError(400, "Only PDF, JPG, PNG, and WEBP files are supported"));
      return;
    }

    cb(null, true);
  }
});
