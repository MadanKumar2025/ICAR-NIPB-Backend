import Alumni from "../models/AlumniSchema.js";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

// export const createAlumni = async (req, res) => {
//   try {
//     const {
//       name_en,
//       name_hi,
//       batch_en,
//       batch_hi,
//       degree_en,
//       degree_hi,
//       email,
//       profileLink,
//       facebook,
//       twitter,
//       youtube,
//       linkedin,
//       instagram,
//       photoTitle,
//     } = req.body || {};

//     const cleanNameEn = name_en?.trim();
//     const cleanNameHi = name_hi?.trim();
//     const cleanEmail = email?.trim().toLowerCase();

//     if (!cleanNameEn || !cleanNameHi || !cleanEmail) {
//       return res.status(400).json({
//         success: false,
//         message: "Name & Email are required",
//       });
//     }

//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "Photo is required",
//       });
//     }

//     const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
//     if (!allowedTypes.includes(req.file.mimetype)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid image type",
//       });
//     }

//     const existing = await Alumni.findOne({ email: cleanEmail });
//     if (existing) {
//       return res.status(400).json({
//         success: false,
//         message: "Email already exists",
//       });
//     }

//     const alumni = new Alumni({
//       name: { en: cleanNameEn, hi: cleanNameHi },
//       batch: { en: batch_en || "", hi: batch_hi || "" },
//       degree: { en: degree_en || "", hi: degree_hi || "" },
//       email: cleanEmail,
//       profileLink,
//       facebook,
//       twitter,
//       youtube,
//       linkedin,
//       instagram,
//       photo: req.file.filename,
//       photoTitle: photoTitle || "",

//       isApproved: false,
//       approvedBy: null,
//       approvedDate: null,
//     });

//     const saved = await alumni.save();

//     res.status(201).json({
//       success: true,
//       message: "Alumni created (Pending Approval)",
//       data: saved,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

export const createAlumni = async (req, res) => {
  try {
    const {
      name_en,
      name_hi,
      batch_en,
      batch_hi,
      degree_en,
      degree_hi,
      email,
      profileLink,
      facebook,
      twitter,
      youtube,
      linkedin,
      instagram,
      photoTitle,
    } = req.body || {};

    const cleanNameEn = name_en?.trim();
    const cleanNameHi = name_hi?.trim();
    const cleanEmail = email?.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const urlRegex =
      /^https?:\/\/([\w\d-]+\.)+[\w-]+(\/[\w\d\-._~:/?#[\]@!$&'()*+,;=]*)?$/;

    const validateUrl = (url) => {
      return !url || urlRegex.test(url);
    };

    if (!cleanNameEn || !cleanNameHi || !cleanEmail) {
      return res.status(400).json({
        success: false,
        message: "Name (EN/HI) and Email are required",
      });
    }

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Photo is required",
      });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Only JPG, PNG, JPEG, WEBP images are allowed",
      });
    }

    const urls = {
      profileLink,
      facebook,
      twitter,
      youtube,
      linkedin,
      instagram,
    };

    for (const [key, value] of Object.entries(urls)) {
      if (value && !validateUrl(value)) {
        return res.status(400).json({
          success: false,
          message: `Invalid URL in ${key}`,
        });
      }
    }

    const existing = await Alumni.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const alumni = new Alumni({
      name: { en: cleanNameEn, hi: cleanNameHi },
      batch: { en: batch_en?.trim() || "", hi: batch_hi?.trim() || "" },
      degree: { en: degree_en?.trim() || "", hi: degree_hi?.trim() || "" },
      email: cleanEmail,

      profileLink,
      facebook,
      twitter,
      youtube,
      linkedin,
      instagram,

      photo: req.file.filename,
      photoTitle: photoTitle?.trim() || "",

      isApproved: false,
      approvedBy: null,
      approvedDate: null,
    });

    const saved = await alumni.save();

    return res.status(201).json({
      success: true,
      message: "Alumni created (Pending Approval)",
      data: saved,
    });
  } catch (err) {
    console.error("createAlumni error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getAlumni = async (req, res) => {
  try {
    const isAll = req.query.all === "true";

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    let query = Alumni.find().sort({ createdAt: -1 });

    let alumni;
    const total = await Alumni.countDocuments();

    if (isAll) {
      alumni = await query;
    } else {
      alumni = await query.skip(skip).limit(limit);
    }

    res.status(200).json({
      success: true,
      count: alumni.length,
      total: total,
      page: isAll ? null : page,
      totalPages: isAll ? 1 : Math.ceil(total / limit),
      data: alumni,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const updateAlumniApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    // Validate input
    if (isApproved === undefined) {
      return res.status(400).json({
        success: false,
        message: "isApproved value is required",
      });
    }

    const alumni = await Alumni.findById(id);

    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: "Alumni not found",
      });
    }

    // Update fields
    alumni.isApproved = isApproved === true || isApproved === "true";
    alumni.approvedBy = req.user?.id || null;
    alumni.approvedDate = new Date();

    await alumni.save();

    res.status(200).json({
      success: true,
      message: "Alumni approval status updated successfully",
      data: alumni,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const updateAlumni = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing Alumni ID",
      });
    }

    const {
      name_en,
      name_hi,
      batch_en,
      batch_hi,
      degree_en,
      degree_hi,
      email,
      profileLink,
      facebook,
      twitter,
      youtube,
      linkedin,
      instagram,
      photoTitle,
      isApproved,
    } = req.body;

    const alumni = await Alumni.findById(id);
    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: "Alumni not found",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const urlRegex =
      /^https?:\/\/([\w\d-]+\.)+[\w-]+(\/[\w\d\-._~:/?#[\]@!$&'()*+,;=]*)?$/;

    const validateUrl = (url) => !url || urlRegex.test(url);

    if (email && !emailRegex.test(email.trim().toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const urls = {
      profileLink,
      facebook,
      twitter,
      youtube,
      linkedin,
      instagram,
    };
    for (const [key, value] of Object.entries(urls)) {
      if (value && !validateUrl(value)) {
        return res.status(400).json({
          success: false,
          message: `Invalid URL in ${key}`,
        });
      }
    }

    if (email && email.trim().toLowerCase() !== alumni.email) {
      const existing = await Alumni.findOne({
        email: email.trim().toLowerCase(),
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    if (req.file) {
      if (alumni.photo) {
        const oldPath = path.join(process.cwd(), "uploads", alumni.photo);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      alumni.photo = req.file.filename;
    }

    if (name_en || name_hi) {
      alumni.name = {
        en: name_en ? name_en.trim() : alumni.name?.en,
        hi: name_hi ? name_hi.trim() : alumni.name?.hi,
      };
    }

    if (batch_en || batch_hi) {
      alumni.batch = {
        en: batch_en ? batch_en.trim() : alumni.batch?.en,
        hi: batch_hi ? batch_hi.trim() : alumni.batch?.hi,
      };
    }

    if (degree_en || degree_hi) {
      alumni.degree = {
        en: degree_en ? degree_en.trim() : alumni.degree?.en,
        hi: degree_hi ? degree_hi.trim() : alumni.degree?.hi,
      };
    }

    if (email) alumni.email = email.trim().toLowerCase();

    if (profileLink !== undefined) alumni.profileLink = profileLink || null;
    if (facebook !== undefined) alumni.facebook = facebook || null;
    if (twitter !== undefined) alumni.twitter = twitter || null;
    if (youtube !== undefined) alumni.youtube = youtube || null;
    if (linkedin !== undefined) alumni.linkedin = linkedin || null;
    if (instagram !== undefined) alumni.instagram = instagram || null;

    if (photoTitle !== undefined) alumni.photoTitle = photoTitle?.trim() || "";

    if (isApproved !== undefined) {
      alumni.isApproved = isApproved;
      alumni.approvedDate = isApproved ? new Date() : null;
    }

    alumni.updatedBy = req.user?.id;
    alumni.updatedAt = new Date();

    const updatedAlumni = await alumni.save();

    return res.status(200).json({
      success: true,
      message: "Alumni updated successfully",
      data: updatedAlumni,
    });
  } catch (error) {
    console.error("updateAlumni error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// this is use for web
export const getAllAlumni = async (req, res) => {
  try {
    const alumniList = await Alumni.find()
      .populate("approvedBy", "name email") // populate approvedBy user details
      .sort({ createdAt: -1 }); // latest first

    // Map data to a cleaner structure for API response
    const data = alumniList.map((alumni) => ({
      id: alumni._id,
      name: alumni.name || { en: "", hi: "" },
      batch: alumni.batch || { en: "", hi: "" },
      degree: alumni.degree || { en: "", hi: "" },
      email: alumni.email,
      profileLink: alumni.profileLink || "",
      facebook: alumni.facebook || "",
      twitter: alumni.twitter || "",
      youtube: alumni.youtube || "",
      linkedin: alumni.linkedin || "",
      instagram: alumni.instagram || "",
      photo: alumni.photo,
      photoTitle: alumni.photoTitle || "",
      isApproved: alumni.isApproved,
      approvedBy: alumni.approvedBy || null,
      approvedDate: alumni.approvedDate || null,
      createdAt: alumni.createdAt,
      updatedAt: alumni.updatedAt || null,
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
      message: "Error fetching alumni",
    });
  }
};

export const getAlumniByIdWeb = async (req, res) => {
  try {
    const { id } = req.params;

    const alumni = await Alumni.findById(id).populate(
      "approvedBy",
      "name email",
    );

    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: "Alumni not found",
      });
    }

    const data = {
      id: alumni._id,
      name: alumni.name || { en: "", hi: "" },
      batch: alumni.batch || { en: "", hi: "" },
      degree: alumni.degree || { en: "", hi: "" },
      email: alumni.email,
      profileLink: alumni.profileLink || "",
      facebook: alumni.facebook || "",
      twitter: alumni.twitter || "",
      youtube: alumni.youtube || "",
      linkedin: alumni.linkedin || "",
      instagram: alumni.instagram || "",
      photo: alumni.photo,
      photoTitle: alumni.photoTitle || "",
      approvedBy: alumni.approvedBy || null,
      approvedDate: alumni.approvedDate || null,
      isApproved: alumni.isApproved,
      createdAt: alumni.createdAt,
      updatedAt: alumni.updatedAt || null,
    };

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching alumni",
    });
  }
};


export const createAlumniWeb = async (req, res) => {
  try {
    const {
      name_en,
      name_hi,
      batch_en,
      batch_hi,
      degree_en,
      degree_hi,
      email,
      profileLink,
      facebook,
      twitter,
      youtube,
      linkedin,
      instagram,
      photoTitle,
    } = req.body || {};

    const cleanNameEn = name_en?.trim();
    const cleanNameHi = name_hi?.trim();
    const cleanEmail = email?.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const urlRegex =
      /^https?:\/\/([\w\d-]+\.)+[\w-]+(\/[\w\d\-._~:/?#[\]@!$&'()*+,;=]*)?$/;

    const validateUrl = (url) => {
      return !url || urlRegex.test(url);
    };

    if (!cleanNameEn || !cleanNameHi || !cleanEmail) {
      return res.status(400).json({
        success: false,
        message: "Name (EN/HI) and Email are required",
      });
    }

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Photo is required",
      });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Only JPG, PNG, JPEG, WEBP images are allowed",
      });
    }

    const urls = {
      profileLink,
      facebook,
      twitter,
      youtube,
      linkedin,
      instagram,
    };

    for (const [key, value] of Object.entries(urls)) {
      if (value && !validateUrl(value)) {
        return res.status(400).json({
          success: false,
          message: `Invalid URL in ${key}`,
        });
      }
    }

    const existing = await Alumni.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const alumni = new Alumni({
      name: { en: cleanNameEn, hi: cleanNameHi },
      batch: { en: batch_en?.trim() || "", hi: batch_hi?.trim() || "" },
      degree: { en: degree_en?.trim() || "", hi: degree_hi?.trim() || "" },
      email: cleanEmail,

      profileLink,
      facebook,
      twitter,
      youtube,
      linkedin,
      instagram,

      photo: req.file.filename,
      photoTitle: photoTitle?.trim() || "",

      isApproved: false,
      approvedBy: null,
      approvedDate: null,
    });

    const saved = await alumni.save();

    return res.status(201).json({
      success: true,
      message: "Alumni created (Pending Approval)",
      data: saved,
    });
  } catch (err) {
    console.error("createAlumni error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};