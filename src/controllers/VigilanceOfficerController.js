import VigilanceOfficer from "../models/VigilanceOfficerSchema.js";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

// Controller to create a Vigilance Officer
export const createVigilanceOfficer = async (req, res) => {
  try {
    const {
      name_en,
      name_hi,
      type_en,
      type_hi,
      photoTitle,
      number,
      email,
      designationId,
      isActive,
    } = req.body;

    // --- Validations ---
    if (!name_en || !name_hi) {
      return res.status(400).json({
        success: false,
        message: "Name is required in both English & Hindi",
      });
    }

    if (!type_en || !type_hi) {
      return res.status(400).json({
        success: false,
        message: "Type is required in both English & Hindi",
      });
    }

    if (!photoTitle && !req.file) {
      return res.status(400).json({
        success: false,
        message: "Photo is required",
      });
    }

    if (!number) {
      return res.status(400).json({
        success: false,
        message: "Contact number is required",
      });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Valid email is required",
      });
    }

    if (!designationId || !mongoose.Types.ObjectId.isValid(designationId)) {
      return res.status(400).json({
        success: false,
        message: "Valid designation ID is required",
      });
    }

    // --- Create VigilanceOfficer Object ---
    const officer = new VigilanceOfficer({
      name: {
        en: name_en.trim(),
        hi: name_hi.trim(),
      },
      type: {
        en: type_en.trim(),
        hi: type_hi.trim(),
      },
      photo: req.file ? req.file.filename : null,
      photoTitle: photoTitle ? photoTitle.trim() : "",
      number: number.trim(),
      email: email.toLowerCase().trim(),
      designationId,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user.id,
    });

    // --- Save to DB ---
    const savedOfficer = await officer.save();

    res.status(201).json({
      success: true,
      message: "Vigilance Officer created successfully",
      data: savedOfficer,
    });
  } catch (error) {
    console.error("Error creating Vigilance Officer:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};


export const getAllVigilanceOfficers = async (req, res) => {
  try {
    // Fetch all officers with populated references
    const officers = await VigilanceOfficer.find()
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .populate("designationId", "name") // populate designation details
      .sort({ createdAt: -1 });

    // Map to clean response
    const data = officers.map((officer) => ({
      id: officer._id,
      name: officer.name || { en: "", hi: "" },
      type: officer.type || { en: "", hi: "" },
      photo: officer.photo || "",
      photoTitle: officer.photoTitle || "",
      number: officer.number || "",
      email: officer.email || "",
      designation: officer.designationId || null,
      isActive: officer.isActive,
      createdBy: officer.createdBy || null,
      updatedBy: officer.updatedBy || null,
      createdAt: officer.createdAt,
      updatedAt: officer.updatedAt || null,
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Error fetching Vigilance Officers:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching Vigilance Officers",
    });
  }
};


export const updateVigilanceOfficer = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing Vigilance Officer ID",
      });
    }

    const {
      name_en,
      name_hi,
      type_en,
      type_hi,
      photoTitle,
      number,
      email,
      designationId,
      isActive,
    } = req.body;

    const officer = await VigilanceOfficer.findById(id);

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "Vigilance Officer not found",
      });
    }

    // --- Validations ---
    if ((name_en && name_en.trim() === "") || (name_hi && name_hi.trim() === "")) {
      return res.status(400).json({
        success: false,
        message: "Name cannot be empty in either English or Hindi",
      });
    }

    if ((type_en && type_en.trim() === "") || (type_hi && type_hi.trim() === "")) {
      return res.status(400).json({
        success: false,
        message: "Type cannot be empty in either English or Hindi",
      });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (designationId && !mongoose.Types.ObjectId.isValid(designationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid designation ID",
      });
    }

    // --- File update ---
    if (req.file) {
      if (officer.photo) {
        const oldFilePath = path.join(process.cwd(), "uploads", officer.photo);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      officer.photo = req.file.filename;
    }

    // --- Update fields ---
    if (name_en || name_hi) {
      officer.name = {
        en: name_en ? name_en.trim() : officer.name?.en,
        hi: name_hi ? name_hi.trim() : officer.name?.hi,
      };
    }

    if (type_en || type_hi) {
      officer.type = {
        en: type_en ? type_en.trim() : officer.type?.en,
        hi: type_hi ? type_hi.trim() : officer.type?.hi,
      };
    }

    if (photoTitle !== undefined) officer.photoTitle = photoTitle ? photoTitle.trim() : "";
    if (number !== undefined) officer.number = number.trim();
    if (email !== undefined) officer.email = email.toLowerCase().trim();
    if (designationId !== undefined) officer.designationId = designationId;
    if (isActive !== undefined) officer.isActive = isActive;

    officer.updatedBy = req.user?.id;
    officer.updatedAt = new Date();

    const updatedOfficer = await officer.save();

    return res.status(200).json({
      success: true,
      message: "Vigilance Officer updated successfully",
      data: updatedOfficer,
    });
  } catch (error) {
    console.error("Error updating Vigilance Officer:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};


export const updateVigilanceOfficerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // Validate isActive
    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    // Validate ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Vigilance Officer ID",
      });
    }

    // Update status
    const officer = await VigilanceOfficer.findByIdAndUpdate(
      id,
      {
        isActive: isActive,
        updatedBy: req.user?.id,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "Vigilance Officer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vigilance Officer status updated successfully",
      data: officer,
    });
  } catch (error) {
    console.error("Error updating Vigilance Officer status:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};





// this is use for web
export const getVigilanceOfficersByType = async (req, res) => {
  try {
    const { type } = req.params;

    if (!type || type.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Type parameter is required",
      });
    }

    // Fetch officers with matching type.en and active status
    const officers = await VigilanceOfficer.find({
      "type.en": type.trim(),
      isActive: true,
    })
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .populate("designationId", "name")
      .sort({ createdAt: -1 });

    // Map to clean response
    const data = officers.map((officer) => ({
      id: officer._id,
      name: officer.name || { en: "", hi: "" },
      type: officer.type || { en: "", hi: "" },
      photo: officer.photo || "",
      photoTitle: officer.photoTitle || "",
      number: officer.number || "",
      email: officer.email || "",
      designation: officer.designationId || null,
      isActive: officer.isActive,
      createdBy: officer.createdBy || null,
      updatedBy: officer.updatedBy || null,
      createdAt: officer.createdAt,
      updatedAt: officer.updatedAt || null,
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Error fetching Vigilance Officers by type:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching Vigilance Officers by type",
    });
  }
};