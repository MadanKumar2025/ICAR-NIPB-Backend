import express from "express";
import {
  createAccessibilityStatement,
  getAllAccessibilityStatements,
  updateAccessibilityStatement,
  getAllAccessibilityStatementsWeb,
} from "../controllers/AccessibilityStatementController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createAccessibilityStatement);
router.get("/getall", authMiddleware, getAllAccessibilityStatements);
router.put("/update/:id", authMiddleware, updateAccessibilityStatement);

// this is use for web
router.get("/get/web", getAllAccessibilityStatementsWeb);
export default router;
