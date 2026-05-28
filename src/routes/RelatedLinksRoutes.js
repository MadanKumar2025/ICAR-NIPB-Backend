import express from "express";
import {
  createRelatedLinks,
  getAllRelatedLinks,
  updateRelatedLinks,
  getAllRelatedLinksWeb,
} from "../controllers/RelatedLinksController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createRelatedLinks);
router.get("/getAll", authMiddleware, getAllRelatedLinks);
router.put("/update/:id", authMiddleware, updateRelatedLinks);

// this is use for web
router.get("/get/web", getAllRelatedLinksWeb);
export default router;
