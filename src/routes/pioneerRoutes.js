import express from "express";
import upload from "../middleware/upload.js";
import authMiddleware from "../middleware/authMiddleware.js";
import uploadSingleImage from "../middleware/uploadHandler.js";
import {
  createpioneer ,
  getAllpioneer,
  updatepioneer,
  updatepioneerStatus,
} from "../controllers/PioneerController.js";

const router = express.Router();

router.post("/create", authMiddleware, uploadSingleImage, createpioneer );
router.get("/getAll", authMiddleware, getAllpioneer);
router.put("/update/:id", authMiddleware, uploadSingleImage, updatepioneer);
router.put("/updateStatus/:id", authMiddleware, updatepioneerStatus);

export default router;
