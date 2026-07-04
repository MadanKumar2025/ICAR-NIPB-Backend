import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createTrainingProgram,
  getTrainingPrograms,
  updateTrainingProgram,
  updateTrainingProgramStatus,
  getTrainingProgramsWeb,
} from "../controllers/TrainingProgramController.js";

const router = express.Router();

router.post("/create", authMiddleware, createTrainingProgram);

router.get("/get", authMiddleware, getTrainingPrograms);

router.put("/update/:id", authMiddleware, updateTrainingProgram);
 
router.put("/updateStatus/:id", authMiddleware, updateTrainingProgramStatus);

 // this is use for web
router.get("/get/web", getTrainingProgramsWeb);

export default router;
