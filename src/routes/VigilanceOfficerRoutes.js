import express from "express";
import {
  createVigilanceOfficer,
  getAllVigilanceOfficers,
  updateVigilanceOfficer,
  updateVigilanceOfficerStatus,getVigilanceOfficersByType
} from "../controllers/VigilanceOfficerController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import uploadSingleImage from "../middleware/uploadHandler.js"; // multer setup for single image

const router = express.Router();

// --- Create Vigilance Officer ---
router.post(
  "/create",
  authMiddleware,
  uploadSingleImage,
  createVigilanceOfficer,
);

// // --- Get all Vigilance Officers (Admin) ---
router.get("/get", authMiddleware, getAllVigilanceOfficers);

// --- Update Vigilance Officer ---
router.put(
  "/update/:id",
  authMiddleware,
  uploadSingleImage,
  updateVigilanceOfficer,
);

router.put("/status/:id", authMiddleware, updateVigilanceOfficerStatus);

// // --- Get all Vigilance Officers for Web (Public) ---
router.get("/get/web/:type", getVigilanceOfficersByType);

export default router;
