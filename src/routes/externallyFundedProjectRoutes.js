import express from "express";
import {
  createExternallyFundedProject,
  getExternallyFundedProjects,
  updateExternallyFundedProject,
  updateExternallyFundedProjectStatus,
  getAllExternallyFundedProjectsWeb,
} from "../controllers/ExternallyFundedProjectController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createExternallyFundedProject);
router.get("/getAll", authMiddleware, getExternallyFundedProjects);
router.put(
  "/updateExternallyFP/:id",
  authMiddleware,
  updateExternallyFundedProject,
);
router.put(
  "/StatusExternallyFundedProjectStatus/:id",
  authMiddleware,
  updateExternallyFundedProjectStatus,
);

// this is use for web
router.get("/get/web", getAllExternallyFundedProjectsWeb);
export default router;
