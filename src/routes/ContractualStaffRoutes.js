import express from "express";
import { createContractualStaff, getContractualStaff, updateContractualStaff,updateContractualStaffStatus } from "../controllers/ContractualStaffController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import uploadSingleImage from "../middleware/uploadHandler.js";

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  uploadSingleImage,
  createContractualStaff
);
router.get(
  "/GetAll",
  authMiddleware,
  getContractualStaff
);
router.put(
  "/update/:id",
  authMiddleware,
  uploadSingleImage,
  updateContractualStaff
);
router.put(
  "/updateStatus/:id",
  authMiddleware,
  uploadSingleImage,
  updateContractualStaffStatus
);


export default router;