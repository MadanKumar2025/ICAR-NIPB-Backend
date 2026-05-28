import express from "express";
import {
  createTechnologiesDeveloped,
  getTechnologiesDeveloped,
  updateTechnologiesDeveloped,
  updateTechnologiesDevelopedStatus,
  getAllTechnologiesWeb,
} from "../controllers/TechnologiesDevelopedController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createTechnologiesDeveloped);
router.get("/getAll", authMiddleware, getTechnologiesDeveloped);
router.put("/update/:id", authMiddleware, updateTechnologiesDeveloped);
router.put(
  "/updateStatus/:id",
  authMiddleware,
  updateTechnologiesDevelopedStatus,
);

router.get("/get/web", getAllTechnologiesWeb);
export default router;
