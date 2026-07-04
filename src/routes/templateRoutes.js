import express from "express";
import {
  createTemplate,
  updateTemplate,
  getTemplates,
} from "../controllers/templateController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


router.post("/create", authMiddleware, createTemplate);
router.put("/update/:id", authMiddleware, updateTemplate);
router.get("/list", authMiddleware, getTemplates);

export default router;
