import multer from "multer";
import upload from "./upload.js";

const uploadSingleImage = (req, res, next) => {
  upload.single("photo")(req, res, function (err) {
    if (err) {
      // multer error (size etc.)
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      // file type error
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    next();
  });
};

export default uploadSingleImage;