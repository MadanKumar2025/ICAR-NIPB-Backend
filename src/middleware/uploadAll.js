import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/files/";

// Check if folder exists, if not create it
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const uploadAll = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 1024 * 2, // 2GB
  },
});

export default uploadAll;
