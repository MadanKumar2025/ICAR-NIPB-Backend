import express from "express";
import { createAdminMenu ,getAdminMenus,updateAdminMenu} from "../controllers/AdminMenuMasterController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createAdminMenu);
router.get("/getAll", authMiddleware, getAdminMenus);
router.put("/update/:id", authMiddleware, updateAdminMenu);

export default router;
