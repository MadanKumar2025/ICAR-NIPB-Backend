import express from "express";
import {
  createExternalLink,
  getExternalLinks,
  updateExternalLinkStatus,
  updateExternalLink,
} from "../controllers/ExternalLinkController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create
router.post("/create", authMiddleware, createExternalLink);
router.get("/getAll", authMiddleware, getExternalLinks);
router.put("/updateStatus/:id", authMiddleware, updateExternalLinkStatus);
router.put("/updateExternalLink/:id", authMiddleware, updateExternalLink);

export default router;
