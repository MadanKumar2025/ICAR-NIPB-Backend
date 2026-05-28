import express from "express";
import {
  createDisclaimer,
  getAllDisclaimers,
  updateDisclaimer,
  getAllDisclaimerWeb,
} from "../controllers/DisclaimerController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createDisclaimer);
router.get("/getall", authMiddleware, getAllDisclaimers);
router.put("/update/:id", authMiddleware, updateDisclaimer);

// this is use for web
router.get("/get/web", getAllDisclaimerWeb);
export default router;
