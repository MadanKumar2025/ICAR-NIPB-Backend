import express from "express";
import {
  createCommittee,getAllCommittees,updateCommittee
} from "../controllers/committeesController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createCommittee);
router.get("/getAll", authMiddleware, getAllCommittees);
router.put("/update/:id", authMiddleware, updateCommittee);

export default router;