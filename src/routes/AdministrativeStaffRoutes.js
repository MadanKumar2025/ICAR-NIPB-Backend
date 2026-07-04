import express from "express";
import {
  createAdministrativeStaff,
  getAdministrativeStaff,
  updateAdministrativeStaff,
  updateAdministrativeStaffStatus
} from "../controllers/AdministrativeStaffController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import uploadSingleImage from "../middleware/uploadHandler.js";

const router = express.Router();

// Create
router.post(
  "/create",
  authMiddleware,
  uploadSingleImage,
  createAdministrativeStaff,
);

router.get("/getall", authMiddleware, getAdministrativeStaff);
router.put("/update/:id", authMiddleware,uploadSingleImage, updateAdministrativeStaff);
router.put("/updateStatus/:id", authMiddleware, updateAdministrativeStaffStatus);

export default router;
