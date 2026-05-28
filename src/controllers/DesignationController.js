import Designation from "../models/DesignationSchema.js";

export const createDesignation = async (req, res) => {
  try {
    const { name_en, name_hi } = req.body;

    // Validate required fields
    if (!name_en || !name_hi) {
      return res.status(400).json({
        success: false,
        message: "Both English and Egyptian names are required",
      });
    }

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    // Create new designation
    const designation = new Designation({
      name: {
        en: name_en,
        hi: name_hi,
      },
      createdBy: req.user.id,
    });

    const savedDesignation = await designation.save();

    return res.status(201).json({
      success: true,
      message: "Designation created successfully",
      data: savedDesignation,
    });
  } catch (error) {
    console.error("ERROR =>", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    // Handle invalid ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid data format",
      });
    }

    // Default server error
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};


// export const getDesignations = async (req, res) => {
//   try {
//     const isAll = req.query.all === "true";

//     const page = parseInt(req.query.page) || 1;
//     const limit = 10;
//     const skip = (page - 1) * limit;

//     let query = Designation.find();

//     const totalRecords = await Designation.countDocuments();

//     let records;
//     if (isAll) {
//       records = await query;
//     } else {
//       records = await query.skip(skip).limit(limit);
//     }

//     res.status(200).json({
//       success: true,
//       count: records.length,
//       total: totalRecords,
//       page: isAll ? null : page,
//       totalPages: isAll ? 1 : Math.ceil(totalRecords / limit),
//       data: records,
//     });
//   } catch (error) {
//     console.error("ERROR =>", error);

//     res.status(500).json({
//       success: false,
//       message: error.message || "Something went wrong",
//     });
//   }
// };

export const getDesignations = async (req, res) => {
  try {
    const designationList = await Designation.find()
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdDate: -1 }); // latest first

    const data = designationList.map((designation) => ({
      id: designation._id,
      name: designation.name || { en: "", hi: "" },
      isActive: designation.isActive,
      createdBy: designation.createdBy || null,
      updatedBy: designation.updatedBy || null,
      createdDate: designation.createdDate,
      updatedDate: designation.updatedDate || null,
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
      message: "Error fetching designations",
    });
  }
};

export const updateDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name_en, name_hi, isActive } = req.body;

    const record = await Designation.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Designation not found",
      });
    }

    // Update name field if provided
    if (name_en !== undefined || name_hi !== undefined) {
      if (
        (!name_en || name_en.trim() === "") &&
        (!name_hi || name_hi.trim() === "")
      ) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }

      record.name = {
        en: name_en ?? record.name.en,
        hi: name_hi ?? record.name.hi,
      };
    }

    // Update isActive if provided
    if (isActive !== undefined) {
      record.isActive = isActive === "true" || isActive === true;
    }

    // Update tracking fields
    record.updatedBy = req.user?.id;
    record.updatedDate = Date.now();

    const updatedRecord = await record.save();

    return res.status(200).json({
      success: true,
      message: "Designation updated successfully",
      data: updatedRecord,
    });
  } catch (error) {
    console.error("Update Designation Error =>", error);

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

export const updateDesignationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const record = await Designation.findByIdAndUpdate(
      id,
      {
        isActive: isActive === "true" || isActive === true,
        updatedBy: req.user?.id,
        updatedDate: new Date(),
      },
      { new: true }
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Designation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Designation status updated successfully",
      data: record,
    });
  } catch (error) {
    console.error("Update Designation Status Error =>", error);

    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};