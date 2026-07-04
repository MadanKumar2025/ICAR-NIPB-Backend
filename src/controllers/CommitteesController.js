import Committees from "../models/CommitteesSchema.js";

export const createCommittee = async (req, res) => {
  try {
    const {
      content_en,
      content_hi,
      type_en,
      type_hi,
      createdBy,
      isActive,
    } = req.body;

    // Validation
    const missingFields = [];

    if (!content_en) missingFields.push("Content (English)");
    if (!content_hi) missingFields.push("Content (Hindi)");
    if (!type_en) missingFields.push("Type (English)");
    if (!type_hi) missingFields.push("Type (Hindi)");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const committee = new Committees({
      content: {
        en: content_en.trim(),
        hi: content_hi.trim(),
      },

      type: {
        en: type_en.trim(),
        hi: type_hi.trim(),
      },

      createdBy,
      isActive: isActive ?? true,
    });

    const savedCommittee = await committee.save();

    return res.status(201).json({
      success: true,
      message: "Committee created successfully",
      data: savedCommittee,
    });
  } catch (error) {
    console.error("Create Committee Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

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

 
    if (isActive !== undefined) {
      data.isActive =
        isActive === "true" || isActive === true;
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
