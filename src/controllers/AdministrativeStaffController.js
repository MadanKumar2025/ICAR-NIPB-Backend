import AdministrativeStaff from "../models/AdministrativeStaffSchema.js";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

export const createAdministrativeStaff = async (req, res) => {
  try {
    const {
      department_en,
      department_hi,
      staffName_en,
      staffName_hi,
      designationId,
      phone,
      email,
      education_en,
      education_hi,
      imageTitle,
      isActive,
    } = req.body;

    const errors = [];

    // Required fields
    if (!department_en?.trim()) errors.push("Department (English) is required");
    if (!department_hi?.trim()) errors.push("Department (Hindi) is required");
    if (!staffName_en?.trim()) errors.push("Staff Name (English) is required");
    if (!staffName_hi?.trim()) errors.push("Staff Name (Hindi) is required");
    if (!designationId) errors.push("Designation is required");

    // Phone validation
    if (!phone) {
      errors.push("Phone is required");
    } else if (!/^[0-9]{10}$/.test(phone)) {
      errors.push("Phone must be exactly 10 digits");
    }

    // Email validation
    if (!email) {
      errors.push("Email is required");
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.push("Invalid email format");
    }

    // Image validation
    const photo = req.file ? req.file.filename : null;
    if (!photo) {
      errors.push("Photo is required");
    }

    // If any error → return
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors.join(", "),
      });
    }

    const createby = req.user?.id;

    const adminStaff = new AdministrativeStaff({
      department: {
        en: department_en.trim(),
        hi: department_hi.trim(),
      },
      staffName: {
        en: staffName_en.trim(),
        hi: staffName_hi.trim(),
      },
      designationId,
      phone,
      email,
      education: {
        en: education_en?.trim() || "",
        hi: education_hi?.trim() || "",
      },
      imageTitle: imageTitle?.trim() || "",
      photo,
      isActive: isActive !== undefined ? isActive : true,
      createby,
    });

    const savedStaff = await adminStaff.save();

    return res.status(201).json({
      success: true,
      message: "Administrative Staff created successfully",
      data: savedStaff,
    });
  } catch (error) {
    console.error(error);

    // Duplicate key
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    // Mongoose validation
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getAdministrativeStaff = async (req, res) => {
  try {
    const isAll = req.query.all === "true";

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    let query = AdministrativeStaff.find()
      .populate("designationId") // optional but recommended
      .sort({ createdate: -1 });

    let staff;
    const totalStaff = await AdministrativeStaff.countDocuments();

    if (isAll) {
      staff = await query;
    } else {
      staff = await query.skip(skip).limit(limit);
    }

    res.status(200).json({
      success: true,
      count: staff.length,
      total: totalStaff,
      page: isAll ? null : page,
      totalPages: isAll ? 1 : Math.ceil(totalStaff / limit),
      data: staff,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateAdministrativeStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      department_en,
      department_hi,
      staffName_en,
      staffName_hi,
      designationId,
      phone,
      email,
      education_en,
      education_hi,
      imageTitle,
      isActive,
    } = req.body;

    const staff = await AdministrativeStaff.findById(id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Administrative Staff not found",
      });
    }

    if (department_en !== undefined || department_hi !== undefined) {
      if (
        (!department_en || department_en.trim() === "") &&
        (!department_hi || department_hi.trim() === "")
      ) {
        return res.status(400).json({
          success: false,
          message: "Department (English or Hindi) cannot be empty",
        });
      }

      staff.department = {
        en: department_en ?? staff.department.en,
        hi: department_hi ?? staff.department.hi,
      };
    }

    if (staffName_en !== undefined || staffName_hi !== undefined) {
      if (
        (!staffName_en || staffName_en.trim() === "") &&
        (!staffName_hi || staffName_hi.trim() === "")
      ) {
        return res.status(400).json({
          success: false,
          message: "Staff Name (English or Hindi) cannot be empty",
        });
      }

      staff.staffName = {
        en: staffName_en ?? staff.staffName.en,
        hi: staffName_hi ?? staff.staffName.hi,
      };
    }

    if (designationId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(designationId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Designation ID",
        });
      }
      staff.designationId = designationId;
    }

    if (phone !== undefined) {
      if (!/^[0-9]{10}$/.test(phone)) {
        return res.status(400).json({
          success: false,
          message: "Phone must be exactly 10 digits",
        });
      }
      staff.phone = phone;
    }

    if (email !== undefined) {
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
        });
      }
      staff.email = email;
    }

    if (education_en !== undefined || education_hi !== undefined) {
      staff.education = {
        en: education_en ?? staff.education?.en,
        hi: education_hi ?? staff.education?.hi,
      };
    }

    if (imageTitle !== undefined) staff.imageTitle = imageTitle;

    if (isActive !== undefined) {
      staff.isActive = isActive === "true" || isActive === true;
    }

    if (req.file) {
      if (staff.photo) {
        const oldImagePath = path.join("uploads", staff.photo);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      staff.photo = req.file.filename;
    }

    staff.updateby = req.user?.id;
    staff.updatedate = Date.now();

    const updatedStaff = await staff.save();

    return res.status(200).json({
      success: true,
      message: "Administrative Staff updated successfully",
      data: updatedStaff,
    });
  } catch (error) {
    console.error(error);

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

export const updateAdministrativeStaffStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    // Validate isActive
    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: "isActive field is required",
      });
    }

    const staff = await AdministrativeStaff.findByIdAndUpdate(
      id,
      {
        isActive: isActive === "true" || isActive === true,
        updateby: req.user?.id,
        updatedate: new Date(),
      },
      { new: true },
    );

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Administrative Staff not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Administrative Staff status updated successfully",
      data: staff,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
