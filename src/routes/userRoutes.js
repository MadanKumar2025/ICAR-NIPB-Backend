import express from "express";
import {
  changePassword,
  createUser,
  getUserById,
  getUsers,
  ProfileUpdate,
  updateUser,
  updateUserStatus,
  getAllUsersWeb,
  createScientistLogin,
} from "../controllers/userController.js";

import upload from "../middleware/upload.js";
import authMiddleware from "../middleware/authMiddleware.js";
import uploadSingleImage from "../middleware/uploadHandler.js";
const router = express.Router();

router.post("/users", authMiddleware, uploadSingleImage, createUser);
router.get("/users", authMiddleware, getUsers);
router.get("/users/:id", authMiddleware, getUserById);
router.put("/users/update/:id", authMiddleware, uploadSingleImage, updateUser);
router.post("/users/change-password", authMiddleware, changePassword);

router.put(
  "/users/profile-update/:id",
  authMiddleware,
  uploadSingleImage,
  ProfileUpdate,
);
router.put("/users/status/:id", authMiddleware, updateUserStatus);

// this is use for web
router.get("/users/get/web", getAllUsersWeb);

// this is use for create scientist Login 
router.post(
  "/createScientistLogin",
  authMiddleware,
  uploadSingleImage,
  createScientistLogin,
);

export default router;
