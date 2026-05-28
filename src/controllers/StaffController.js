import Staff from "../models/StaffSchema.js";
import fs from "fs";
import path from "path";

// export const createStaff = async (req, res) => {
//   try {
//     const {
//       department_en,
//       department_hi,
//       staffName_en,
//       staffName_hi,
//       designation_en,
//       designation_hi,
//       phone,
//       email,
//       education_en,
//       education_hi,
//       imageTitle,
//       research,
//       awards,
//       publications,
//       ipr,
//     } = req.body;

//     // Required fields check
//     const missingFields = [];
//     if (!department_en) missingFields.push("Department (English)");
//     if (!department_hi) missingFields.push("Department (Hindi)");
//     if (!staffName_en) missingFields.push("Staff Name (English)");
//     if (!staffName_hi) missingFields.push("Staff Name (Hindi)");
//     if (!designation_en) missingFields.push("Designation (English)");
//     if (!designation_hi) missingFields.push("Designation (Hindi)");
//     if (!phone) missingFields.push("Phone");
//     if (!email) missingFields.push("Email");

//     if (missingFields.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: `Missing required fields: ${missingFields.join(", ")}`,
//       });
//     }

//     // Photo check
//     const photo = req.file ? req.file.filename : null;
//     if (!photo) {
//       return res.status(400).json({
//         success: false,
//         message: "Photo is required",
//       });
//     }

//     const createby = req.user?.id;

//     // Helper function to parse bilingual arrays
//     const parseBilingualArray = (arr) => {
//       if (!arr) return [];
//       try {
//         const parsed = typeof arr === "string" ? JSON.parse(arr) : arr;
//         return parsed.map((item) => ({
//           en: item.en || "",
//           hi: item.hi || "",
//         }));
//       } catch (e) {
//         return [];
//       }
//     };

//     // Create staff
//     const staff = new Staff({
//       department: { en: department_en, hi: department_hi },
//       staffName: { en: staffName_en, hi: staffName_hi },
//       designation: { en: designation_en, hi: designation_hi },
//       phone,
//       email,
//       education: { en: education_en || "", hi: education_hi || "" },
//       imageTitle: imageTitle || "",
//       photo,
//       Research: parseBilingualArray(research),
//       Awards: parseBilingualArray(awards),
//       Publications: parseBilingualArray(publications),
//       IPR: parseBilingualArray(ipr),
//       createby,
//     });

//     const savedStaff = await staff.save();

//     return res.status(201).json({
//       success: true,
//       message: "Staff created successfully",
//       data: savedStaff,
//     });
//   } catch (error) {
//     console.error(error);

//     // Duplicate key error
//     if (error.code === 11000) {
//       const field = Object.keys(error.keyValue)[0];
//       return res.status(400).json({
//         success: false,
//         message: `${field} already exists`,
//       });
//     }

//     // Mongoose validation error
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

export const createStaff = async (req, res) => {
  try {
    const {
      department_en,
      department_hi,
      staffName_en,
      staffName_hi,
      designation_en,
      designation_hi,
      phone,
      email,
      education_en,
      education_hi,
      imageTitle,
      research_en,
      research_hi,
      publications_en,
      publications_hi,
      awards,
      publications,
      ipr,
    } = req.body;

    // Required fields check
    const missingFields = [];

    if (!department_en) missingFields.push("Department (English)");
    if (!department_hi) missingFields.push("Department (Hindi)");

    if (!staffName_en) missingFields.push("Staff Name (English)");
    if (!staffName_hi) missingFields.push("Staff Name (Hindi)");

    if (!designation_en) missingFields.push("Designation (English)");
    if (!designation_hi) missingFields.push("Designation (Hindi)");

    if (!phone) missingFields.push("Phone");
    if (!email) missingFields.push("Email");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Photo check
    const photo = req.file ? req.file.filename : null;

    if (!photo) {
      return res.status(400).json({
        success: false,
        message: "Photo is required",
      });
    }

    const createby = req.user?.id;

    // Helper function for bilingual array fields
    const parseBilingualArray = (arr) => {
      if (!arr) return [];

      try {
        const parsed = typeof arr === "string" ? JSON.parse(arr) : arr;

        return parsed.map((item) => ({
          en: item.en || "",
          hi: item.hi || "",
        }));
      } catch (error) {
        return [];
      }
    };

    // Create staff object
    const staff = new Staff({
      department: {
        en: department_en,
        hi: department_hi,
      },

      staffName: {
        en: staffName_en,
        hi: staffName_hi,
      },

      designation: {
        en: designation_en,
        hi: designation_hi,
      },

      phone,
      email,

      education: {
        en: education_en || "",
        hi: education_hi || "",
      },

      imageTitle: imageTitle || "",

      photo,

      Research: {
        en: research_en || "",
        hi: research_hi || "",
      },

      Publications: {
        en: publications_en || "",
        hi: publications_hi || "",
      },

      Awards: parseBilingualArray(awards),

 
      IPR: parseBilingualArray(ipr),

      createby,
    });

    const savedStaff = await staff.save();

    return res.status(201).json({
      success: true,
      message: "Staff created successfully",
      data: savedStaff,
    });
  } catch (error) {
    console.error(error);

    // Duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];

      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    // Mongoose validation error
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

// export const getStaff = async (req, res) => {
//   try {
//     const isAll = req.query.all === "true";

//     const page = parseInt(req.query.page) || 1;
//     const limit = 10;
//     const skip = (page - 1) * limit;

//     let query = Staff.find();

//     let staff;
//     const totalStaff = await Staff.countDocuments();

//     if (isAll) {
//       staff = await query;
//     } else {
//       staff = await query.skip(skip).limit(limit);
//     }

//     res.status(200).json({
//       success: true,
//       count: staff.length,
//       total: totalStaff,
//       page: isAll ? null : page,
//       totalPages: isAll ? 1 : Math.ceil(totalStaff / limit),
//       data: staff,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

 export const getStaff = async (req, res) => {
  try {
    const staffList = await Staff.find()
      .populate("createby", "name email")
      .populate("updateby", "name email")
      .sort({ createdate: -1 });

    const data = staffList.map((item) => ({
      id: item._id,

      department: {
        en: item.department?.en || "",
        hi: item.department?.hi || "",
      },

      staffName: {
        en: item.staffName?.en || "",
        hi: item.staffName?.hi || "",
      },

      designation: {
        en: item.designation?.en || "",
        hi: item.designation?.hi || "",
      },

      phone: item.phone || "",

      email: item.email || "",

      education: {
        en: item.education?.en || "",
        hi: item.education?.hi || "",
      },

      imageTitle: item.imageTitle || "",

      photo: item.photo || null,

      isActive: item.isActive,

      // Object
      Research: {
        en: item.Research?.en || "",
        hi: item.Research?.hi || "",
      },

      // Array
      Awards: item.Awards || [],

      // Object
      Publications: {
        en: item.Publications?.en || "",
        hi: item.Publications?.hi || "",
      },

      // Array
      IPR: item.IPR || [],

      createdBy: item.createby || null,

      updatedBy: item.updateby || null,

      createdDate: item.createdate,

      updatedDate: item.updatedate || null,
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
      message: "Error fetching staff data",
    });
  }
};


const parseBilingualArray = (arr) => {
  if (!arr) return [];
  try {
    const parsed = typeof arr === "string" ? JSON.parse(arr) : arr;
    return parsed.map((item) => ({
      en: item.en || "",
      hi: item.hi || "",
    }));
  } catch (e) {
    return [];
  }
};

// export const updateStaff = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const {
//       department_en,
//       department_hi,
//       staffName_en,
//       staffName_hi,
//       designation_en,
//       designation_hi,
//       phone,
//       email,
//       education_en,
//       education_hi,
//       imageTitle,
//       isActive,
//       research,
//       awards,
//       publications,
//       ipr,
//     } = req.body;

//     const staff = await Staff.findById(id);

//     if (!staff) {
//       return res.status(404).json({
//         success: false,
//         message: "Staff not found",
//       });
//     }

//     if (department_en !== undefined || department_hi !== undefined) {
//       if (
//         (!department_en || department_en.trim() === "") &&
//         (!department_hi || department_hi.trim() === "")
//       ) {
//         return res.status(400).json({
//           success: false,
//           message: "Department (English or Hindi) cannot be empty",
//         });
//       }
//       staff.department = {
//         en: department_en ?? staff.department.en,
//         hi: department_hi ?? staff.department.hi,
//       };
//     }

//     if (staffName_en !== undefined || staffName_hi !== undefined) {
//       if (
//         (!staffName_en || staffName_en.trim() === "") &&
//         (!staffName_hi || staffName_hi.trim() === "")
//       ) {
//         return res.status(400).json({
//           success: false,
//           message: "Staff Name (English or Hindi) cannot be empty",
//         });
//       }
//       staff.staffName = {
//         en: staffName_en ?? staff.staffName.en,
//         hi: staffName_hi ?? staff.staffName.hi,
//       };
//     }

//     if (designation_en !== undefined || designation_hi !== undefined) {
//       if (
//         (!designation_en || designation_en.trim() === "") &&
//         (!designation_hi || designation_hi.trim() === "")
//       ) {
//         return res.status(400).json({
//           success: false,
//           message: "Designation (English or Hindi) cannot be empty",
//         });
//       }
//       staff.designation = {
//         en: designation_en ?? staff.designation.en,
//         hi: designation_hi ?? staff.designation.hi,
//       };
//     }

//     if (phone !== undefined) staff.phone = phone;
//     if (email !== undefined) staff.email = email;
//     if (education_en !== undefined || education_hi !== undefined) {
//       staff.education = {
//         en: education_en ?? staff.education?.en,
//         hi: education_hi ?? staff.education?.hi,
//       };
//     }
//     if (imageTitle !== undefined) staff.imageTitle = imageTitle;
//     if (isActive !== undefined)
//       staff.isActive = isActive === "true" || isActive === true;

//     if (research !== undefined) staff.Research = parseBilingualArray(research);
//     if (awards !== undefined) staff.Awards = parseBilingualArray(awards);
//     if (publications !== undefined)
//       staff.Publications = parseBilingualArray(publications);
//     if (ipr !== undefined) staff.IPR = parseBilingualArray(ipr);

//     if (req.file) {
//       if (staff.photo) {
//         const oldImagePath = path.join("uploads", staff.photo);
//         if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
//       }
//       staff.photo = req.file.filename;
//     }

//     staff.updateby = req.user?.id;
//     staff.updatedate = Date.now();

//     const updatedStaff = await staff.save();

//     return res.status(200).json({
//       success: true,
//       message: "Staff updated successfully",
//       data: updatedStaff,
//     });
//   } catch (error) {
//     console.error(error);

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

export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      department_en,
      department_hi,
      staffName_en,
      staffName_hi,
      designation_en,
      designation_hi,
      phone,
      email,
      education_en,
      education_hi,
      imageTitle,
      research_en,
      research_hi,
      publications_en,
      publications_hi,
      awards,
      ipr,
      isActive,
    } = req.body;

    // Find staff
    const staff = await Staff.findById(id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    // Helper function
    const parseBilingualArray = (arr) => {
      if (!arr) return [];

      try {
        const parsed = typeof arr === "string"
          ? JSON.parse(arr)
          : arr;

        return parsed.map((item) => ({
          en: item.en || "",
          hi: item.hi || "",
        }));
      } catch (error) {
        return [];
      }
    };

    // Department
    if (department_en !== undefined)
      staff.department.en = department_en;

    if (department_hi !== undefined)
      staff.department.hi = department_hi;

    // Staff Name
    if (staffName_en !== undefined)
      staff.staffName.en = staffName_en;

    if (staffName_hi !== undefined)
      staff.staffName.hi = staffName_hi;

    // Designation
    if (designation_en !== undefined)
      staff.designation.en = designation_en;

    if (designation_hi !== undefined)
      staff.designation.hi = designation_hi;

    // Contact
    if (phone !== undefined)
      staff.phone = phone;

    if (email !== undefined)
      staff.email = email;

    // Education
    if (education_en !== undefined)
      staff.education.en = education_en;

    if (education_hi !== undefined)
      staff.education.hi = education_hi;

    // Image title
    if (imageTitle !== undefined)
      staff.imageTitle = imageTitle;

    // Research
    if (
      research_en !== undefined ||
      research_hi !== undefined
    ) {
      staff.Research = {
        en: research_en ?? staff.Research?.en,
        hi: research_hi ?? staff.Research?.hi,
      };
    }

    // Publications
    if (
      publications_en !== undefined ||
      publications_hi !== undefined
    ) {
      staff.Publications = {
        en: publications_en ?? staff.Publications?.en,
        hi: publications_hi ?? staff.Publications?.hi,
      };
    }

    // Awards Array
    if (awards !== undefined) {
      staff.Awards = parseBilingualArray(awards);
    }

    // IPR Array
    if (ipr !== undefined) {
      staff.IPR = parseBilingualArray(ipr);
    }

    // Status
    if (isActive !== undefined) {
      staff.isActive =
        isActive === true || isActive === "true";
    }

    // Photo update
    if (req.file) {
      // Delete old image
      if (staff.photo) {
        const oldImagePath = path.join(
          "uploads",
          staff.photo
        );

        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      staff.photo = req.file.filename;
    }

    // Update metadata
    staff.updateby = req.user?.id;
    staff.updatedate = Date.now();

    // Save
    const updatedStaff = await staff.save();

    return res.status(200).json({
      success: true,
      message: "Staff updated successfully",
      data: updatedStaff,
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

export const updateStaffStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const staff = await Staff.findByIdAndUpdate(
      id,
      {
        isActive: isActive,
        updateby: req.user.id,
        updatedate: new Date(),
      },
      { new: true },
    );

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Staff status updated successfully",
      data: staff,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// this is use for web
export const getAllStaffWeb = async (req, res) => {
  try {
    const staffList = await Staff.find()
      .populate("createby", "name email")
      .populate("updateby", "name email")
      .sort({ createdate: -1 });

    const data = staffList.map((staff) => ({
      id: staff._id,
      department: staff.department || { en: "", hi: "" },
      staffName: staff.staffName || { en: "", hi: "" },
      designation: staff.designation || { en: "", hi: "" },
      phone: staff.phone || "",
      email: staff.email || "",
      education: staff.education || { en: "", hi: "" },
      imageTitle: staff.imageTitle || "",
      photo: staff.photo || null,
      isActive: staff.isActive,

      Research: staff.Research || [],
      Awards: staff.Awards || [],
      Publications: staff.Publications || [],
      IPR: staff.IPR || [],

      createdBy: staff.createby || null,
      updatedBy: staff.updateby || null,
      createdAt: staff.createdate,
      updatedAt: staff.updatedate || null,
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
      message: "Error fetching staff data",
    });
  }
};

export const getStaffByDepartment = async (req, res) => {
  try {
    const { department } = req.params;

    const staffList = await Staff.find({
      "department.en": department,
    })
      .populate("createby", "name email")
      .populate("updateby", "name email")
      .sort({ createdate: -1 });

    const data = staffList.map((staff) => ({
      id: staff._id,

      department: staff.department || { en: "", hi: "" },

      staffName: staff.staffName || { en: "", hi: "" },

      designation: staff.designation || { en: "", hi: "" },

      phone: staff.phone,

      email: staff.email,

      education: staff.education || { en: "", hi: "" },

      imageTitle: staff.imageTitle || "",

      photo: staff.photo,

      isActive: staff.isActive,

      Research: staff.Research || [],

      Awards: staff.Awards || [],

      Publications: staff.Publications || [],

      IPR: staff.IPR || [],

      createdBy: staff.createby || null,

      updatedBy: staff.updateby || null,

      createdAt: staff.createdate,

      updatedAt: staff.updatedate || null,
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
      message: "Error fetching staff",
    });
  }
};



export const getStaffByIdWeb = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await Staff.findById(id)
      .populate("createby", "name email")
      .populate("updateby", "name email");

    // Check if staff exists
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    // Format response data
    const data = {
      id: staff._id,
      department: staff.department || { en: "", hi: "" },
      staffName: staff.staffName || { en: "", hi: "" },
      designation: staff.designation || { en: "", hi: "" },
      phone: staff.phone || "",
      email: staff.email || "",
      education: staff.education || { en: "", hi: "" },
      imageTitle: staff.imageTitle || "",
      photo: staff.photo || null,
      isActive: staff.isActive,

      Research: staff.Research || [],
      Awards: staff.Awards || [],
      Publications: staff.Publications || [],
      IPR: staff.IPR || [],

      createdBy: staff.createby || null,
      updatedBy: staff.updateby || null,
      createdAt: staff.createdate,
      updatedAt: staff.updatedate || null,
    };

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error fetching staff data",
    });
  }
};