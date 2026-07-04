// import multer from "multer";
// import path from "path";
// import fs from "fs";

// const uploadDir = "uploads/";

// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueName =
//       Date.now() +
//       "-" +
//       Math.round(Math.random() * 1e9) +
//       path.extname(file.originalname);

//     cb(null, uniqueName);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp","application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",];

//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only JPG, PNG, WEBP images , DOC/DOCX and Pdf are allowed"), false);
//   }
// };

// const upload = multer({
//   storage,
//   limits: {
//     fileSize: 50 * 1024 * 1024,
//   },
//   fileFilter,
// });

// export default upload;


import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/";

// create uploads folder if not exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// storage config
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

// allowed file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    // images
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",

    // pdf
    "application/pdf",

    // doc
    "application/msword",

    // docx
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, PNG, WEBP images, PDF, DOC, DOCX files are allowed"
      ),
      false
    );
  }
};

// multer config
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter,
});

export default upload;