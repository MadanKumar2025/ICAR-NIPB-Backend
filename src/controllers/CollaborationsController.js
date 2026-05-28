import Collaborations from "../models/CollaborationsSchema.js";

export const createCollaborations = async (req, res) => {
  try {
    const { title_en, title_hi, isActive } = req.body || {};

    const cleanTitleEn = title_en?.trim();
    const cleanTitleHi = title_hi?.trim();

    // Validation
    if (!cleanTitleEn) {
      return res.status(400).json({
        success: false,
        message: "Title (English) is required",
      });
    }

    if (!cleanTitleHi) {
      return res.status(400).json({
        success: false,
        message: "Title (Hindi) is required",
      });
    }

    // Create document
    const collaboration = new Collaborations({
      title: {
        en: cleanTitleEn,
        hi: cleanTitleHi,
      },
      isActive: typeof isActive === "boolean" ? isActive : true, // 👈 important
      createdBy: req.user?.id || null,
    });

    const saved = await collaboration.save();

    return res.status(201).json({
      success: true,
      message: "Collaboration created successfully",
      data: saved,
    });
  } catch (err) {
    console.error("Create Collaboration Error =>", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Server Error",
    });
  }
};

export const getCollaborations = async (req, res) => {
  try {
    const isAll = req.query.all === "true";

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const query = Collaborations.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email");

    const total = await Collaborations.countDocuments();

    let data;

    if (isAll) {
      data = await query;
    } else {
      data = await query.skip(skip).limit(limit);
    }

    return res.status(200).json({
      success: true,
      count: data.length,
      total: total,
      page: isAll ? null : page,
      totalPages: isAll ? 1 : Math.ceil(total / limit),
      data: data,
    });
  } catch (error) {
    console.error("Get Collaborations Error =>", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const updateCollaborationsStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const record = await Collaborations.findByIdAndUpdate(
      id,
      {
        $set: {
          isActive: isActive === "true" || isActive === true,
          updatedBy: req.user?.id || null,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Collaboration not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: record,
    });
  } catch (error) {
    console.error("Update Collaboration Status Error =>", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const updateCollaborations = async (req, res) => {
  try {
    const { id } = req.params;

    const { title_en, title_hi, isActive } = req.body || {};

    const record = await Collaborations.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Collaboration not found",
      });
    }

    // ---------------- TITLE ----------------
    if (title_en !== undefined || title_hi !== undefined) {
      const currentTitle = record.title || {};

      const newEn =
        typeof title_en === "string"
          ? title_en.trim()
          : currentTitle.en;

      const newHi =
        typeof title_hi === "string"
          ? title_hi.trim()
          : currentTitle.hi;

      if (!newEn) {
        return res.status(400).json({
          success: false,
          message: "English title is required",
        });
      }

      if (!newHi) {
        return res.status(400).json({
          success: false,
          message: "Hindi title is required",
        });
      }

      record.title = {
        en: newEn,
        hi: newHi,
      };
    }

    // ---------------- IS ACTIVE ----------------
    if (isActive !== undefined) {
      if (typeof isActive === "boolean") {
        record.isActive = isActive;
      } else if (typeof isActive === "string") {
        const val = isActive.toLowerCase().trim();

        if (val !== "true" && val !== "false") {
          return res.status(400).json({
            success: false,
            message: "isActive must be true or false",
          });
        }

        record.isActive = val === "true";
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid isActive value",
        });
      }
    }

    // ---------------- AUDIT ----------------
    record.updatedBy = req.user?.id || null;
    record.updatedAt = new Date();

    const updated = await record.save();

    return res.status(200).json({
      success: true,
      message: "Collaboration updated successfully",
      data: updated,
    });

  } catch (error) {
    console.error("Update Collaboration Error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((e) => e.message)
          .join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};



// this is use for web
export const getAllCollaborationsWeb = async (req, res) => {
  try {
    const collaborationList = await Collaborations.find()
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdAt: -1 });

    const data = collaborationList.map((collab) => ({
      id: collab._id,
      title: collab.title || { en: "", hi: "" },
      isActive: collab.isActive,
      createdBy: collab.createdBy || null,
      updatedBy: collab.updatedBy || null,
      createdAt: collab.createdAt,
      updatedAt: collab.updatedAt || null,
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
      message: "Error fetching collaborations",
    });
  }
};