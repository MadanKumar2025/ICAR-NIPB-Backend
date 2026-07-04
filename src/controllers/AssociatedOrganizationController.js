import AssociatedOrganization from "../models/AssociatedOrganizationSchema.js";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";

export const createAssociatedOrganization = async (req, res) => {
  try {
    const { photoTitle, relatedLink, isActive } = req.body;

    // --- Validations ---
    if (!photoTitle || photoTitle.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Photo title is required",
      });
    }

    if (relatedLink && !/^https?:\/\/.+/.test(relatedLink)) {
      return res.status(400).json({
        success: false,
        message: "Invalid related link format",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Photo is required",
      });
    }

    // --- Create Object ---
    const organization = new AssociatedOrganization({
      photo: req.file.filename,
      photoTitle: photoTitle.trim(),
      relatedLink: relatedLink || null,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user.id,
    });

    // --- Save to DB ---
    const savedData = await organization.save();

    return res.status(201).json({
      success: true,
      message: "Associated Organization created successfully",
      data: savedData,
    });
  } catch (error) {
    console.error("Error creating Associated Organization:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const getAllAssociatedOrganizations = async (req, res) => {
  try {
    const list = await AssociatedOrganization.find()
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdAt: -1 });

    const data = list.map((item) => ({
      id: item._id,
      photo: item.photo,
      photoTitle: item.photoTitle || "",
      relatedLink: item.relatedLink || "",
      isActive: item.isActive,
      createdBy: item.createdBy || null,
      updatedBy: item.updatedBy || null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt || null,
    }));

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Error fetching Associated Organizations:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching Associated Organizations",
    });
  }
};


export const updateAssociatedOrganization = async (req, res) => {
  try {
    const { id } = req.params;

    // --- ID validation ---
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing ID",
      });
    }

    const { photoTitle, relatedLink, isActive } = req.body;

    const organization = await AssociatedOrganization.findById(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Associated Organization not found",
      });
    }

    // --- Validation ---
    if (photoTitle && photoTitle.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Photo title cannot be empty",
      });
    }

    if (relatedLink && !/^https?:\/\/.+/.test(relatedLink)) {
      return res.status(400).json({
        success: false,
        message: "Invalid related link format",
      });
    }

    // --- Image update ---
    if (req.file) {
      if (organization.photo) {
        const oldFilePath = path.join(
          process.cwd(),
          "uploads",
          organization.photo
        );

        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      organization.photo = req.file.filename;
    }

    // --- Update fields ---
    if (photoTitle) organization.photoTitle = photoTitle.trim();

    if (relatedLink !== undefined)
      organization.relatedLink = relatedLink || null;

    if (isActive !== undefined) organization.isActive = isActive;

    organization.updatedBy = req.user?.id;
    organization.updatedAt = new Date();

    const updatedData = await organization.save();

    return res.status(200).json({
      success: true,
      message: "Associated Organization updated successfully",
      data: updatedData,
    });
  } catch (error) {
    console.error("Error updating Associated Organization:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};


export const updateAssociatedOrganizationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // --- ID validation ---
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing ID",
      });
    }

    // --- Boolean validation ---
    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    // --- Update status ---
    const organization = await AssociatedOrganization.findByIdAndUpdate(
      id,
      {
        isActive: isActive,
        updatedBy: req.user?.id,
        updatedAt: new Date(),
      },
      { new: true }
    );

    // --- Not found ---
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Associated Organization not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: organization,
    });
  } catch (error) {
    console.error("Error updating status:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};



// this is use for web
export const getAllAssociatedOrganizationsWeb = async (req, res) => {
  try {
    const orgList = await AssociatedOrganization.find()
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdAt: -1 });

    const data = orgList.map((org) => ({
      id: org._id,
      photo: org.photo,
      photoTitle: org.photoTitle,
      relatedLink: org.relatedLink || null,
      isActive: org.isActive,

      createdBy: org.createdBy || null,
      updatedBy: org.updatedBy || null,

      createdAt: org.createdAt,
      updatedAt: org.updatedAt || null,
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
      message: "Error fetching associated organizations",
    });
  }
};