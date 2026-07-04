import express from "express";
import {
  createUserPermission,
  getPermissionsByUser,
  updateUserPermission,
  getAllPermissions,
} from "../controllers/UserPermissionsController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createUserPermission);
router.get(
  "/getPermissionsByUser/:userId",
  authMiddleware,
  getPermissionsByUser,
);
router.put("/update/:id", authMiddleware, updateUserPermission);
router.get("/getAllDatat", authMiddleware, getAllPermissions);

export default router;
