import express from "express";
import { createDocument, getAllDocuments, updateDocument, deleteDocument } from "../controllers/DocumentUploaderController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import uploadAll from "../middleware/uploadAll.js";

const router = express.Router();


router.post("/create", authMiddleware, uploadAll.single("documentFile"), createDocument);
router.put("/update/:id", authMiddleware, uploadAll.single("documentFile"), updateDocument);

router.get("/get", authMiddleware, getAllDocuments);
router.delete("/delete/:id", authMiddleware, deleteDocument);

export default router;