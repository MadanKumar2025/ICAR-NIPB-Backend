import Help from "../models/HelpSchema.js";
import mongoose from "mongoose";

export const createHelp = async (req, res) => {
  try {
    const { title_en, title_hi, description_en, description_hi } = req.body;

    // validations
    if (!title_en || !title_hi) {
      return res.status(400).json({
        success: false,
        message: "Title (EN & HI) is required",
      });
    }

    if (!description_en || !description_hi) {
      return res.status(400).json({
        success: false,
        message: "Description (EN & HI) is required",
      });
    }

    const createby = req.user?.id;

    const help = new Help({
      title: {
        en: title_en,
        hi: title_hi,
      },
      description: {
        en: description_en,
        hi: description_hi,
      },
      createby,
      createdate: new Date(),
    });

    const savedHelp = await help.save();

    res.status(201).json({
      success: true,
      message: "Help entry created successfully",
      data: savedHelp,
    });
  } catch (error) {
    console.error("Create Help Error:", error);

    // validation error
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

export const getAllHelp = async (req, res) => {
  try {
    const helpList = await Help.find()
      .populate("createby", "name email")
      .populate("updateby", "name email")
      .sort({ createdate: -1 });

    const data = helpList.map((help) => ({
      id: help._id,
      title: help.title || { en: "", hi: "" },
      description: help.description || { en: "", hi: "" },
      isActive: help.isActive,
      createdBy: help.createby || null,
      updatedBy: help.updateby || null,
      createdAt: help.createdate,
      updatedAt: help.updatedate || null,
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Get All Help Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching help entries",
    });
  }
};

export const updateHelp = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing Help ID",
      });
    }

    const { title_en, title_hi, description_en, description_hi, isActive } =
      req.body;

    const help = await Help.findById(id);

    if (!help) {
      return res.status(404).json({
        success: false,
        message: "Help entry not found",
      });
    }

    if (
      (title_en && title_en.trim() === "") ||
      (title_hi && title_hi.trim() === "")
    ) {
      return res.status(400).json({
        success: false,
        message: "Title cannot be empty",
      });
    }

    if (
      (description_en && description_en.trim() === "") ||
      (description_hi && description_hi.trim() === "")
    ) {
      return res.status(400).json({
        success: false,
        message: "Description cannot be empty",
      });
    }

    if (title_en && title_en.trim() !== help.title?.en) {
      const existingHelp = await Help.findOne({
        "title.en": title_en.trim(),
        _id: { $ne: id },
      });

      if (existingHelp) {
        return res.status(400).json({
          success: false,
          message: "Help entry with this English title already exists",
        });
      }
    }

    if (title_en || title_hi) {
      help.title = {
        en: title_en ? title_en.trim() : help.title?.en,
        hi: title_hi ? title_hi.trim() : help.title?.hi,
      };
    }

    if (description_en || description_hi) {
      help.description = {
        en: description_en ? description_en.trim() : help.description?.en,
        hi: description_hi ? description_hi.trim() : help.description?.hi,
      };
    }

    if (isActive !== undefined) help.isActive = isActive;

    help.updateby = req.user?.id;
    help.updatedate = new Date();

    const updatedHelp = await help.save();

    return res.status(200).json({
      success: true,
      message: "Help entry updated successfully",
      data: updatedHelp,
    });
  } catch (error) {
    console.error("Error updating Help:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const updateHelpStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const help = await Help.findByIdAndUpdate(
      id,
      {
        isActive: isActive,
        updateby: req.user?.id,
        updatedate: new Date(),
      },
      { new: true },
    );

    if (!help) {
      return res.status(404).json({
        success: false,
        message: "Help entry not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Help status updated successfully",
      data: help,
    });
  } catch (error) {
    console.error("Update Help Status Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// this is use for web
export const getAllHelpWeb = async (req, res) => {
  try {
    const helpList = await Help.find()
      .populate("createby", "name email")
      .populate("updateby", "name email")
      .sort({ createdate: -1 });

    const data = helpList.map((help) => ({
      id: help._id,
      title: help.title || { en: "", hi: "" },
      description: help.description || { en: "", hi: "" },
      isActive: help.isActive,
      createdate: help.createdate,
      updatedate: help.updatedate || null,
      createby: help.createby || null,
      updateby: help.updateby || null,
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
      message: "Error fetching help data",
    });
  }
};
