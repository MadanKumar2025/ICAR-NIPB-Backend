import express from "express";
import {
  createCadreStrength,
  getAllCadreStrength,
  updateCadreStatus,
  updateCadreStrength,
  getAllCadreStrengthWeb,
  deleteCadreStrength,
} from "../controllers/CadreStrengthController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create
router.post("/create", authMiddleware, createCadreStrength);
router.get("/getall", authMiddleware, getAllCadreStrength);
router.put("/updateStatus/:id", authMiddleware, updateCadreStatus);
router.put("/update/:id", authMiddleware, updateCadreStrength);
router.delete(
  "/delete-cadre-strength/:id",
  authMiddleware,
  deleteCadreStrength,
);

// this is use for web
router.get("/get/web", getAllCadreStrengthWeb);

export default router;
