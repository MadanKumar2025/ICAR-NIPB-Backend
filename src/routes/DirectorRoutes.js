import express from "express";
import {
  createDirector,
  getDirectors,
  updateDirectorStatus,
updateDirector,getAllDirectorWeb
} from "../controllers/DirectorController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import uploadSingleImage from "../middleware/uploadHandler.js";

const router = express.Router();

router.post("/create", authMiddleware, uploadSingleImage, createDirector);

router.get("/getAll", authMiddleware, getDirectors);

router.put("/updateStatus/:id", authMiddleware, updateDirectorStatus);

router.put(
  "/update/:id",
  authMiddleware,
  uploadSingleImage,
  updateDirector
);

// this is use for web
router.get("/get/web", getAllDirectorWeb);
export default router;
