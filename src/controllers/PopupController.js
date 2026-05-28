import Popup from "../models/PopupSchema.js";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

export const createPopup = async (req, res) => {
  try {
    let { title, photoTitle, url, startTime, endTime } = req.body;

    // Trim values
    title = title?.trim();
    photoTitle = photoTitle?.trim();
    url = url?.trim();

    // Validation
    if (!photoTitle) {
      return res.status(400).json({
        success: false,
        message: "Photo title is required",
      });
    }

    // if (!url) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "URL is required",
    //   });
    // }

    // if (!startTime) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Start time is required",
    //   });
    // }

    // if (!endTime) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "End time is required",
    //   });
    // }

    // Check image
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Photo is required",
      });
    }

    // Allowed image types
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Only image files (jpeg, png, jpg, webp) are allowed",
      });
    }

    // Image filename
    const photo = req.file.filename;

    // User
    const createdBy = req.user?.id || null;

    // Create popup object
    const popup = new Popup({
      title,
      photoTitle,
      photo,
      url,
      startTime,
      endTime,
      createdBy,
    });

    // Save
    const savedPopup = await popup.save();

    res.status(201).json({
      success: true,
      message: "Popup created successfully",
      data: savedPopup,
    });
  } catch (error) {
    console.error(error);

    // Duplicate error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];

      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    // Validation error
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


export const getPopups = async (req, res) => {
  try {
    const popups = await Popup.find()
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdDate: -1 });

    const data = popups.map((item) => ({
      id: item._id,
      title: item.title || "",
      photoTitle: item.photoTitle || "",
      photo: item.photo || null,
      url: item.url || "",
      startTime: item.startTime || null,
      endTime: item.endTime || null,
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
      message: "Error fetching popups",
    });
  }
};

export const updatePopup = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing popup ID",
      });
    }

    const {
      title,
      photoTitle,
      url,
      startTime,
      endTime,
      isActive,
    } = req.body;

    const popup = await Popup.findById(id);

    if (!popup) {
      return res.status(404).json({
        success: false,
        message: "Popup not found",
      });
    }

    // Validation
    if (photoTitle && photoTitle.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Photo title cannot be empty",
      });
    }

    if (url && url.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "URL cannot be empty",
      });
    }

    // Update image
    if (req.file) {
      if (popup.photo) {
        const oldFilePath = path.join(
          process.cwd(),
          "uploads",
          popup.photo
        );

        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      popup.photo = req.file.filename;
    }

    // Update fields
    if (title !== undefined) {
      popup.title = title || popup.title;
    }

    if (photoTitle !== undefined) {
      popup.photoTitle = photoTitle || popup.photoTitle;
    }

    if (url !== undefined) {
      popup.url = url || popup.url;
    }

    if (startTime !== undefined) {
      popup.startTime = startTime;
    }

    if (endTime !== undefined) {
      popup.endTime = endTime;
    }

    if (isActive !== undefined) {
      popup.isActive = isActive;
    }

    popup.updatedBy = req.user?.id;
    popup.updatedDate = new Date();

    const updatedPopup = await popup.save();

    return res.status(200).json({
      success: true,
      message: "Popup updated successfully",
      data: updatedPopup,
    });
  } catch (error) {
    console.error("Error updating popup:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};


export const updatePopupStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // --- ID validation ---
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing Popup ID",
      });
    }

    // --- Boolean validation ---
    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    // --- Update popup status ---
    const popup = await Popup.findByIdAndUpdate(
      id,
      {
        isActive: isActive,
        updatedBy: req.user?.id,
        updatedDate: new Date(),
      },
      { new: true }
    );

    // --- Not found ---
    if (!popup) {
      return res.status(404).json({
        success: false,
        message: "Popup not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Popup status updated successfully",
      data: popup,
    });
  } catch (error) {
    console.error("Error updating popup status:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// this is use for web
export const getPopupsWeb = async (req, res) => {
  try {
    const popups = await Popup.find()
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdDate: -1 });

    const data = popups.map((item) => ({
      id: item._id,
      title: item.title || "",
      photoTitle: item.photoTitle || "",
      photo: item.photo || "",
      url: item.url || "",
      startTime: item.startTime || null,
      endTime: item.endTime || null,
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
      message: "Error fetching popups",
    });
  }
};