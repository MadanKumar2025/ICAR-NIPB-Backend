import express from "express";
import {
  createNews,
  getAllNews,
  updateNews,
  updateNewsStatus,
  getAllNewsWeb,getNewsByType,
  deleteNews
} from "../controllers/newsController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import uploadAll from "../middleware/uploadAll.js";

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  uploadAll.single("documentFile"),
  createNews,
);
router.get("/get", authMiddleware, getAllNews);
router.put(
  "/update/:id",
  authMiddleware,
  uploadAll.single("documentFile"),
  updateNews,
);

router.delete(
  "/delete/:id",
  authMiddleware,
  deleteNews
);

router.put("/status/:id", authMiddleware, updateNewsStatus);

// This is use for web
router.get("/get/web", getAllNewsWeb);
router.get("/get/web/:type", getNewsByType);
export default router;
