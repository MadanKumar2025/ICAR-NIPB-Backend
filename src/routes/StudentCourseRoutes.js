import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createStudentCourse,
  getStudentCourses,
  updateStudentCourse,
  updateStudentCourseStatus,getAllStudentCoursesWeb,
} from "../controllers/StudentCourseControllers.js";

const router = express.Router();

router.post("/create", authMiddleware, createStudentCourse);
router.get("/get", authMiddleware, getStudentCourses);
router.put("/update/:id", authMiddleware, updateStudentCourse);
router.put("/updateStudent/:id", authMiddleware, updateStudentCourseStatus);

// this is use for web
router.get("/get/web", getAllStudentCoursesWeb);
export default router;
