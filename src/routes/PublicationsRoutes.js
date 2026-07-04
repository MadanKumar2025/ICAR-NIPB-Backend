import express from "express";
import {
  createPublication,
  getAllPublications,
  updatePublication,
  updatePublicationStatus,
  getAllPublicationsWeb,
  getPublicationsByCategory,
  getPublicationByIdWeb,
} from "../controllers/PublicationsControllers.js";

import authMiddleware from "../middleware/authMiddleware.js";
import uploadAll from "../middleware/uploadAll.js";

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  // uploadAll.single("file"),
  uploadAll.fields([
  { name: "file", maxCount: 1 },
  { name: "image", maxCount: 1 },
]),
  createPublication,
);
router.get("/getAll", authMiddleware, getAllPublications);
router.put(
  "/update/:id",
  authMiddleware,
  // uploadAll.single("file"),
   uploadAll.fields([
  { name: "file", maxCount: 1 },
  { name: "image", maxCount: 1 },
]),
  updatePublication,
);
router.put("/updateStatus/:id", authMiddleware, updatePublicationStatus);

// this is use for web
router.get("/get/web", getAllPublicationsWeb);
router.get("/get/web/:category", getPublicationsByCategory);
router.get("/get/webByID/:id", getPublicationByIdWeb);
export default router;
