import DocumentUploader from "../models/DocumentUploaderSchema.js";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

export const createDocument = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Document file is required",
      });
    }

    const newDocument = new DocumentUploader({
      title: title.trim(),
      documentFile: req.file.filename,
      createdBy: req.user.id,
    });

    const savedDocument = await newDocument.save();

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: savedDocument,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllDocuments = async (req, res) => {
  try {
    const documentList = await DocumentUploader.find()
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdAt: -1 });

    const data = documentList.map((doc) => ({
      id: doc._id,
      title: doc.title || "",
      documentFile: doc.documentFile,
      createdBy: doc.createdBy || null,
      updatedBy: doc.updatedBy || null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt || null,
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching documents",
    });
  }
};

export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing document ID",
      });
    }

    const { title } = req.body;

    const document = await DocumentUploader.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Title validation (if provided)
    if (title !== undefined && title.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Title cannot be empty",
      });
    }

    // Duplicate title check
    if (title && title.trim() !== document.title) {
      const existing = await DocumentUploader.findOne({
        title: title.trim(),
        _id: { $ne: id },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Document with this title already exists",
        });
      }
    }

    // Update title if provided
    if (title) {
      document.title = title.trim();
    }

    // Handle file update
    if (req.file) {
      if (document.documentFile) {
        const oldFilePath = path.join(
          process.cwd(),
          "uploads",
          document.documentFile,
        );
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      document.documentFile = req.file.filename;
    }

    // Update updatedBy and updatedAt fields
    document.updatedBy = req.user?.id;
    document.updatedAt = Date.now();

    const updatedDocument = await document.save();

    return res.status(200).json({
      success: true,
      message: "Document updated successfully",
      data: updatedDocument,
    });
  } catch (error) {
    console.error(error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing document ID",
      });
    }

    //  Find document
    const document = await DocumentUploader.findById(id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    //  Delete file from server
    if (document.documentFile) {
      const filePath = path.join(
        process.cwd(),
        "uploads",
        document.documentFile,
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    //  Delete from DB
    await DocumentUploader.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
