import express from "express";

import {
  createPopup,
  getPopups,
  updatePopup,
  getPopupsWeb,
  updatePopupStatus,
} from "../controllers/PopupController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import uploadSingleImage from "../middleware/uploadHandler.js";

const router = express.Router();

// Admin Routes
router.post("/create", authMiddleware, uploadSingleImage, createPopup);

router.get("/allPopup", authMiddleware, getPopups);

router.put("/updatePopup/:id", authMiddleware, uploadSingleImage, updatePopup);
router.put("/updatePopupStatus/:id", authMiddleware, updatePopupStatus);

// Web Routes
router.get("/get/web", getPopupsWeb);

export default router;
