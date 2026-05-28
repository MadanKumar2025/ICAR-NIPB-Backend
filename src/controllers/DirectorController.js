import Director from "../models/DirectorSchema.js";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

export const createDirector = async (req, res) => {
  try {
    const {
      name_en,
      name_hi,
      workingPeriod,
      photoTitle,
      email,
      phone,
      education_en,
      education_hi,
      acting,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Photo is required and must be an image",
      });
    }

    const photo = req.file.filename;
    const createby = req.user.id;

    const director = new Director({
      name: { en: name_en, hi: name_hi },
      workingPeriod,
      photoTitle,
      photo,
      email,
      phone,

      education: {
        en: education_en,
        hi: education_hi,
      },
      acting: acting === "true" || acting === true,
      createby,
    });

    const savedDirector = await director.save();

    res.status(201).json({
      success: true,
      message: "Director created successfully",
      data: savedDirector,
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

// export const getDirectors = async (req, res) => {
//   try {
//     const isAll = req.query.all === "true";

//     const page = parseInt(req.query.page) || 1;
//     const limit = 10;
//     const skip = (page - 1) * limit;

//     let query = Director.find().sort({ createdate: -1 });

//     let directors;
//     const total = await Director.countDocuments();

//     if (isAll) {
//       directors = await query;
//     } else {
//       directors = await query.skip(skip).limit(limit);
//     }

//     res.status(200).json({
//       success: true,
//       count: directors.length,
//       total: total,
//       page: isAll ? null : page,
//       totalPages: isAll ? 1 : Math.ceil(total / limit),
//       data: directors,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: error.message || "Internal server error",
//     });
//   }
// };

export const getDirectors = async (req, res) => {
  try {
    const isAll = req.query.all === "true";

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const total = await Director.countDocuments();

    let query = Director.find().sort({ createdate: -1 }).select("-__v"); // optional clean response

    let directors;

    if (isAll) {
      directors = await query;
    } else {
      directors = await query.skip(skip).limit(limit);
    }

    res.status(200).json({
      success: true,
      count: directors.length,
      total,
      page: isAll ? null : page,
      totalPages: isAll ? 1 : Math.ceil(total / limit),
      data: directors,
    });
  } catch (error) {
    console.error("getDirectors error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const updateDirectorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: "isActive value is required",
      });
    }

    const director = await Director.findByIdAndUpdate(
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
        message: "Director not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Director status updated successfully",
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

// export const updateDirector = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const { name_en, name_hi, workingPeriod, photoTitle, acting, isActive } =
//       req.body;

//     const director = await Director.findById(id);

//     if (!director) {
//       return res.status(404).json({
//         success: false,
//         message: "Director not found",
//       });
//     }

//     // Name validation
//     if (name_en !== undefined || name_hi !== undefined) {
//       if (
//         (!name_en || name_en.trim() === "") &&
//         (!name_hi || name_hi.trim() === "")
//       ) {
//         return res.status(400).json({
//           success: false,
//           message: "Name (English or Hindi) cannot be empty",
//         });
//       }

//       director.name = {
//         en: name_en ?? director.name.en,
//         hi: name_hi ?? director.name.hi,
//       };
//     }

//     // Update fields
//     if (workingPeriod !== undefined) {
//       director.workingPeriod = workingPeriod;
//     }

//     if (photoTitle !== undefined) {
//       director.photoTitle = photoTitle;
//     }

//     if (acting !== undefined) {
//       director.acting = acting === "true" || acting === true;
//     }

//     if (isActive !== undefined) {
//       director.isActive = isActive === "true" || isActive === true;
//     }

//     director.updateby = req.user?.id;
//     director.updatedate = Date.now();

//     // Image replace logic
//     if (req.file) {
//       if (director.photo) {
//         const oldImagePath = path.join("uploads", director.photo);

//         if (fs.existsSync(oldImagePath)) {
//           fs.unlinkSync(oldImagePath);
//         }
//       }

//       director.photo = req.file.filename;
//     }

//     const updatedDirector = await director.save();

//     return res.status(200).json({
//       success: true,
//       message: "Director updated successfully",
//       data: updatedDirector,
//     });
//   } catch (error) {
//     console.error(error);

//     // Duplicate error
//     if (error.code === 11000) {
//       const field = Object.keys(error.keyValue)[0];
//       return res.status(400).json({
//         success: false,
//         message: `${field} already exists`,
//       });
//     }

//     // Validation error
//     if (error.name === "ValidationError") {
//       const messages = Object.values(error.errors).map((val) => val.message);
//       return res.status(400).json({
//         success: false,
//         message: messages.join(", "),
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong",
//     });
//   }
// };

// this is use for web

export const updateDirector = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name_en,
      name_hi,
      workingPeriod,
      photoTitle,
      email,
      phone,
      education_en,
      education_hi,
      acting,
      isActive,
    } = req.body;

    const director = await Director.findById(id);

    if (!director) {
      return res.status(404).json({
        success: false,
        message: "Director not found",
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

      director.name = {
        en: name_en ?? director.name.en,
        hi: name_hi ?? director.name.hi,
      };
    }

    if (email !== undefined) {
      director.email = email;
    }

    if (phone !== undefined) {
      director.phone = phone;
    }

    if (education_en !== undefined || education_hi !== undefined) {
      director.education = {
        en: education_en ?? director.education?.en,
        hi: education_hi ?? director.education?.hi,
      };
    }

    if (workingPeriod !== undefined) {
      director.workingPeriod = workingPeriod;
    }

    if (photoTitle !== undefined) {
      director.photoTitle = photoTitle;
    }

    if (acting !== undefined) {
      director.acting = acting === "true" || acting === true;
    }

    if (isActive !== undefined) {
      director.isActive = isActive === "true" || isActive === true;
    }

    director.updateby = req.user?.id;
    director.updatedate = Date.now();

    if (req.file) {
      if (director.photo) {
        const oldImagePath = path.join("uploads", director.photo);

        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      director.photo = req.file.filename;
    }

    const updatedDirector = await director.save();

    return res.status(200).json({
      success: true,
      message: "Director updated successfully",
      data: updatedDirector,
    });
  } catch (error) {
    console.error("updateDirector error:", error);

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

// this is use for web
// export const getAllDirectorWeb = async (req, res) => {
//   try {
//     const directorList = await Director.find()
//       .populate("createby", "name email")
//       .populate("updateby", "name email")
//       .sort({ createdate: -1 });

//     const data = directorList.map((director) => ({
//       id: director._id,
//       name: director.name || { en: "", hi: "" },
//       workingPeriod: director.workingPeriod || "",
//       photoTitle: director.photoTitle || "",
//       photo: director.photo || null,
//       acting: director.acting,
//       isActive: director.isActive,

//       createdBy: director.createby || null,
//       updatedBy: director.updateby || null,
//       createdAt: director.createdate,
//       updatedAt: director.updatedate || null,
//     }));

//     res.status(200).json({
//       success: true,
//       count: data.length,
//       data,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching directors",
//     });
//   }
// };

export const getAllDirectorWeb = async (req, res) => {
  try {
    const directorList = await Director.find()
      .populate("createby", "name email")
      .populate("updateby", "name email")
      .sort({ createdate: -1 });

    const data = directorList.map((director) => ({
      id: director._id,

      name: director.name || { en: "", hi: "" },
      workingPeriod: director.workingPeriod || "",
      photoTitle: director.photoTitle || "",
      photo: director.photo || null,

      email: director.email || "",
      phone: director.phone || "",
      education: director.education || { en: "", hi: "" },

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
    console.error("getAllDirectorWeb error:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching directors",
    });
  }
};
