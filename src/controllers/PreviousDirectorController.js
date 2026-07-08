import PreviousDirector from "../models/PreviousDirectorSchema.js";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

export const createPreviousDirector = async (req, res) => {
  try {
    const {
      name_en,
      name_hi,
      workingPeriod,
      photoTitle,
      acting,
      displayOrderNumber,
      webAddress,
    } = req.body;

    // VALIDATION

    const requiredFields = ["name_en", "name_hi", "workingPeriod"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Required fields missing: ${missingFields.join(", ")}`,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Photo is required and must be an image",
      });
    }

    const photo = req?.file?.filename;
    const createby = req?.user?.id;

    const previousDirector = new PreviousDirector({
      name: { en: name_en, hi: name_hi },
      workingPeriod,
      webAddress,
      photoTitle,
      photo,
      acting: acting === "true" || acting === true,
      displayOrderNumber: displayOrderNumber ? Number(displayOrderNumber) : 0,
      createby,
    });

    const savedPreviousDirector = await previousDirector.save();

    res.status(201).json({
      success: true,
      message: "Previous Director created successfully",
      data: savedPreviousDirector,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getPreviousDirectors = async (req, res) => {
  try {
    const directorList = await PreviousDirector.find()
      .populate("createby", "name email")
      .populate("updateby", "name email")
      .sort({ displayOrderNumber: 1 });

    const data = directorList.map((director) => ({
      id: director._id,
      name: director.name || { en: "", hi: "" },
      workingPeriod: director.workingPeriod || "",
      photoTitle: director.photoTitle || "",
      webAddress: director.webAddress || null,
      photo: director.photo || null,
      acting: director.acting,
      displayOrderNumber: director.displayOrderNumber,
      isActive: director.isActive,

      createdBy: director.createby || null,
      updatedBy: director.updateby || null,
      createdAt: director.createdate,
      updatedAt: director.updatedate || null,
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
      message: "Error fetching previous directors",
    });
  }
};

export const updatePreviousDirectorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // check required field
    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: "isActive value is required",
      });
    }

    const director = await PreviousDirector.findByIdAndUpdate(
      id,
      {
        isActive: isActive === "true" || isActive === true,
        updateby: req.user?.id,
        updatedate: new Date(),
      },
      { new: true },
    );

    if (!director) {
      return res.status(404).json({
        success: false,
        message: "Previous Director not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Previous Director status updated successfully",
      data: director,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const updatePreviousDirector = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name_en,
      name_hi,
      workingPeriod,
      photoTitle,
      acting,
      isActive,
      displayOrderNumber,
      webAddress,
    } = req.body;

    const previousDirector = await PreviousDirector.findById(id);

    if (!previousDirector) {
      return res.status(404).json({
        success: false,
        message: "Previous Director not found",
      });
    }

    if (name_en !== undefined || name_hi !== undefined) {
      if (
        (!name_en || name_en.trim() === "") &&
        (!name_hi || name_hi.trim() === "")
      ) {
        return res.status(400).json({
          success: false,
          message: "Name (English or Hindi) cannot be empty",
        });
      }

      previousDirector.name = {
        en: name_en ?? previousDirector.name.en,
        hi: name_hi ?? previousDirector.name.hi,
      };
    }

    if (workingPeriod !== undefined) {
      previousDirector.workingPeriod = workingPeriod;
    }

    if (photoTitle !== undefined) {
      previousDirector.photoTitle = photoTitle;
    }

    if (acting !== undefined) {
      previousDirector.acting = acting === true || acting === "true";
    }

    if (isActive !== undefined) {
      previousDirector.isActive = isActive === true || isActive === "true";
    }

    if (displayOrderNumber !== undefined) {
      const orderNum = Number(displayOrderNumber);

      if (isNaN(orderNum)) {
        return res.status(400).json({
          success: false,
          message: "displayOrderNumber must be a valid number",
        });
      }

      previousDirector.displayOrderNumber = orderNum;
    }
    if (webAddress !== undefined) {
      if (webAddress && !webAddress.startsWith("http")) {
        return res.status(400).json({
          success: false,
          message: "Invalid web address",
        });
      }

      previousDirector.webAddress = webAddress;
    }

    previousDirector.updateby = req.user?.id;
    previousDirector.updatedate = new Date();

    if (req.file) {
      if (previousDirector.photo) {
        const oldImagePath = path.join("uploads", previousDirector.photo);

        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      previousDirector.photo = req.file.filename;
    }

    const updatedPreviousDirector = await previousDirector.save();

    return res.status(200).json({
      success: true,
      message: "Previous Director updated successfully",
      data: updatedPreviousDirector,
    });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

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

export const deletePreviousDirector = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Previous Director ID",
      });
    }

    // Find Director
    const previousDirector = await PreviousDirector.findById(id);

    if (!previousDirector) {
      return res.status(404).json({
        success: false,
        message: "Previous Director not found",
      });
    }

    // Delete Photo if exists
    if (previousDirector.photo) {
      const photoPath = path.join(
        process.cwd(),
        "uploads",
        previousDirector.photo
      );

      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    // Delete Record
    await PreviousDirector.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Previous Director deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// this is use for web
export const getAllPreviousDirectorWeb = async (req, res) => {
  try {
    const directorList = await PreviousDirector.find()
      .populate("createby", "name email")
      .populate("updateby", "name email")
      .sort({ displayOrderNumber: 1 });

    const data = directorList.map((director) => ({
      id: director._id,
      name: director.name || { en: "", hi: "" },
      workingPeriod: director.workingPeriod || "",
      webAddress: director.webAddress || null,

      photoTitle: director.photoTitle || "",
      photo: director.photo || null,
      acting: director.acting,
      displayOrderNumber: director.displayOrderNumber,
      isActive: director.isActive,

      createdBy: director.createby || null,
      updatedBy: director.updateby || null,
      createdAt: director.createdate,
      updatedAt: director.updatedate || null,
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
      message: "Error fetching previous directors",
    });
  }
};
