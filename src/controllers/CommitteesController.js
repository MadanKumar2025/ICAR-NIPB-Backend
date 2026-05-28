import Committees from "../models/CommitteesSchema.js";

export const createCommittee = async (req, res) => {
  try {
    const { content_en, content_hi } = req.body;

    if (
      !content_en ||
      !content_hi ||
      content_en.trim() === "" ||
      content_hi.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Both English and Hindi content are required",
      });
    }

    const createdBy = req.user?.id;

    await Committees.updateMany({}, { isActive: false });

    const newCommittee = new Committees({
      content: {
        en: content_en.trim(),
        hi: content_hi.trim(),
      },
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

export const getAllCommittees = async (req, res) => {
  try {
    const isAll = req.query.all === "true";

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.search) {
      filter.$or = [
        { "content.en": { $regex: req.query.search, $options: "i" } },
        { "content.hi": { $regex: req.query.search, $options: "i" } },
      ];
    }
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === "true";
    }

    let query = Committees.find(filter)
      .populate("createdBy", "username email")
      .populate("updatedBy", "username email")
      .sort({ createdAt: -1 });

    const total = await Committees.countDocuments(filter);

    let data;

    if (isAll) {
      data = await query;
    } else {
      data = await query.skip(skip).limit(limit);
    }

    return res.status(200).json({
      success: true,
      count: data.length,
      total,
      page: isAll ? null : page,
      limit: isAll ? null : limit,
      totalPages: isAll ? 1 : Math.ceil(total / limit),
      data,
    });
  } catch (error) {
    console.error("Get Committees Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

export const updateCommittee = async (req, res) => {
  try {
    const { id } = req.params;
    const { content_en, content_hi, isActive } = req.body;

    const data = await Committees.findById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Committee not found",
      });
    }

    if (content_en) {
      data.content.en = content_en.trim();
    }

    if (content_hi) {
      data.content.hi = content_hi.trim();
    }

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

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);

      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};
