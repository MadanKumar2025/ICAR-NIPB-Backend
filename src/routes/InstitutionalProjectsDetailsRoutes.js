import express from "express";
import {
  createInstitutionalProjectDetails,
  deleteInstitutionalProjectDetails,
  getInstitutionalProjectDetailsByProjectID,
  updateInstitutionalProjectDetails,
  updateInstitutionalProjectDetailsStatus,
  getProjectDetailsByProjectIDWeb,
  getAllInstitutionalProjectDetailsWeb,
} from "../controllers/InstitutionalProjectsDetailsController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createInstitutionalProjectDetails);
router.get(
  "/get/:institutionalProjectID",
  authMiddleware,
  getInstitutionalProjectDetailsByProjectID,
);
router.put("/update/:id", authMiddleware, updateInstitutionalProjectDetails);
router.put(
  "/updateStatus/:id",
  authMiddleware,
  updateInstitutionalProjectDetailsStatus,
);
router.delete("/delete/:id", authMiddleware, deleteInstitutionalProjectDetails);

router.get("/get/web/All", getAllInstitutionalProjectDetailsWeb);
router.get("/get/web/:institutionalProjectID", getProjectDetailsByProjectIDWeb);
export default router;
