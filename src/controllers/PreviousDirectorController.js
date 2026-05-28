import PreviousDirector from "../models/PreviousDirectorSchema.js";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

export const createPreviousDirector = async (req, res) => {
  try {
    const { name_en, name_hi, workingPeriod, photoTitle, acting } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Photo is required and must be an image",
      });
    }

    const photo = req.file.filename;
    const createby = req.user.id;

    const previousDirector = new PreviousDirector({
      name: { en: name_en, hi: name_hi },
      workingPeriod,
      photoTitle,
      photo,
      acting: acting === "true" || acting === true,
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
    const isAll = req.query.all === "true";

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // base query (latest first)
    let query = PreviousDirector.find().sort({ createdate: -1 });

    let directors;
    const total = await PreviousDirector.countDocuments();

    if (isAll) {
      directors = await query;
    } else {
      directors = await query.skip(skip).limit(limit);
    }

    res.status(200).json({
      success: true,
      count: directors.length,
      total: total,
      page: isAll ? null : page,
      totalPages: isAll ? 1 : Math.ceil(total / limit),
      data: directors,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
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
      { new: true }
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

    const { name_en, name_hi, workingPeriod, photoTitle, acting, isActive } =
      req.body;

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
      previousDirector.acting = acting === "true" || acting === true;
    }

    if (isActive !== undefined) {
      previousDirector.isActive = isActive === "true" || isActive === true;
    }

    previousDirector.updateby = req.user?.id;
    previousDirector.updatedate = Date.now();

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
      message: "previousDirector updated successfully",
      data: updatedPreviousDirector,
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

    return res.status(500).json({
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
      .sort({ createdate: -1 });

    const data = directorList.map((director) => ({
      id: director._id,
      name: director.name || { en: "", hi: "" },
      workingPeriod: director.workingPeriod || "",
      photoTitle: director.photoTitle || "",
      photo: director.photo || null,
      acting: director.acting,
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