import Committees from "../models/CommitteesSchema.js";

export const createCommittee = async (req, res) => {
  try {
    const { content_en, content_hi, type_en, type_hi, displayOrder } = req.body;

    if (!content_en || content_en.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "English content is required",
      });
    }

    if (!content_hi || content_hi.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Hindi content is required",
      });
    }

    // Type Validation
    if (!type_en || type_en.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "English type is required",
      });
    }

    if (!type_hi || type_hi.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Hindi type is required",
      });
    }

    if (isNaN(displayOrder)) {
      return res.status(400).json({
        success: false,
        message: "Display order must be a number",
      });
    }

    const createdBy = req.user?.id;

    await Committees.updateMany({}, { isActive: false });

    const newCommittee = new Committees({
      content: {
        en: content_en.trim(),
        hi: content_hi.trim(),
      },
      type: {
        en: type_en.trim(),
        hi: type_hi.trim(),
      },
      displayOrder: Number(displayOrder),
      createdBy,
      isActive: true,
    });

    const saved = await newCommittee.save();

    return res.status(201).json({
      success: true,
      message: "Committee created successfully",
      data: saved,
    });
  } catch (error) {
    console.error("Create Committee Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// export const getAllCommittees = async (req, res) => {
//   try {
//     const isAll = req.query.all === "true";

//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const filter = {};

//     if (req.query.search) {
//       filter.$or = [
//         { "content.en": { $regex: req.query.search, $options: "i" } },
//         { "content.hi": { $regex: req.query.search, $options: "i" } },
//       ];
//     }
//     if (req.query.isActive !== undefined) {
//       filter.isActive = req.query.isActive === "true";
//     }

//     let query = Committees.find(filter)
//       .populate("createdBy", "username email")
//       .populate("updatedBy", "username email")
//       .sort({ createdAt: -1 });

//     const total = await Committees.countDocuments(filter);

//     let data;

//     if (isAll) {
//       data = await query;
//     } else {
//       data = await query.skip(skip).limit(limit);
//     }

//     return res.status(200).json({
//       success: true,
//       count: data.length,
//       total,
//       page: isAll ? null : page,
//       limit: isAll ? null : limit,
//       totalPages: isAll ? 1 : Math.ceil(total / limit),
//       data,
//     });
//   } catch (error) {
//     console.error("Get Committees Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Server Error",
//     });
//   }
// };

export const getAllCommittees = async (req, res) => {
  try {
    const committeeList = await Committees.find()
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ displayOrder: 1 });

    const data = committeeList.map((committee) => ({
      id: committee._id,

      content: committee.content || { en: "", hi: "" },

      type: committee.type || { en: "", hi: "" },

      displayOrder: committee.displayOrder,

      isActive: committee.isActive,

      createdBy: committee.createdBy
        ? {
            id: committee.createdBy._id,
            name: committee.createdBy.name,
            email: committee.createdBy.email,
          }
        : null,

      updatedBy: committee.updatedBy
        ? {
            id: committee.updatedBy._id,
            name: committee.updatedBy.name,
            email: committee.updatedBy.email,
          }
        : null,

      createdAt: committee.createdAt || null,
      updatedAt: committee.updatedAt || null,
    }));

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Get Committees Web Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching committees",
    });
  }
};

// export const updateCommittee = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { content_en, content_hi, isActive } = req.body;

//     const data = await Committees.findById(id);

//     if (!data) {
//       return res.status(404).json({
//         success: false,
//         message: "Committee not found",
//       });
//     }

//     if (content_en) {
//       data.content.en = content_en.trim();
//     }

//     if (content_hi) {
//       data.content.hi = content_hi.trim();
//     }

//     if (isActive !== undefined) {
//       const activeValue = isActive === "true" || isActive === true;

//       if (activeValue) {
//         await Committees.updateMany({}, { isActive: false });
//       }

//       data.isActive = activeValue;
//     }

//     data.updatedBy = req.user?.id;
//     data.updatedAt = new Date();

//     const updatedData = await data.save();

//     return res.status(200).json({
//       success: true,
//       message: "Committee updated successfully",
//       data: updatedData,
//     });
//   } catch (error) {
//     console.error("Update Committee Error:", error);

//     if (error.name === "ValidationError") {
//       const messages = Object.values(error.errors).map((val) => val.message);

//       return res.status(400).json({
//         success: false,
//         message: messages.join(", "),
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Server Error",
//     });
//   }
// };


export const updateCommittee = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      content_en,
      content_hi,
      type_en,
      type_hi,
      displayOrder,
      isActive,
    } = req.body;

    const data = await Committees.findById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Committee not found",
      });
    }

    // Update content
    if (content_en !== undefined) {
      if (content_en.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "English content cannot be empty",
        });
      }
      data.content.en = content_en.trim();
    }

    if (content_hi !== undefined) {
      if (content_hi.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Hindi content cannot be empty",
        });
      }
      data.content.hi = content_hi.trim();
    }

    // Update type
    if (type_en !== undefined) {
      if (type_en.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "English type cannot be empty",
        });
      }
      data.type.en = type_en.trim();
    }

    if (type_hi !== undefined) {
      if (type_hi.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Hindi type cannot be empty",
        });
      }
      data.type.hi = type_hi.trim();
    }

    // Update displayOrder
    if (displayOrder !== undefined) {
      if (isNaN(displayOrder)) {
        return res.status(400).json({
          success: false,
          message: "Display order must be a number",
        });
      }
      data.displayOrder = Number(displayOrder);
    }

    // Update isActive
    if (isActive !== undefined) {
      const activeValue = isActive === "true" || isActive === true;

      if (activeValue) {
        await Committees.updateMany({}, { isActive: false });
      }

      data.isActive = activeValue;
    }

    data.updatedBy = req.user?.id;
    data.updatedAt = new Date();

    const updatedData = await data.save();

    return res.status(200).json({
      success: true,
      message: "Committee updated successfully",
      data: updatedData,
    });
  } catch (error) {
    console.error("Update Committee Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};


export const updateCommitteeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // check committee exists
    const committee = await Committees.findById(id);

    if (!committee) {
      return res.status(404).json({
        success: false,
        message: "Committee not found",
      });
    }

    // update status
    committee.isActive = isActive;

    // meta update
    committee.updatedBy = req.user?.id;
    committee.updatedAt = new Date();

    await committee.save();

    return res.status(200).json({
      success: true,
      message: `Committee ${
        isActive ? "activated" : "deactivated"
      } successfully`,
      data: committee,
    });
  } catch (error) {
    console.error("Update Committee Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


// this is use for web

export const getCommitteeByIdWeb = async (req, res) => {
  try {
    const { id } = req.params;

    const committee = await Committees.findById(id)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!committee) {
      return res.status(404).json({
        success: false,
        message: "Committee not found",
      });
    }

    const data = {
      id: committee._id,

      content: committee.content || { en: "", hi: "" },

      type: committee.type || { en: "", hi: "" },

      displayOrder: committee.displayOrder,

      isActive: committee.isActive,

      createdBy: committee.createdBy
        ? {
            id: committee.createdBy._id,
            name: committee.createdBy.name,
            email: committee.createdBy.email,
          }
        : null,

      updatedBy: committee.updatedBy
        ? {
            id: committee.updatedBy._id,
            name: committee.updatedBy.name,
            email: committee.updatedBy.email,
          }
        : null,

      createdAt: committee.createdAt || null,
      updatedAt: committee.updatedAt || null,
    };

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get Committee By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching committee",
    });
  }
};

export const getAllCommitteesWeb = async (req, res) => {
  try {
    const committeeList = await Committees.find()
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ displayOrder: 1 });

    const data = committeeList.map((committee) => ({
      id: committee._id,

      content: committee.content || { en: "", hi: "" },

      type: committee.type || { en: "", hi: "" },

      displayOrder: committee.displayOrder,

      isActive: committee.isActive,

      // createdBy: committee.createdBy || null,
      // updatedBy: committee.updatedBy || null,

      createdBy: committee.createdBy
        ? {
            id: committee.createdBy._id,
            name: committee.createdBy.name,
            email: committee.createdBy.email,
          }
        : null,

      updatedBy: committee.updatedBy
        ? {
            id: committee.updatedBy._id,
            name: committee.updatedBy.name,
            email: committee.updatedBy.email,
          }
        : null,

      createdAt: committee.createdAt || null,
      updatedAt: committee.updatedAt || null,
    }));

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Get Committees Web Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching committees",
    });
  }
};