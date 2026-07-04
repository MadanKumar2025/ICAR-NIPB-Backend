import express from "express";

import {
  createPayment,
  getPayments,
  updatePayment,
  getPaymentsWeb,
} from "../controllers/PaymentController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import uploadSingleImage from "../middleware/uploadHandler.js";

const router = express.Router();

// Admin Routes
router.post("/create", authMiddleware, uploadSingleImage, createPayment);

router.get("/allPayment", authMiddleware, getPayments);

router.put(
  "/updatePayment/:id",
  authMiddleware,
  uploadSingleImage,
  updatePayment,
);

// Web Routes
router.get("/get/web", getPaymentsWeb);

export default router;
