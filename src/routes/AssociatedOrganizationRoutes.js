import express from "express";

import {
  createAssociatedOrganization,
  getAllAssociatedOrganizations,
  updateAssociatedOrganization,
  updateAssociatedOrganizationStatus,
  getAllAssociatedOrganizationsWeb,
} from "../controllers/AssociatedOrganizationController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import uploadSingleImage from "../middleware/uploadHandler.js";

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  uploadSingleImage,
  createAssociatedOrganization,
);

router.get("/get", authMiddleware, getAllAssociatedOrganizations);

router.put(
  "/update/:id",
  authMiddleware,
  uploadSingleImage,
  updateAssociatedOrganization,
);

router.put("/status/:id", authMiddleware, updateAssociatedOrganizationStatus);

router.get("/get/web", getAllAssociatedOrganizationsWeb);

export default router;
