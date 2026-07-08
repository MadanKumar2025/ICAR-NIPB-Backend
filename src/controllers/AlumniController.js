import Alumni from "../models/AlumniSchema.js";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

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
      mobile,
      passOutYear,
      designation_en,
      designation_hi,
    } = req.body || {};

    const cleanNameEn = name_en?.trim();
    const cleanNameHi = name_hi?.trim();
    const cleanEmail = email?.trim().toLowerCase();
    const cleanMobile = mobile?.trim();
    const cleanDesignationEn = designation_en?.trim();
    const cleanDesignationHi = designation_hi?.trim();
    const cleanBatchEn = batch_en?.trim();
    const cleanBatchHi = batch_hi?.trim();
    const cleanDegreeEn = degree_en?.trim();
    const cleanDegreeHi = degree_hi?.trim();
    const cleanPhotoTitle = photoTitle?.trim() || "";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const urlRegex =
      /^https?:\/\/([\w\d-]+\.)+[\w-]+(\/[\w\d\-._~:/?#[\]@!$&'()*+,;=]*)?$/;
const mobileRegex = /^[6-9]\d{9}$/;
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
    if (cleanMobile && !mobileRegex.test(cleanMobile)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mobile number",
      });
    }
    if (
      passOutYear &&
      (isNaN(passOutYear) ||
        passOutYear < 1900 ||
        passOutYear > new Date().getFullYear() + 10)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid Pass Out Year",
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
      designation: {
        en: cleanDesignationEn || "",
        hi: cleanDesignationHi || "",
      },
      mobile: cleanMobile || "",
      passOutYear: passOutYear ? Number(passOutYear) : null,
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
    const alumniList = await Alumni.find()
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 });

    const data = alumniList.map((alumni) => ({
      id: alumni._id,
      name: alumni.name || { en: "", hi: "" },
      batch: alumni.batch || { en: "", hi: "" },
      degree: alumni.degree || { en: "", hi: "" },
      mobile: alumni.mobile || "",
      passOutYear: alumni.passOutYear || null,
      designation: alumni.designation || { en: "", hi: "" },
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
      designation_en,
      designation_hi,
      mobile,
      passOutYear,
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
    const mobileRegex = /^[6-9]\d{9}$/;
    const validateUrl = (url) => !url || urlRegex.test(url);

    if (email && !emailRegex.test(email.trim().toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }
    if (mobile !== undefined) {
      if (mobile && !mobileRegex.test(mobile.trim())) {
        return res.status(400).json({
          success: false,
          message: "Invalid mobile number",
        });
      }
      alumni.mobile = mobile ? mobile.trim() : "";
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
    if (designation_en || designation_hi) {
      alumni.designation = {
        en: designation_en ? designation_en.trim() : alumni.designation?.en,
        hi: designation_hi ? designation_hi.trim() : alumni.designation?.hi,
      };
    }
    // MOBILE (NEW)
    if (mobile !== undefined) {
      alumni.mobile = mobile ? mobile.trim() : "";
    }
    if (passOutYear !== undefined) {
      alumni.passOutYear = passOutYear ? Number(passOutYear) : null;
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

export const deleteAlumni = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Alumni ID",
      });
    }

    // Find Alumni
    const alumni = await Alumni.findById(id);

    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: "Alumni not found",
      });
    }

    // Delete Photo if exists
    if (alumni.photo) {
      const photoPath = path.join(
        process.cwd(),
        "uploads",
        alumni.photo
      );

      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    // Delete Alumni Record
    await Alumni.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Alumni deleted successfully",
    });

  } catch (error) {
    console.error("Delete Alumni Error =>", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
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
      mobile: alumni.mobile || "",
      passOutYear: alumni.passOutYear || null,
      designation: alumni.designation || { en: "", hi: "" },
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
      mobile: alumni.mobile || "",
      passOutYear: alumni.passOutYear || null,
      designation: alumni.designation || { en: "", hi: "" },
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

      designation_en,
      designation_hi,
      mobile,
      passOutYear,

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
    const cleanMobile = mobile?.trim();
    const cleanDesignationEn = designation_en?.trim();
    const cleanDesignationHi = designation_hi?.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const urlRegex =
      /^https?:\/\/([\w\d-]+\.)+[\w-]+(\/[\w\d\-._~:/?#[\]@!$&'()*+,;=]*)?$/;
    // const mobileRegex = /^[6-9]\d{9}$/;

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
    // if (cleanMobile && !mobileRegex.test(cleanMobile)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid mobile number",
    //   });
    // }
    if (passOutYear) {
      const year = Number(passOutYear);
      if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 10) {
        return res.status(400).json({
          success: false,
          message: "Invalid Pass Out Year",
        });
      }
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
      designation: {
        en: cleanDesignationEn || "",
        hi: cleanDesignationHi || "",
      },
      mobile: cleanMobile || "",
      passOutYear: passOutYear ? Number(passOutYear) : null,
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
