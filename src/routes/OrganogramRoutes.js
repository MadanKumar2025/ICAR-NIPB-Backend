import express from "express";

import {
  createOrganogram,
  getOrganogram,
  updateOrganogram,
  getOrganogramWeb,
} from "../controllers/OrganogramController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import uploadSingleImage from "../middleware/uploadHandler.js";

const router = express.Router();

router.post("/create", authMiddleware, uploadSingleImage, createOrganogram);

router.get("/all", authMiddleware, getOrganogram);

router.put("/update/:id", authMiddleware, uploadSingleImage, updateOrganogram);

// Web API (public)
router.get("/get/web", getOrganogramWeb);

export default router;
