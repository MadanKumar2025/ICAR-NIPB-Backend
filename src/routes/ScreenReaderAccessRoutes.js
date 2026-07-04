import express from "express";
import {
  createScreenReaderAccess,
  getAllScreenReaderAccess,
  updateScreenReaderAccess,
  getAllScreenReaderAccessWeb,
} from "../controllers/ScreenReaderAccessController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createScreenReaderAccess);
router.get("/getAll", authMiddleware, getAllScreenReaderAccess);
router.put("/update/:id", authMiddleware, updateScreenReaderAccess);

router.get("/get/web", getAllScreenReaderAccessWeb);
export default router;