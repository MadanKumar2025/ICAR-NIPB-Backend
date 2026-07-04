import express from "express";
import {
  createNRCPBMail,
  getAllNRCPBMail,
  updateNRCPBMail,
  getAllNRCPBMailWeb,
} from "../controllers/NRCPBMailController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createNRCPBMail);
router.get("/getAll", authMiddleware, getAllNRCPBMail);
router.put("/update/:id", authMiddleware, updateNRCPBMail);

// this is use for web
router.get("/get/web", getAllNRCPBMailWeb);
export default router;