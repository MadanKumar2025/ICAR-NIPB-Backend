import ContractualStaff from "../models/ContractualStaffSchema.js";

export const createContractualStaff = async (req, res) => {
  try {
    const {
      name_en,
      name_hi,
      position_en,
      position_hi,
      associatedLabDivision_en,
      associatedLabDivision_hi,
      contactNumber,
      email,
      photoTitle,
    } = req.body || {};

    const cleanNameEn = name_en?.trim();
    const cleanNameHi = name_hi?.trim();
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanNameEn || !cleanNameHi) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
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
        message: "Invalid image type",
      });
    }

    if (cleanEmail) {
      const existing = await ContractualStaff.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    const staff = new ContractualStaff({
      name: {
        en: cleanNameEn,
        hi: cleanNameHi,
      },

      position: {
        en: position_en || "",
        hi: position_hi || "",
      },

      associatedLabDivision: {
        en: associatedLabDivision_en || "",
        hi: associatedLabDivision_hi || "",
      },

      contactNumber: contactNumber || "",
      email: cleanEmail || "",
      photo: req.file.filename,
      photoTitle: photoTitle || "",

      isActive: true,

      createdBy: req.user?.id || null,
    });

    const saved = await staff.save();

    res.status(201).json({
      success: true,
      message: "Contractual Staff created successfully",
      data: saved,
    });
  } catch (err) {
    console.error("Create Contractual Staff Error =>", err);

    res.status(500).json({
      success: false,
      message: err.message || "Server Error",
    });
  }
};

export const getContractualStaff = async (req, res) => {
  try {
    const isAll = req.query.all === "true";

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    let query = ContractualStaff.find().sort({ createdAt: -1 });

    const totalStaff = await ContractualStaff.countDocuments();

    let staff;

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
    console.error("Get Contractual Staff Error =>", error);

    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// export const updateContractualStaff = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const {
//       name_en,
//       name_hi,
//       position_en,
//       position_hi,
//       associatedLabDivision_en,
//       associatedLabDivision_hi,
//       contactNumber,
//       email,
//       isActive,
//     } = req.body;

//     const record = await ContractualStaff.findById(id);

//     if (!record) {
//       return res.status(404).json({
//         success: false,
//         message: "Contractual Staff not found",
//       });
//     }

//     if (name_en !== undefined || name_hi !== undefined) {
//       if (
//         (!name_en || name_en.trim() === "") &&
//         (!name_hi || name_hi.trim() === "")
//       ) {
//         return res.status(400).json({
//           success: false,
//           message: "Name cannot be empty",
//         });
//       }

//       record.name = {
//         en: name_en ?? record.name.en,
//         hi: name_hi ?? record.name.hi,
//       };
//     }

//     if (position_en !== undefined || position_hi !== undefined) {
//       record.position = {
//         en: position_en ?? record.position.en,
//         hi: position_hi ?? record.position.hi,
//       };
//     }

//     if (
//       associatedLabDivision_en !== undefined ||
//       associatedLabDivision_hi !== undefined
//     ) {
//       record.associatedLabDivision = {
//         en: associatedLabDivision_en ?? record.associatedLabDivision.en,
//         hi: associatedLabDivision_hi ?? record.associatedLabDivision.hi,
//       };
//     }

//     if (contactNumber !== undefined) {
//       record.contactNumber = contactNumber;
//     }

//     if (email !== undefined) {
//       record.email = email.trim().toLowerCase();
//     }

//     if (isActive !== undefined) {
//       record.isActive = isActive === "true" || isActive === true;
//     }

//     record.updatedBy = req.user?.id || null;

//     const updatedRecord = await record.save();

//     return res.status(200).json({
//       success: true,
//       message: "Contractual Staff updated successfully",
//       data: updatedRecord,
//     });
//   } catch (error) {
//     console.error("Update Contractual Staff Error =>", error);

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

export const updateContractualStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name_en,
      name_hi,
      position_en,
      position_hi,
      associatedLabDivision_en,
      associatedLabDivision_hi,
      contactNumber,
      email,
      photoTitle,
      isActive,
    } = req.body || {};

    const record = await ContractualStaff.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Contractual Staff not found",
      });
    }

    // NAME
    if (name_en !== undefined || name_hi !== undefined) {
      const cleanNameEn = name_en?.trim();
      const cleanNameHi = name_hi?.trim();

      if (!cleanNameEn && !cleanNameHi) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }

      record.name = {
        en: cleanNameEn || record.name.en,
        hi: cleanNameHi || record.name.hi,
      };
    }

    // POSITION
    if (position_en !== undefined || position_hi !== undefined) {
      record.position = {
        en: position_en ?? record.position.en,
        hi: position_hi ?? record.position.hi,
      };
    }

    // LAB DIVISION
    if (
      associatedLabDivision_en !== undefined ||
      associatedLabDivision_hi !== undefined
    ) {
      record.associatedLabDivision = {
        en: associatedLabDivision_en ?? record.associatedLabDivision.en,
        hi: associatedLabDivision_hi ?? record.associatedLabDivision.hi,
      };
    }

    // CONTACT
    if (contactNumber !== undefined) {
      record.contactNumber = contactNumber;
    }

    // EMAIL
    if (email !== undefined) {
      record.email = email.trim().toLowerCase();
    }

    // PHOTO TITLE
    if (photoTitle !== undefined) {
      record.photoTitle = photoTitle;
    }

    // IS ACTIVE
    if (isActive !== undefined) {
      record.isActive = isActive === "true" || isActive === true;
    }

    // PHOTO (multer)
    if (req.file) {
      record.photo = req.file.filename;
    }

    record.updatedBy = req.user?.id || null;

    const updatedRecord = await record.save();

    return res.status(200).json({
      success: true,
      message: "Contractual Staff updated successfully",
      data: updatedRecord,
    });
  } catch (error) {
    console.error("Update Contractual Staff Error =>", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
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

export const updateContractualStaffStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const record = await ContractualStaff.findByIdAndUpdate(
      id,
      {
        $set: {
          isActive: isActive === "true" || isActive === true,
          updatedBy: req.user?.id || null,
        },
      },
      { new: true }
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Contractual Staff not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: record,
    });
  } catch (error) {
    console.error("Update Contractual Staff Status Error =>", error);

    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};