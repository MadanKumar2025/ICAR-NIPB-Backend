import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { globalSearch } from "../controllers/searchController.js";

const router = express.Router();

// Global search (secured route like your other APIs)
router.get("/get", authMiddleware, globalSearch);

export default router;