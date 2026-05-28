import express from "express";
import {
  createHelp,
  getAllHelp,
  updateHelpStatus,
  updateHelp,
  getAllHelpWeb,
} from "../controllers/HelpController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a new Help entry
router.post("/create", authMiddleware, createHelp);

// // Get all Help entries (for admin/authenticated)
router.get("/Getall", authMiddleware, getAllHelp);

// // Update Help entry status (active/inactive)
router.put("/updateStatus/:id", authMiddleware, updateHelpStatus);

// // Update Help entry content
router.put("/update/:id", authMiddleware, updateHelp);

// // Get all Help entries for the web (public)
router.get("/get/web", getAllHelpWeb);

export default router;