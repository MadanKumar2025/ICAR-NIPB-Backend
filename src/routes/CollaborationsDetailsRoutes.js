import express from "express";
import {
  createCollaborationsDetails,
  getCollaborationsDetails,
  updateCollaborationsDetailsStatus,
  updateCollaborationsDetails,
  getCollaborationDetailsByCollabId,getAllCollaborationDetailsWeb
} from "../controllers/CollaborationsDetailsController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createCollaborationsDetails);
router.get(
  "/getAll/:CollaborationsId",
  authMiddleware,
  getCollaborationsDetails,
);
router.put(
  "/updateStatus/:id",
  authMiddleware,
  updateCollaborationsDetailsStatus,
);
router.put("/update/:id", authMiddleware, updateCollaborationsDetails);

// this is use for web
router.get("/get/web/:collaborationId", getCollaborationDetailsByCollabId);
router.get("/get/web", getAllCollaborationDetailsWeb);

export default router;
