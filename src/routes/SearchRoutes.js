import express from "express";
import { globalSearch } from "../controllers/searchController.js";

const router = express.Router();

router.get("/get/", globalSearch);

export default router;