import Professor from "../models/ProfessorSchema.js";
import fs from "fs";
import path from "path";

export const createProfessor = async (req, res) => {
  try {
    const {
      name_en,
      name_hi,
      workingPeriod,
      email1,
      email2,
      phone,
      education_en,
      education_hi,
      photoTitle,
      message_en,
      message_hi,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Photo is required",
      });
    }

    const professor = new Professor({
      name: {
        en: name_en,
        hi: name_hi,
      },

      workingPeriod,

      email1,
      email2,
      phone,

      education: {
        en: education_en,
        hi: education_hi,
      },

      photoTitle,
      photo: req.file.filename,

      message: {
        en: message_en,
        hi: message_hi,
      },

      createby: req.user.id,
    });

    const savedProfessor = await professor.save();

    return res.status(201).json({
      success: true,
      message: "Professor created successfully",
      data: savedProfessor,
    });
  } catch (error) {
    // Delete uploaded image if save fails
    if (req.file) {
      const filePath = path.join("uploads", req.file.filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (err) => err.message
      );

      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const getProfessors = async (req, res) => {
  try {
    const isAll = req.query.all === "true";

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const total = await Professor.countDocuments();

    let query = Professor.find()
      .sort({ createdate: -1 })
      .select("-__v");

    let professors;

    if (isAll) {
      professors = await query;
    } else {
      professors = await query.skip(skip).limit(limit);
    }

    res.status(200).json({
      success: true,
      count: professors.length,
      total,
      page: isAll ? null : page,
      totalPages: isAll ? 1 : Math.ceil(total / limit),
      data: professors,
    });
  } catch (error) {
    console.error("getProfessors error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};


export const updateProfessorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: "isActive value is required",
      });
    }

    const professor = await Professor.findByIdAndUpdate(
      id,
      {
        isActive: isActive === "true" || isActive === true,
        updateby: req.user?.id,
        updatedate: new Date(),
      },
      { new: true }
    );

    if (!professor) {
      return res.status(404).json({
        success: false,
        message: "Professor not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Professor status updated successfully",
      data: professor,
    });
  } catch (error) {
    console.error("updateProfessorStatus error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const updateProfessor = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name_en,
      name_hi,
      workingPeriod,
      photoTitle,
      email1,
      email2,
      phone,
      education_en,
      education_hi,
      message_en,
      message_hi,
      isActive,
    } = req.body;

    const professor = await Professor.findById(id);

    if (!professor) {
      return res.status(404).json({
        success: false,
        message: "Professor not found",
      });
    }

    // NAME update
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

      professor.name = {
        en: name_en ?? professor.name.en,
        hi: name_hi ?? professor.name.hi,
      };
    }

    // EMAILS
    if (email1 !== undefined) professor.email1 = email1;
    if (email2 !== undefined) professor.email2 = email2;

    // PHONE
    if (phone !== undefined) professor.phone = phone;

    // EDUCATION
    if (education_en !== undefined || education_hi !== undefined) {
      professor.education = {
        en: education_en ?? professor.education?.en,
        hi: education_hi ?? professor.education?.hi,
      };
    }

    // MESSAGE
    if (message_en !== undefined || message_hi !== undefined) {
      professor.message = {
        en: message_en ?? professor.message?.en,
        hi: message_hi ?? professor.message?.hi,
      };
    }

    // OTHER FIELDS
    if (workingPeriod !== undefined) {
      professor.workingPeriod = workingPeriod;
    }

    if (photoTitle !== undefined) {
      professor.photoTitle = photoTitle;
    }

    if (isActive !== undefined) {
      professor.isActive = isActive === "true" || isActive === true;
    }

    // SYSTEM FIELDS
    professor.updateby = req.user?.id;
    professor.updatedate = Date.now();

    // IMAGE UPDATE
    if (req.file) {
      if (professor.photo) {
        const oldImagePath = path.join("uploads", professor.photo);

        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      professor.photo = req.file.filename;
    }

    const updatedProfessor = await professor.save();

    return res.status(200).json({
      success: true,
      message: "Professor updated successfully",
      data: updatedProfessor,
    });
  } catch (error) {
    console.error("updateProfessor error:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (val) => val.message
      );

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


export const getAllProfessorWeb = async (req, res) => {
  try {
    const professorList = await Professor.find()
      .populate("createby", "name email")
      .populate("updateby", "name email")
      .sort({ createdate: -1 });

    const data = professorList.map((professor) => ({
      id: professor._id,

      name: professor.name || { en: "", hi: "" },
      workingPeriod: professor.workingPeriod || "",
      photoTitle: professor.photoTitle || "",
      photo: professor.photo || null,

      email1: professor.email1 || "",
      email2: professor.email2 || "",
      phone: professor.phone || "",

      education: professor.education || { en: "", hi: "" },
      message: professor.message || { en: "", hi: "" },

      isActive: professor.isActive,

      createdBy: professor.createby || null,
      updatedBy: professor.updateby || null,

      createdAt: professor.createdate,
      updatedAt: professor.updatedate || null,
    }));

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("getAllProfessorWeb error:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching professors",
    });
  }
};