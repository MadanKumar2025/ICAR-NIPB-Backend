import express from "express";
import {
  createInstitutionalProject,
  getInstitutionalProjects,
  updateInstitutionalProject,
  updateInstitutionalProjectStatus,
  getAllInstitutionalProjectsWeb,
  deleteInstitutionalProject
} from "../controllers/InstitutionalProjectsController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createInstitutionalProject);
router.get("/allData", authMiddleware, getInstitutionalProjects);

router.put(
  "/updateStatus/:id",
  authMiddleware,
  updateInstitutionalProjectStatus,
);
router.put("/update/:id", authMiddleware, updateInstitutionalProject);
router.delete(
  "/delete-institutional-project/:id",
  authMiddleware,
  deleteInstitutionalProject
);

// this is use for web
router.get("/get/web", getAllInstitutionalProjectsWeb);
export default router;
