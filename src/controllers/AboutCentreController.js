import mongoose from "mongoose";
import AboutCentre from "../models/AboutCentreSchema.js";
import fs from "fs";
import path from "path"; 

export const createAboutCentre = async (req, res) => {
  try {
    const {
      topSection_en,
      topSection_hi,

      MediyamSection1_en,
      MediyamSection1_hi,

      MediyamSection2_en,
      MediyamSection2_hi,

      MediyamSection3_en,
      MediyamSection3_hi,

      BotemSection_en,
      BotemSection_hi,
    } = req.body;

    // --- Validations ---
    if (!topSection_en || !topSection_hi) {
      return res.status(400).json({
        success: false,
        message: "Top Section required in both English & Hindi",
      });
    }

    if (
      !MediyamSection1_en ||
      !MediyamSection1_hi ||
      !MediyamSection2_en ||
      !MediyamSection2_hi ||
      !MediyamSection3_en ||
      !MediyamSection3_hi
    ) {
      return res.status(400).json({
        success: false,
        message: "All Mediyam Sections required in both English & Hindi",
      });
    }

    // --- Create Object ---
    const aboutCentre = new AboutCentre({
      topSection: {
        en: topSection_en,
        hi: topSection_hi,
      },

      topImage: req.file ? req.file.filename : null,

      MediyamSection1: {
        en: MediyamSection1_en,
        hi: MediyamSection1_hi,
      },

      MediyamSection2: {
        en: MediyamSection2_en,
        hi: MediyamSection2_hi,
      },

      MediyamSection3: {
        en: MediyamSection3_en,
        hi: MediyamSection3_hi,
      },

      BotemSection: {
        en: BotemSection_en || null,
        hi: BotemSection_hi || null,
      },

      createdBy: req.user.id,
    });

    // --- Save ---
    const savedData = await aboutCentre.save();

    return res.status(201).json({
      success: true,
      message: "About Centre created successfully",
      data: savedData,
    });
  } catch (error) {
    console.error("Error creating About Centre:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const getAboutCentre = async (req, res) => {
  try {
    const list = await AboutCentre.find()
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdAt: -1 });

    const data = list.map((item) => ({
      id: item._id,

      topSection: item.topSection || { en: "", hi: "" },

      topImage: item.topImage || null,

      MediyamSection1: item.MediyamSection1 || { en: "", hi: "" },
      MediyamSection2: item.MediyamSection2 || { en: "", hi: "" },
      MediyamSection3: item.MediyamSection3 || { en: "", hi: "" },

      BotemSection: item.BotemSection || { en: "", hi: "" },

      isActive: item.isActive,

      createdBy: item.createdBy || null,
      updatedBy: item.updatedBy || null,

      createdAt: item.createdAt,
      updatedAt: item.updatedAt || null,
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
      message: "Error fetching About Centre data",
    });
  }
};


export const updateAboutCentre = async (req, res) => {
  try {
    const { id } = req.params;

  
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing About Centre ID",
      });
    }

    const {
      topSection_en,
      topSection_hi,

      MediyamSection1_en,
      MediyamSection1_hi,

      MediyamSection2_en,
      MediyamSection2_hi,

      MediyamSection3_en,
      MediyamSection3_hi,

      BotemSection_en,
      BotemSection_hi,
    } = req.body;

    const data = await AboutCentre.findById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "About Centre not found",
      });
    }

     
    if (
      (topSection_en && topSection_en.trim() === "") ||
      (topSection_hi && topSection_hi.trim() === "")
    ) {
      return res.status(400).json({
        success: false,
        message: "Top Section cannot be empty",
      });
    }
 
    if (req.file) {
      if (data.topImage) {
        const oldPath = path.join(process.cwd(), "uploads", data.topImage);

        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      data.topImage = req.file.filename;
    }
 
    if (topSection_en || topSection_hi) {
      data.topSection = {
        en: topSection_en ? topSection_en.trim() : data.topSection?.en,
        hi: topSection_hi ? topSection_hi.trim() : data.topSection?.hi,
      };
    }

    if (MediyamSection1_en || MediyamSection1_hi) {
      data.MediyamSection1 = {
        en: MediyamSection1_en
          ? MediyamSection1_en.trim()
          : data.MediyamSection1?.en,
        hi: MediyamSection1_hi
          ? MediyamSection1_hi.trim()
          : data.MediyamSection1?.hi,
      };
    }

    if (MediyamSection2_en || MediyamSection2_hi) {
      data.MediyamSection2 = {
        en: MediyamSection2_en
          ? MediyamSection2_en.trim()
          : data.MediyamSection2?.en,
        hi: MediyamSection2_hi
          ? MediyamSection2_hi.trim()
          : data.MediyamSection2?.hi,
      };
    }

    if (MediyamSection3_en || MediyamSection3_hi) {
      data.MediyamSection3 = {
        en: MediyamSection3_en
          ? MediyamSection3_en.trim()
          : data.MediyamSection3?.en,
        hi: MediyamSection3_hi
          ? MediyamSection3_hi.trim()
          : data.MediyamSection3?.hi,
      };
    }

    if (BotemSection_en || BotemSection_hi) {
      data.BotemSection = {
        en: BotemSection_en
          ? BotemSection_en.trim()
          : data.BotemSection?.en,
        hi: BotemSection_hi
          ? BotemSection_hi.trim()
          : data.BotemSection?.hi,
      };
    }

  
    data.updatedBy = req.user?.id;
    data.updatedAt = new Date();

    const updated = await data.save();

    return res.status(200).json({
      success: true,
      message: "About Centre updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating About Centre:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};


// this is use for web
export const getAllAboutCentreWeb = async (req, res) => {
  try {
    const list = await AboutCentre.find({ isActive: true })
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdAt: -1 });

    const data = list.map((item) => ({
      id: item._id,

      topSection: item.topSection || { en: "", hi: "" },
      topImage: item.topImage || null,

      MediyamSection1: item.MediyamSection1 || { en: "", hi: "" },
      MediyamSection2: item.MediyamSection2 || { en: "", hi: "" },
      MediyamSection3: item.MediyamSection3 || { en: "", hi: "" },

      BotemSection: item.BotemSection || { en: "", hi: "" },

      isActive: item.isActive,
      createdBy: item.createdBy || null,
      updatedBy: item.updatedBy || null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt || null,
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Error fetching About Centre data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching About Centre data",
    });
  }
};