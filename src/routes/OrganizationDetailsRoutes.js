import express from "express";
import upload from "../middleware/upload.js";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createOrganization,
  getAllOrganizations,
  updateOrganization,
  getAllOrganizationsWeb,
  updateVisitorCounter,
  getVisitorCounter,
} from "../controllers/OrganizationDetailsController.js";

const router = express.Router();

router.post(
  "/createOrganization",
  authMiddleware,
  upload.fields([
    { name: "logo1", maxCount: 1 },
    { name: "logo2", maxCount: 1 },
    { name: "isoPhoto", maxCount: 1 },
  ]),
  createOrganization,
);
router.get("/", authMiddleware, getAllOrganizations);
router.put(
  "/update/:id",
  authMiddleware,
  upload.fields([
    { name: "logo1", maxCount: 1 },
    { name: "logo2", maxCount: 1 },
    { name: "isoPhoto", maxCount: 1 },
  ]),
  updateOrganization,
);
router.get("/get/web", getAllOrganizationsWeb);


router.get("/Visitor", getVisitorCounter);
router.post("/Update/Visitor", updateVisitorCounter);


export default router;
