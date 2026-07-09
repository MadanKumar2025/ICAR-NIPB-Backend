import express from "express";
import {
  createCommittee,
  getAllCommittees,
  updateCommittee,
  updateCommitteeStatus,
  getAllCommitteesWeb,
  getCommitteeByIdWeb,deleteCommittee
} from "../controllers/CommitteesController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createCommittee);
router.get("/getAll", authMiddleware, getAllCommittees);
router.put("/update/:id", authMiddleware, updateCommittee);
router.put("/updateStatus/:id", authMiddleware, updateCommitteeStatus);
router.delete("/delete-committee/:id", authMiddleware, deleteCommittee);
// this is use for web
router.get("/get/web", getAllCommitteesWeb);
router.get("/get/web/:id", getCommitteeByIdWeb);

export default router;
