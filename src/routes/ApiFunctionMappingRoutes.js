import express from "express";
import {
  createApiFunctionMapping,
  getAllApiFunctionMappings,
  //   updateApiFunctionMapping,
} from "../controllers/ApiFunctionMappingController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createApiFunctionMapping);
router.get("/getAll", authMiddleware, getAllApiFunctionMappings);
// router.put("/update/:id", authMiddleware, updateApiFunctionMapping);

export default router;
