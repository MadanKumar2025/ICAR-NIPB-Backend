import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createDesignation,
  getDesignations,
  updateDesignation,updateDesignationStatus
} from "../controllers/DesignationController.js";

const router = express.Router();

router.post("/create", authMiddleware, createDesignation);
router.get("/get", authMiddleware, getDesignations);
router.put("/update/:id", authMiddleware, updateDesignation);
router.put("/updateStatus/:id", authMiddleware, updateDesignationStatus);

export default router;
