import express from "express";
import {
  createPage,
  getAllPages,
  getPageById,
  updatePageStatus,
  updatePage,
  getAllPagesWeb,
  getPageBySlug,
} from "../controllers/pageController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
import uploadSingleImage from "../middleware/uploadHandler.js";

const router = express.Router();


// this is use for web
router.get("/get/web/:id", getPageById);
router.get("/get/slug/:slug", getPageBySlug);
router.get("/get/web", getAllPagesWeb);

// router.post("/create", authMiddleware, upload.single("photo"), createPage);
router.post("/create", authMiddleware, uploadSingleImage, createPage);
router.get("/allPage", authMiddleware, getAllPages);
router.put("/status/:id", authMiddleware, updatePageStatus);
router.put("/update/:id", authMiddleware, uploadSingleImage, updatePage);

export default router;
