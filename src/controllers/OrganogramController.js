import Organogram from "../models/OrganogramSchema.js";
import mongoose from "mongoose";

import fs from "fs";
import path from "path";

export const createOrganogram = async (req, res) => {
  try {
    let { photoTitle } = req.body;

    photoTitle = photoTitle?.trim();

    // Validate title
    if (!photoTitle) {
      return res.status(400).json({
        success: false,
        message: "Photo title is required",
      });
    }

    // File validation
    let photo = null;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Photo file is required",
      });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Only image files (jpeg, jpg, png, webp) are allowed",
      });
    }

    photo = req.file.filename;

    const createdBy = req.user?.id || null;

    const organogram = new Organogram({
      photo,
      photoTitle,
      createdBy,
    });

    const savedOrganogram = await organogram.save();

    res.status(201).json({
      success: true,
      message: "Organogram created successfully",
      data: savedOrganogram,
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

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const getOrganogram = async (req, res) => {
  try {
    const list = await Organogram.find()
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdDate: -1 });

    const data = list.map((item) => ({
      id: item._id,
      photo: item.photo || null,
      photoTitle: item.photoTitle || "",
      isActive: item.isActive,
      createdBy: item.createdBy || null,
      updatedBy: item.updatedBy || null,
      createdDate: item.createdDate,
      updatedDate: item.updatedDate || null,
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error fetching organogram",
    });
  }
};


export const updateOrganogram = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing organogram ID",
      });
    }

    const { photoTitle, isActive } = req.body;

    const organogram = await Organogram.findById(id);

    if (!organogram) {
      return res.status(404).json({
        success: false,
        message: "Organogram not found",
      });
    }

 
    if (photoTitle && photoTitle.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Photo title cannot be empty",
      });
    }

    
    if (req.file) {
      if (organogram.photo) {
        const oldFilePath = path.join(
          process.cwd(),
          "uploads",
          organogram.photo
        );

        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      organogram.photo = req.file.filename;
    }

 
    if (photoTitle) organogram.photoTitle = photoTitle.trim();

    if (isActive !== undefined) {
      organogram.isActive = isActive;
    }

    organogram.updatedBy = req.user?.id || null;
    organogram.updatedDate = new Date();

    const updatedOrganogram = await organogram.save();

    return res.status(200).json({
      success: true,
      message: "Organogram updated successfully",
      data: updatedOrganogram,
    });
  } catch (error) {
    console.error("Error updating organogram:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};


// this is use for web
export const getOrganogramWeb = async (req, res) => {
  try {
    const list = await Organogram.find()
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdDate: -1 });

    const data = list.map((item) => ({
      id: item._id,
      photo: item.photo || null,
      photoTitle: item.photoTitle || "",
      isActive: item.isActive,
      createdBy: item.createdBy || null,
      updatedBy: item.updatedBy || null,
      createdDate: item.createdDate,
      updatedDate: item.updatedDate || null,
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error fetching organogram",
    });
  }
};