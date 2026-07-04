import express from "express";
import {
  createFeedback,
  getFeedback,
  updateFeedbackStatus,
  getFeedbackId,
} from "../controllers/FeedbackSchemaController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", createFeedback);
router.get("/getAll", authMiddleware, getFeedback);
router.put("/updateStatus/:id", authMiddleware, updateFeedbackStatus);
router.get("/get/:id", authMiddleware, getFeedbackId);

export default router;
