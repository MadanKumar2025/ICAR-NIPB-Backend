import express from "express";
import {
  createAboutCentre,
  getAboutCentre,
  updateAboutCentre,
  getAllAboutCentreWeb,
} from "../controllers/aboutCentreController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import uploadSingleImage from "../middleware/uploadHandler.js";

const router = express.Router();

// --- Create ---
router.post(
  "/create",
  authMiddleware,
  uploadSingleImage,
  createAboutCentre
);

// // --- Get (Admin) ---
router.get("/get", authMiddleware, getAboutCentre);

// // --- Update ---
router.put(
  "/update/:id",
  authMiddleware,
  uploadSingleImage,
  updateAboutCentre
);

// this is use for web
router.get("/get/web", getAllAboutCentreWeb);

export default router;