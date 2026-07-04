import AccessibilityStatement from "../models/AccessibilityStatementSchema.js";

export const createAccessibilityStatement = async (req, res) => {
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

    if (content_en.length < 10 || content_hi.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Content must be at least 10 characters long",
      });
    }

    const createby = req.user?.id;

    const accessibilityStatement = new AccessibilityStatement({
      content: {
        en: content_en.trim(),
        hi: content_hi.trim(),
      },
      createby,
    });

    const savedData = await accessibilityStatement.save();

    return res.status(201).json({
      success: true,
      message: "Accessibility Statement created successfully",
      data: savedData,
    });
  } catch (error) {
    console.error("Create Accessibility Statement Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getAllAccessibilityStatements = async (req, res) => {
  try {
    const isAll = req.query.all === "true";

    const pageNumber = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (pageNumber - 1) * limit;

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

    let query = AccessibilityStatement.find(filter)
      .populate("createby", "username")
      .populate("updateby", "username")
      .sort({ createdate: -1 });

    const totalCount = await AccessibilityStatement.countDocuments(filter);

    let data;

    if (isAll) {
      data = await query;
    } else {
      data = await query.skip(skip).limit(limit);
    }

    return res.status(200).json({
      success: true,
      count: data.length,
      total: totalCount,
      page: isAll ? null : pageNumber,
      totalPages: isAll ? 1 : Math.ceil(totalCount / limit),
      data,
    });
  } catch (error) {
    console.error("Get Accessibility Statements Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateAccessibilityStatement = async (req, res) => {
  try {
    const { id } = req.params;
    const { content_en, content_hi, isActive } = req.body;

    const accessibilityStatement = await AccessibilityStatement.findById(id);

    if (!accessibilityStatement) {
      return res.status(404).json({
        success: false,
        message: "Accessibility Statement not found",
      });
    }

    if (content_en) {
      accessibilityStatement.content.en = content_en;
    }

    if (content_hi) {
      accessibilityStatement.content.hi = content_hi;
    }

    if (isActive !== undefined) {
      accessibilityStatement.isActive =
        isActive === "true" || isActive === true;
    }

    accessibilityStatement.updateby = req.user?.id;
    accessibilityStatement.updatedate = new Date();

    const updatedData = await accessibilityStatement.save();

    return res.status(200).json({
      success: true,
      message: "Accessibility Statement updated successfully",
      data: updatedData,
    });
  } catch (error) {
    console.error("Update Accessibility Statement Error:", error);

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
      message: error.message,
    });
  }
};


export const getAllAccessibilityStatementsWeb = async (req, res) => {
  try {
    const list = await AccessibilityStatement.find()
      .populate("createby", "name email")
      .populate("updateby", "name email")
      .sort({ createdate: -1 });

    const data = list.map((item) => ({
      id: item._id,
      content: item.content || { en: "", hi: "" },
      isActive: item.isActive,
      createdate: item.createdate,
      updatedate: item.updatedate || null,
      createby: item.createby || null,
      updateby: item.updateby || null,
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
      message: "Error fetching accessibility statements",
    });
  }
};