import RelatedLinks from "../models/RelatedLinksSchema.js";

export const createRelatedLinks = async (req, res) => {
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

    const createby = req.user?.id;

    await RelatedLinks.updateMany({}, { isActive: false });

    const newLink = new RelatedLinks({
      content: {
        en: content_en.trim(),
        hi: content_hi.trim(),
      },
      createby,
      isActive: true,
    });

    const saved = await newLink.save();

    return res.status(201).json({
      success: true,
      message: "Related Links created successfully",
      data: saved,
    });
  } catch (error) {
    console.error("Create RelatedLinks Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getAllRelatedLinks = async (req, res) => {
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

    let query = RelatedLinks.find(filter)
      .populate("createby", "username email")
      .populate("updateby", "username email")
      .sort({ createdate: -1 });

    const total = await RelatedLinks.countDocuments(filter);

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
    console.error("Get RelatedLinks Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

export const updateRelatedLinks = async (req, res) => {
  try {
    const { id } = req.params;
    const { content_en, content_hi, isActive } = req.body;

    const data = await RelatedLinks.findById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Related Links not found",
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
        await RelatedLinks.updateMany({}, { isActive: false });
      }

      data.isActive = activeValue;
    }

    data.updateby = req.user?.id;
    data.updatedate = new Date();

    const updatedData = await data.save();

    return res.status(200).json({
      success: true,
      message: "Related Links updated successfully",
      data: updatedData,
    });
  } catch (error) {
    console.error("Update RelatedLinks Error:", error);

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


// this is use for web
export const getAllRelatedLinksWeb = async (req, res) => {
  try {
    const links = await RelatedLinks.find()
      .populate("createby", "name email")
      .populate("updateby", "name email")
      .sort({ createdate: -1 });

    const data = links.map((item) => ({
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
      message: "Error fetching related links",
    });
  }
};