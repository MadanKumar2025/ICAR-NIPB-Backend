import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createStudent,
  getStudentsByCourseId,
  updateStudent,
  updateStudentStatus,
  getAllStudents,
} from "../controllers/StudentController.js";

const router = express.Router();
// this is use for web
router.get("/get/web", getAllStudents);

router.post("/create", authMiddleware, createStudent);
router.get("/get/:courseId", authMiddleware, getStudentsByCourseId);
router.put("/update/:id", authMiddleware, updateStudent);
router.put("/updateStatus/:id", authMiddleware, updateStudentStatus);

export default router;
