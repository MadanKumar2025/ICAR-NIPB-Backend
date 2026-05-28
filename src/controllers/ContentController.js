import Content from "../models/contentSchema.js";
import mongoose from "mongoose";

export const createContent = async (req, res) => {
  try {
    const { pageId, content_en, content_hi } = req.body;

    if (!pageId || !mongoose.Types.ObjectId.isValid(pageId)) {
      return res.status(400).json({
        success: false,
        message: "Valid PageId is required",
      });
    }

    if (!content_en || !content_hi) {
      return res.status(400).json({
        success: false,
        message: "Content (en & hi) are required",
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const newContent = new Content({
      pageId,
      content: {
        en: content_en,
        hi: content_hi,
      },
      createdBy: req.user.id,
    });

    const savedContent = await newContent.save();

    res.status(201).json({
      success: true,
      message: "Content created successfully",
      data: savedContent,
    });
  } catch (error) {
    console.error("ERROR =>", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid data format",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const getAllContent = async (req, res) => {
  try {
    const isAll = req.query.all === "true";

    const pageNumber = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (pageNumber - 1) * limit;

    const filter = {};

    if (req.query.pageId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.pageId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid pageId",
        });
      }
      filter.pageId = req.query.pageId;
    }

    if (req.query.content_en) {
      filter["content.en"] = {
        $regex: req.query.content_en,
        $options: "i",
      };
    }

    let contentQuery = Content.find(filter)
      .populate("pageId", "pageTitle slug")
      .sort({ createdAt: -1 })
      .lean();

    let contents;
    let totalCount = await Content.countDocuments(filter);

    if (isAll) {
      contents = await contentQuery;
    } else {
      contents = await contentQuery.skip(skip).limit(limit);
    }

    res.status(200).json({
      success: true,
      count: contents.length,
      total: totalCount,
      page: isAll ? null : pageNumber,
      totalPages: isAll ? 1 : Math.ceil(totalCount / limit),
      data: contents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getContentByPageId = async (req, res) => {
  try {
    const { pageId } = req.params;

    if (!pageId) {
      return res.status(400).json({
        success: false,
        message: "PageId is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(pageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Page ID",
      });
    }

    const filter = { pageId };

    if (req.query.content_en) {
      filter["content.en"] = {
        $regex: req.query.content_en,
        $options: "i",
      };
    }

    const contents = await Content.find(filter)
      .populate("pageId", "pageTitle slug")
      .sort({ createdAt: -1 })
      .lean();

    if (!contents || contents.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No content found",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      count: contents.length,
      data: contents,
    });
  } catch (error) {
    console.error("ERROR =>", error);

    res.status(500).json({
      success: false,
      message: error.message || "Kuch galat ho gaya",
    });
  }
};

export const updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { pageId, content_en, content_hi } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Content ID",
      });
    }

    const content = await Content.findById(id);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content nahi mila",
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user, login karo pehle",
      });
    }

    // PageId update
    if (pageId) {
      if (!mongoose.Types.ObjectId.isValid(pageId)) {
        return res.status(400).json({
          success: false,
          message: "Valid PageId provide karo",
        });
      }
      content.pageId = pageId;
    }

    // Content update
    if (content_en) content.content.en = content_en;
    if (content_hi) content.content.hi = content_hi;

    // Update metadata
    content.updatedBy = req.user.id;

    const updatedContent = await content.save();

    res.status(200).json({
      success: true,
      message: "Content successfully update ho gaya",
      data: updatedContent,
    });
  } catch (error) {
    console.error("ERROR =>", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid data format",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Kuch galat ho gaya",
    });
  }
};


// this is use for web
export const getContentByPageIdWeb = async (req, res) => {
  try {
    const { pageId } = req.params;

    if (!pageId) {
      return res.status(400).json({
        success: false,
        message: "PageId is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(pageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Page ID",
      });
    }

    const contentList = await Content.find({ pageId })
      .populate("pageId", "title slug")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdAt: -1 });

    const data = contentList.map((item) => ({
      id: item._id,
      pageId: item.pageId || null,
      content: item.content || { en: "", hi: "" },
      createdBy: item.createdBy || null,
      updatedBy: item.updatedBy || null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt || null,
    }));

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching content by pageId",
    });
  }
};