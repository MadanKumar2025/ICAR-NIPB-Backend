import express from "express";
import { getFacebookPosts } from "../controllers/FacebookPostController.js";
const router = express.Router();

// Web API (public)
router.get("/facebook-posts", getFacebookPosts);

export default router;
