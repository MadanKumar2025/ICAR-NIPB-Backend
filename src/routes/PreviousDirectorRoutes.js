import express from "express";
import {
  createPreviousDirector,
  getPreviousDirectors,
  updatePreviousDirectorStatus,
  updatePreviousDirector,
  getAllPreviousDirectorWeb,
  deletePreviousDirector,
} from "../controllers/PreviousDirectorController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import uploadSingleImage from "../middleware/uploadHandler.js";

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  uploadSingleImage,
  createPreviousDirector,
);
router.get("/Getall", authMiddleware, getPreviousDirectors);

router.put(
  "/updateStatus/:id",
  authMiddleware,
  updatePreviousDirectorStatus,
);

router.put(
  "/update/:id",
  authMiddleware,
  uploadSingleImage,
  updatePreviousDirector,
);

router.delete(
  "/delete-previous-director/:id",
  authMiddleware,
  deletePreviousDirector
);

// this is use for web
router.get("/get/web", getAllPreviousDirectorWeb);
export default router;
