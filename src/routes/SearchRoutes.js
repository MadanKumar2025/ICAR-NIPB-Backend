import express from "express";
 import { globalSearch } from "../controllers/SearchController.js";

const router = express.Router();

// matches: /api/search/get?keyword=259
router.get("/get", globalSearch);

export default router;