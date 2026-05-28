import express from "express";
import {
  createStaff,
  getStaff,
  updateStaff,
  updateStaffStatus,
  getAllStaffWeb,
  getStaffByDepartment,
  getStaffByIdWeb,
} from "../controllers/StaffController.js";

import upload from "../middleware/upload.js";
import authMiddleware from "../middleware/authMiddleware.js";
import uploadSingleImage from "../middleware/uploadHandler.js";

const router = express.Router();

// router.post("/create", authMiddleware, upload.single("photo"), createStaff);
router.post("/create", authMiddleware, uploadSingleImage, createStaff);
router.get("/allStaff", authMiddleware, getStaff);
router.put("/updateStaff/:id", authMiddleware, uploadSingleImage, updateStaff);
router.put("/staffStatus/:id", authMiddleware, updateStaffStatus);

// this is use for web
router.get("/get/web", getAllStaffWeb);
router.get("/get/web/:department", getStaffByDepartment);
router.get("/get/web/byID/:id", getStaffByIdWeb);
export default router;
