import express from "express";
import {
createPatents,getAllPatents,updatePatentStatus,updatePatent,getAllPatentsWeb,deletePatent
} from "../controllers/PatentsController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


router.post("/create", authMiddleware, createPatents);
router.get("/Getall", authMiddleware, getAllPatents);
router.put("/updateStatus/:id", authMiddleware, updatePatentStatus);
router.put("/update/:id", authMiddleware, updatePatent);
router.delete("/delete-patent/:id", authMiddleware, deletePatent);

router.get("/get/web",getAllPatentsWeb);
export default router;
