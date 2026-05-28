import express from "express";
import {
  createTermsConditions,
  getAllTermsConditions,
  updateTermsConditions,
  getAllTermsConditionsWeb,
} from "../controllers/TermsConditionsController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createTermsConditions);
router.get("/GetAll", authMiddleware, getAllTermsConditions);
router.put("/update/:id", authMiddleware, updateTermsConditions);

// this is use for web
router.get("/get/web", getAllTermsConditionsWeb);
export default router;
