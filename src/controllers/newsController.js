import News from "../models/NewsSchema.js";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";

export const createNews = async (req, res) => {
  try {
    const {
      type,
      title_en,
      title_hi,
      link,
      publishDate,
      expiryDate,
      markAsNew,
      isActive,
    } = req.body;

    // --- Validations ---
    if (!type || type.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Type is required" });
    }

    if (!title_en || !title_hi) {
      return res.status(400).json({
        success: false,
        message: "Title required in both English & Hindi",
      });
    }

    if (publishDate && isNaN(Date.parse(publishDate))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid publish date" });
    }

    if (expiryDate && isNaN(Date.parse(expiryDate))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid expiry date" });
    }

    if (
      publishDate &&
      expiryDate &&
      new Date(expiryDate) < new Date(publishDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "Expiry date must be greater than publish date",
      });
    }

    if (link && !/^https?:\/\/.+/.test(link)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid link format" });
    }

    // --- Create News Object ---
    const news = new News({
      type: type.trim(),
      title: {
        en: title_en,
        hi: title_hi,
      },
      link: link || null,
      documentFile: req.file ? req.file.filename : null,
      publishDate: publishDate ? new Date(publishDate) : new Date(),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      markAsNew: markAsNew || false,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user.id,
    });

    // --- Save to DB ---
    const savedNews = await news.save();

    res.status(201).json({
      success: true,
      message: "News created successfully",
      data: savedNews,
    });
  } catch (error) {
    console.error("Error creating news:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const getAllNews = async (req, res) => {
  try {
    const newsList = await News.find()
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdAt: -1 });

    const data = newsList.map((news) => ({
      id: news._id,
      type: news.type,
      title: news.title || { en: "", hi: "" },
      link: news.link || "",
      documentFile: news.documentFile,
      isActive: news.isActive,
      publishDate: news.publishDate || null,
      expiryDate: news.expiryDate || null,
      markAsNew: news.markAsNew,
      createdBy: news.createdBy || null,
      updatedBy: news.updatedBy || null,
      createdAt: news.createdAt,
      updatedAt: news.updatedAt || null,
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
      message: "Error fetching news",
    });
  }
};

export const updateNews = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing news ID",
      });
    }

    const {
      type,
      title_en,
      title_hi,
      link,
      publishDate,
      expiryDate,
      markAsNew,
      isActive,
    } = req.body;

    const news = await News.findById(id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found",
      });
    }

    // ✅ Validation
    if (type && type.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Type cannot be empty",
      });
    }

    if (
      (title_en && title_en.trim() === "") ||
      (title_hi && title_hi.trim() === "")
    ) {
      return res.status(400).json({
        success: false,
        message: "Title cannot be empty",
      });
    }

    if (publishDate && isNaN(Date.parse(publishDate))) {
      return res.status(400).json({
        success: false,
        message: "Invalid publish date",
      });
    }

    if (expiryDate && isNaN(Date.parse(expiryDate))) {
      return res.status(400).json({
        success: false,
        message: "Invalid expiry date",
      });
    }

    if (
      publishDate &&
      expiryDate &&
      new Date(expiryDate) < new Date(publishDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "Expiry date must be greater than publish date",
      });
    }

    if (link && !/^https?:\/\/.+/.test(link)) {
      return res.status(400).json({
        success: false,
        message: "Invalid link format",
      });
    }

    // ✅ Duplicate check (English title pe)
    if (title_en && title_en.trim() !== news.title?.en) {
      const existingNews = await News.findOne({
        "title.en": title_en.trim(),
        _id: { $ne: id },
      });

      if (existingNews) {
        return res.status(400).json({
          success: false,
          message: `News with this English title already exists`,
        });
      }
    }

    // ✅ File update
    if (req.file) {
      if (news.documentFile) {
        const oldFilePath = path.join(
          process.cwd(),
          "uploads",
          news.documentFile,
        );

        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      news.documentFile = req.file.filename;
    }

    // ✅ Update fields
    if (type) news.type = type.trim();

    if (title_en || title_hi) {
      news.title = {
        en: title_en ? title_en.trim() : news.title?.en,
        hi: title_hi ? title_hi.trim() : news.title?.hi,
      };
    }

    if (link !== undefined) news.link = link || null;
    if (publishDate) news.publishDate = new Date(publishDate);
    if (expiryDate !== undefined)
      news.expiryDate = expiryDate ? new Date(expiryDate) : null;

    if (isActive !== undefined) news.isActive = isActive;
    if (markAsNew !== undefined) news.markAsNew = markAsNew;

    news.updatedBy = req.user?.id;
    news.updatedAt = new Date();

    const updatedNews = await news.save();

    return res.status(200).json({
      success: true,
      message: "News updated successfully",
      data: updatedNews,
    });
  } catch (error) {
    console.error("Error updating news:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const updateNewsStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const news = await News.findByIdAndUpdate(
      id,
      {
        isActive: isActive,
        updatedBy: req.user?.id,
        updatedAt: new Date(),
      },
      { new: true },
    );

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "News status updated successfully",
      data: news,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// This is use for web
export const getAllNewsWeb = async (req, res) => {
  try {
    const newsList = await News.find()
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdAt: -1 });

    const data = newsList.map((news) => ({
      id: news._id,
      type: news.type,
      title: news.title || { en: "", hi: "" },
      link: news.link || "",
      documentFile: news.documentFile,
      isActive: news.isActive,
      publishDate: news.publishDate || null,
      expiryDate: news.expiryDate || null,
      markAsNew: news.markAsNew,
      createdBy: news.createdBy || null,
      updatedBy: news.updatedBy || null,
      createdAt: news.createdAt,
      updatedAt: news.updatedAt || null,
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
      message: "Error fetching news",
    });
  }
};

export const getNewsByType = async (req, res) => {
  try {
    const { type } = req.params;

    const newsList = await News.find({
      type,
      isActive: true,
    })
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdAt: -1 });

    const data = newsList.map((news) => ({
      id: news._id,
      type: news.type,
      title: news.title || { en: "", hi: "" },
      link: news.link || "",
      documentFile: news.documentFile,
      isActive: news.isActive,
      publishDate: news.publishDate || null,
      expiryDate: news.expiryDate || null,
      markAsNew: news.markAsNew,
      createdBy: news.createdBy || null,
      updatedBy: news.updatedBy || null,
      createdAt: news.createdAt,
      updatedAt: news.updatedAt || null,
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
      message: "Error fetching news by type",
    });
  }
};