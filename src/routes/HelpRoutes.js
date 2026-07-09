import express from "express";
import {
  createHelp,
  getAllHelp,
  updateHelpStatus,
  updateHelp,
  getAllHelpWeb,
  deleteHelp,
} from "../controllers/HelpController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createHelp);

router.get("/Getall", authMiddleware, getAllHelp);

router.put("/updateStatus/:id", authMiddleware, updateHelpStatus);

router.put("/update/:id", authMiddleware, updateHelp);

router.delete("/delete-help/:id", authMiddleware, deleteHelp);

// // Get all Help entries for the web (public)
router.get("/get/web", getAllHelpWeb);

export default router;
