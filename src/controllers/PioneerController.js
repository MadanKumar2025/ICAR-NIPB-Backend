import Pioneer from "../models/PioneerSchema.js";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

// export const createpioneer = async (req, res) => {
//   try {
//     const { title_en, title_hi, photoTitle, url, isActive } = req.body;

//     // file check (multer)
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "Photo is required and must be an image",
//       });
//     }

//     const photo = req.file.filename;
//     const createby = req.user.id;

//     const pioneer = new pioneer({
//       title: {
//         en: title_en,
//         hi: title_hi,
//       },
//       photo,
//       photoTitle,
//       url,
//       isActive: isActive === "true" || isActive === true,
//       createby,
//     });

//     const savedData = await Pioneer.save();

//     res.status(201).json({
//       success: true,
//       message: "pioneer created successfully",
//       data: savedData,
//     });
//   } catch (error) {
//     // duplicate key error (if any unique field added later)
//     if (error.code === 11000) {
//       const field = Object.keys(error.keyValue)[0];
//       return res.status(400).json({
//         success: false,
//         message: `${field} already exists`,
//       });
//     }

//     // validation error
//     if (error.name === "ValidationError") {
//       const messages = Object.values(error.errors).map((val) => val.message);
//       return res.status(400).json({
//         success: false,
//         message: messages.join(", "),
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Something went wrong",
//     });
//   }
// };

export const createpioneer  = async (req, res) => {
  try {
    const { title_en, title_hi, photoTitle, url, isActive } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Photo is required and must be an image",
      });
    }

    const photo = req.file.filename;
    const createby = req.user.id;

    const newPioneer = new Pioneer({
      title: {
        en: title_en,
        hi: title_hi,
      },
      photo,
      photoTitle,
      url,
      isActive: isActive === "true" || isActive === true,
      createby,
    });

    const savedData = await newPioneer.save();

    return res.status(201).json({
      success: true,
      message: "Pioneer created successfully",
      data: savedData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// export const getAllpioneer = async (req, res) => {
//   try {
//     const pioneer = await pioneer
//       .find()
//       .populate("createby", "name email")
//       .populate("updateby", "name email")
//       .sort({ createdate: -1 });

//     const data = pioneer.map((item) => ({
//       id: item._id,

//       title: item.title || { en: "", hi: "" },

//       photo: item.photo || "",
//       photoTitle: item.photoTitle || "",

//       url: item.url || "",

//       isActive: item.isActive,

//       createdBy: item.createby || null,
//       updatedBy: item.updateby || null,

//       createdAt: item.createdate,
//       updatedAt: item.updatedate || null,
//     }));

//     res.status(200).json({
//       success: true,
//       count: data.length,
//       data,
//     });
//   } catch (error) {
//     console.error("Error fetching pioneer:", error);

//     res.status(500).json({
//       success: false,
//       message: "Error fetching pioneer",
//     });
//   }
// };


export const getAllpioneer = async (req, res) => {
  try {
    const pioneers = await Pioneer.find()
      .populate("createby", "name email")
      .populate("updateby", "name email")
      .sort({ createdate: -1 });

    const data = pioneers.map((item) => ({
      id: item._id,

      title: item.title || { en: "", hi: "" },

      photo: item.photo || "",
      photoTitle: item.photoTitle || "",

      url: item.url || "",

      isActive: item.isActive,

      createdBy: item.createby || null,
      updatedBy: item.updateby || null,

      createdAt: item.createdate,
      updatedAt: item.updatedate || null,
    }));

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Error fetching pioneer:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching pioneer",
    });
  }
};

// export const updatepioneer = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const { title_en, title_hi, photoTitle, url, isActive } = req.body;

//     const record = await pioneer.findById(id);

//     if (!record) {
//       return res.status(404).json({
//         success: false,
//         message: "pioneer not found",
//       });
//     }

//     if (title_en !== undefined || title_hi !== undefined) {
//       record.title = {
//         en: title_en ?? record.title.en,
//         hi: title_hi ?? record.title.hi,
//       };
//     }

//     if (photoTitle !== undefined) {
//       record.photoTitle = photoTitle;
//     }

//     if (url !== undefined) {
//       record.url = url;
//     }

//     if (req.file) {
//       if (record.photo) {
//         const oldPath = path.join("uploads", record.photo);
//         if (fs.existsSync(oldPath)) {
//           fs.unlinkSync(oldPath);
//         }
//       }

//       record.photo = req.file.filename;
//     }

//     if (isActive !== undefined) {
//       record.isActive = isActive === "true" || isActive === true;
//     }

//     record.updateby = req.user?.id || null;
//     record.updatedate = new Date();

//     const updatedRecord = await record.save();

//     return res.status(200).json({
//       success: true,
//       message: "pioneer updated successfully",
//       data: updatedRecord,
//     });
//   } catch (error) {
//     console.error("Update pioneer Error =>", error);

//     if (error.name === "ValidationError") {
//       const messages = Object.values(error.errors).map((val) => val.message);
//       return res.status(400).json({
//         success: false,
//         message: messages.join(", "),
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Something went wrong",
//     });
//   }
// };

export const updatepioneer = async (req, res) => {
  try {
    const { id } = req.params;
    const { title_en, title_hi, photoTitle, url, isActive } = req.body;

    const record = await Pioneer.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "pioneer not found",
      });
    }

    if (title_en !== undefined || title_hi !== undefined) {
      record.title = {
        en: title_en ?? record.title.en,
        hi: title_hi ?? record.title.hi,
      };
    }

    if (photoTitle !== undefined) record.photoTitle = photoTitle;
    if (url !== undefined) record.url = url;

    if (req.file) {
      if (record.photo) {
        const oldPath = path.join(process.cwd(), "uploads", record.photo);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      record.photo = req.file.filename;
    }

    if (isActive !== undefined) {
      record.isActive = isActive === "true" || isActive === true;
    }

    record.updateby = req.user?.id || null;
    record.updatedate = new Date();

    const updatedRecord = await record.save();

    return res.status(200).json({
      success: true,
      message: "pioneer updated successfully",
      data: updatedRecord,
    });
  } catch (error) {
    console.error("Update pioneer Error =>", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// export const updatepioneerStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { isActive } = req.body;

//     const record = await pioneer.findById(id);

//     if (!record) {
//       return res.status(404).json({
//         success: false,
//         message: "pioneer not found",
//       });
//     }

//     record.isActive = isActive === "true" || isActive === true;

//     record.updateby = req.user?.id || null;
//     record.updatedate = new Date();

//     await record.save();

//     return res.status(200).json({
//       success: true,
//       message: `pioneer ${
//         record.isActive ? "activated" : "deactivated"
//       } successfully`,
//       data: record,
//     });
//   } catch (error) {
//     console.error("Status Update Error =>", error);

//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong",
//     });
//   }
// };

export const updatepioneerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const record = await Pioneer.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "pioneer not found",
      });
    }

    record.isActive = isActive === "true" || isActive === true;

    record.updateby = req.user?.id || null;
    record.updatedate = new Date();

    await record.save();

    return res.status(200).json({
      success: true,
      message: `pioneer ${record.isActive ? "activated" : "deactivated"} successfully`,
      data: record,
    });
  } catch (error) {
    console.error("Status Update Error =>", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};