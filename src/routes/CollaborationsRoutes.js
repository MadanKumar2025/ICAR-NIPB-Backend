import express from "express";
import {
  createCollaborations,
  getCollaborations,
  updateCollaborationsStatus,
  updateCollaborations,
  getAllCollaborationsWeb,
} from "../controllers/CollaborationsController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createCollaborations);
router.get("/getAll", authMiddleware, getCollaborations);
router.put("/updateStatus/:id", authMiddleware, updateCollaborationsStatus);
router.put("/updateCollaborations/:id", authMiddleware, updateCollaborations);

router.get("/get/web", getAllCollaborationsWeb);

export default router;
