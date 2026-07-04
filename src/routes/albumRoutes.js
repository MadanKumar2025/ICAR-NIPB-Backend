import express from "express";
import {
  createAlbum,
  getAlbums,
  updateAlbum,
  updateAlbumStatus,
  getAllAlbumWeb,
  getAlbumByIdWeb,
  getAllAlbumByTypeWeb
} from "../controllers/AlbumController.js";

import upload from "../middleware/upload.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, upload.single("coverPic"), createAlbum);
router.get("/allAlbum", authMiddleware, getAlbums);
router.put(
  "/updateAlbum/:id",
  authMiddleware,
  upload.single("coverPic"),
  updateAlbum,
);
router.put("/updateStatus/:id", authMiddleware, updateAlbumStatus);

// this is use for web
router.get("/get/web", getAllAlbumWeb);
router.get("/get/web/:type", getAllAlbumByTypeWeb);
router.get("/get/web/id/:id", getAlbumByIdWeb);
export default router;
