import express from "express";
import {
  createScientist,
  getScientist,
  updateScientist,
  updateScientistStatus,
  getAllScientistsWeb,
  getScientistByIdWeb,getScientistById
} from "../controllers/ScientistController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
import uploadSingleImage from "../middleware/uploadHandler.js";

const router = express.Router();

// this is use for web
router.get("/get/web", getAllScientistsWeb);
router.get("/get/web/:id", getScientistByIdWeb);

router.post(
  "/create",
  authMiddleware,
  //  upload.any(),
  uploadSingleImage,
  createScientist,
);
router.get("/getAll", authMiddleware, getScientist);
router.get("/get/:id", authMiddleware, getScientistById);

router.put(
  "/update/:id",
  authMiddleware,
  //  upload.any(),
  uploadSingleImage,
  updateScientist,
);
router.put("/updateStatus/:id", authMiddleware, updateScientistStatus);



export default router;
