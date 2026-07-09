import express from "express";
import {
  createVigilanceOfficer,
  getAllVigilanceOfficers,
  updateVigilanceOfficer,
  updateVigilanceOfficerStatus,
  getVigilanceOfficersByType,
  deleteVigilanceOfficer,
} from "../controllers/VigilanceOfficerController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import uploadSingleImage from "../middleware/uploadHandler.js";

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  uploadSingleImage,
  createVigilanceOfficer,
);

router.get("/get", authMiddleware, getAllVigilanceOfficers);

router.put(
  "/update/:id",
  authMiddleware,
  uploadSingleImage,
  updateVigilanceOfficer,
);

router.put("/status/:id", authMiddleware, updateVigilanceOfficerStatus);

router.delete(
  "/delete-vigilance-officer/:id",
  authMiddleware,
  deleteVigilanceOfficer,
);

router.get("/get/web/:type", getVigilanceOfficersByType);

export default router;
