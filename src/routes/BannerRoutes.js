import express from "express";
import {
  createBanner,
  getAllBanners,
  updateBannerStatus,
  updateBanner,
  getAllBannerWeb,
  deleteBanner,
} from "../controllers/BannerController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import uploadSingleImage from "../middleware/uploadHandler.js";

const router = express.Router();

// Create Banner
router.post("/create", authMiddleware, uploadSingleImage, createBanner);
router.get("/getAll", authMiddleware, getAllBanners);
router.put("/updateStatus/:id", authMiddleware, updateBannerStatus);
router.put(
  "/updateBanner/:id",
  authMiddleware,
  uploadSingleImage,
  updateBanner,
);
router.delete(
  "/delete/:id",
  authMiddleware,
  deleteBanner
);

// this is use for web
router.get("/get/web", getAllBannerWeb);
export default router;
