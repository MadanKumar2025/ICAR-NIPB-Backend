import express from "express";
import { createContent ,getAllContent,getContentByPageId,updateContent,getContentByPageIdWeb} from "../controllers/ContentController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import uploadSingleImage from "../middleware/uploadHandler.js";

const router = express.Router();

// this is use for web
router.get("/get/web/:pageId", getContentByPageIdWeb);

router.post("/create", authMiddleware, createContent);
router.get("/getAll", authMiddleware, getAllContent);
router.get("/get/:pageId", authMiddleware, getContentByPageId);
router.put("/update/:id", authMiddleware,updateContent);

export default router;
