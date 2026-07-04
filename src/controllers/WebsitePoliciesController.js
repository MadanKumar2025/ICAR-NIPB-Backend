import WebsitePolicies from "../models/WebsitePoliciesSchema.js";

export const createWebsitePolicies = async (req, res) => {
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

    // if (content_en.length < 10 || content_hi.length < 10) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Content must be at least 10 characters long",
    //   });
    // }

    const createby = req.user?.id;

    await WebsitePolicies.updateMany({}, { isActive: false });

    const newData = new WebsitePolicies({
      content: {
        en: content_en.trim(),
        hi: content_hi.trim(),
      },
      createby,
      isActive: true,
    });

    const saved = await newData.save();

    return res.status(201).json({
      success: true,
      message: "Accessibility Statement created successfully",
      data: saved,
    });
  } catch (error) {
    console.error("Create Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getAllWebsitePolicies = async (req, res) => {
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

    let query = WebsitePolicies.find(filter)
      .populate("createby", "username email")
      .populate("updateby", "username email")
      .sort({ createdate: -1 });

    const total = await WebsitePolicies.countDocuments(filter);

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
    console.error("Get WebsitePolicies Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

export const updateWebsitePolicies = async (req, res) => {
  try {
    const { id } = req.params;
    const { content_en, content_hi, isActive } = req.body;

    const websitePolicy = await WebsitePolicies.findById(id);

    if (!websitePolicy) {
      return res.status(404).json({
        success: false,
        message: "Website Policy not found",
      });
    }

    if (content_en) {
      websitePolicy.content.en = content_en.trim();
    }

    if (content_hi) {
      websitePolicy.content.hi = content_hi.trim();
    }

    if (isActive !== undefined) {
      websitePolicy.isActive =
        isActive === "true" || isActive === true;
    }

    websitePolicy.updateby = req.user?.id;
    websitePolicy.updatedate = new Date();

    const updatedData = await websitePolicy.save();

    return res.status(200).json({
      success: true,
      message: "Website Policy updated successfully",
      data: updatedData,
    });
  } catch (error) {
    console.error("Update Website Policy Error:", error);


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
      message: error.message || "Server Error",
    });
  }
};



// this is use for web
export const getAllWebsitePoliciesWeb = async (req, res) => {
  try {
    const policies = await WebsitePolicies.find()
      .populate("createby", "name email")
      .populate("updateby", "name email")
      .sort({ createdate: -1 });

    const data = policies.map((policy) => ({
      id: policy._id,
      content: policy.content || { en: "", hi: "" },
      isActive: policy.isActive,
      createdate: policy.createdate,
      updatedate: policy.updatedate || null,
      createby: policy.createby || null,
      updateby: policy.updateby || null,
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
      message: "Error fetching website policies",
    });
  }
};