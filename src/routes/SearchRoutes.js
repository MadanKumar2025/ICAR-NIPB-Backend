import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { globalSearch } from "../controllers/searchController.js";

const router = express.Router();

// matches: /api/search/get?keyword=259
router.get("/get", authMiddleware, globalSearch);

export default router;