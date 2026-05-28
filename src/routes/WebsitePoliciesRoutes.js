import express from "express";
import {
  createWebsitePolicies,
  getAllWebsitePolicies,
  updateWebsitePolicies,
  getAllWebsitePoliciesWeb,
} from "../controllers/WebsitePoliciesController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createWebsitePolicies);
router.get("/getAll", authMiddleware, getAllWebsitePolicies);
router.put("/update/:id", authMiddleware, updateWebsitePolicies);

// this is use for web
router.get("/get/web", getAllWebsitePoliciesWeb);
export default router;
