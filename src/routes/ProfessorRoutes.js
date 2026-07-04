import express from "express";
import {
  createProfessor,
  getProfessors,
  updateProfessorStatus,
    updateProfessor,
    getAllProfessorWeb,
} from "../controllers/ProfessorController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import uploadSingleImage from "../middleware/uploadHandler.js";

const router = express.Router();

// Create Professor
router.post("/create", authMiddleware, uploadSingleImage, createProfessor);

// Get all professors (admin)
router.get("/getAll", authMiddleware, getProfessors);

// Update status (active/inactive)
router.put("/updateStatus/:id", authMiddleware, updateProfessorStatus);

// Update professor
router.put(
  "/update/:id",
  authMiddleware,
  uploadSingleImage,
  updateProfessor
);

// Web API (public)
router.get("/get/web", getAllProfessorWeb);

export default router;
