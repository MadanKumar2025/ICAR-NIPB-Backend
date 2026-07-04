import express from "express";
import {
  createAlumni,
  getAlumni,
  updateAlumniApproval,
  getAllAlumni,
  updateAlumni,
  getAlumniByIdWeb,createAlumniWeb
} from "../controllers/AlumniController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import uploadSingleImage from "../middleware/uploadHandler.js";

const router = express.Router();

// Create Alumni
router.post("/create", authMiddleware, uploadSingleImage, createAlumni);
router.get("/getAll", authMiddleware, getAlumni);
router.put("/approve/:id", authMiddleware, updateAlumniApproval);
router.put("/update/:id", authMiddleware, uploadSingleImage, updateAlumni);

router.get("/get/web", getAllAlumni);
router.get("/get/web/:id", getAlumniByIdWeb);
router.post("/create/web",uploadSingleImage, createAlumniWeb);
export default router;
