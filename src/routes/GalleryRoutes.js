import express from "express";
import {
  createGallery,
  getGallery,
  updateGallery,
  getGalleryByAlbumId,
  updateGalleryStatus,
  getAllGalleryWeb,
  getGalleryByAlbumIdWeb,
} from "../controllers/GalleryController.js";

import upload from "../middleware/upload.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
// this is use for web
router.get("/getGalleryByAlbumId/web/:albumId", getGalleryByAlbumIdWeb);

router.post(
  "/create",
  authMiddleware,
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "document", maxCount: 1 },
  ]),
  createGallery,
);
router.get("/allgallery", authMiddleware, getGallery);
router.put(
  "/updateGallery/:id",
  authMiddleware,
 upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "document", maxCount: 1 }
]),
  updateGallery,
);
router.get(
  "/getGalleryByAlbumId/:albumId",
  authMiddleware,
  getGalleryByAlbumId,
);
router.put("/updateGalleryStatus/:id", authMiddleware, updateGalleryStatus);

// this is use for web
router.get("/get/web", getAllGalleryWeb);

export default router;
