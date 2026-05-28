import express from "express";
import {
  createPublication,
  getAllPublications,
  updatePublication,
  updatePublicationStatus,
  getAllPublicationsWeb,
  getPublicationsByCategory,
} from "../controllers/PublicationsControllers.js";

import authMiddleware from "../middleware/authMiddleware.js";
import uploadAll from "../middleware/uploadAll.js";

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  uploadAll.single("file"),
  createPublication,
);
router.get("/getAll", authMiddleware, getAllPublications);
router.put("/update/:id", authMiddleware,uploadAll.single("file"), updatePublication);
router.put("/updateStatus/:id", authMiddleware, updatePublicationStatus);

// this is use for web
router.get("/get/web", getAllPublicationsWeb);
router.get("/get/web/:category", getPublicationsByCategory);
export default router;
