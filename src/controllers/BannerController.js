import Banner from "../models/bannerSchema.js";
import path from "path";
import fs from "fs";

export const createBanner = async (req, res) => {
  try {
    const {
      bannerTitle,
      title_en,
      title_hi,
      subTitle_en,
      subTitle_hi,
      displayOrderNo,
    } = req.body;

    // validations
    if (!bannerTitle) {
      return res.status(400).json({
        success: false,
        message: "Banner title is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Banner image is required",
      });
    }

    if (displayOrderNo === undefined || displayOrderNo === null) {
      return res.status(400).json({
        success: false,
        message: "Display Order No is required",
      });
    }

    // check duplicate displayOrderNo (since unique: true)
    const existingOrder = await Banner.findOne({ displayOrderNo });
    if (existingOrder) {
      return res.status(400).json({
        success: false,
        message: "Display Order No already exists",
      });
    }

    const bannerImage = req.file.filename;

    const createby = req.user?.id;

    const banner = new Banner({
      bannerTitle,
      bannerImage,
      title: {
        en: title_en || "",
        hi: title_hi || "",
      },
      subTitle: {
        en: subTitle_en || "",
        hi: subTitle_hi || "",
      },
      displayOrderNo: Number(displayOrderNo),
      createby,
      createdate: new Date(),
    });

    const savedBanner = await banner.save();

    res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: savedBanner,
    });
  } catch (error) {
    console.error("Create Banner Error:", error);

    // duplicate key error (Mongo)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    // validation error
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getAllBanners = async (req, res) => {
  try {
    const isAll = req.query.all === "true";

    const pageNumber = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (pageNumber - 1) * limit;

    const filter = {};
    if (req.query.bannerTitle) {
      filter.bannerTitle = { $regex: req.query.bannerTitle, $options: "i" };
    }

    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === "true";
    }

    let bannerQuery = Banner.find(filter)
      .populate("createby", "username")
      .populate("updateby", "username")
      .sort({ displayOrderNo: 1 });

    let banners;
    const totalCount = await Banner.countDocuments(filter);

    if (isAll) {
      banners = await bannerQuery;
    } else {
      banners = await bannerQuery.skip(skip).limit(limit);
    }

    res.status(200).json({
      success: true,
      count: banners.length,
      total: totalCount,
      page: isAll ? null : pageNumber,
      totalPages: isAll ? 1 : Math.ceil(totalCount / limit),
      data: banners,
    });
  } catch (error) {
    console.error("Get Banner Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const banner = await Banner.findByIdAndUpdate(
      id,
      {
        isActive: isActive,
        updateby: req.user?.id,
        updatedate: new Date(),
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Banner status updated successfully",
      data: banner,
    });
  } catch (error) {
    console.error("Update Banner Status Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      bannerTitle,
      title_en,
      title_hi,
      subTitle_en,
      subTitle_hi,
      displayOrderNo,
      isActive,
    } = req.body;

    const banner = await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    if (bannerTitle) {
      banner.bannerTitle = bannerTitle;
    }

    if (title_en) {
      banner.title.en = title_en;
    }

    if (title_hi) {
      banner.title.hi = title_hi;
    }

    if (subTitle_en) {
      banner.subTitle.en = subTitle_en;
    }

    if (subTitle_hi) {
      banner.subTitle.hi = subTitle_hi;
    }

    if (displayOrderNo !== undefined) {
      const existingOrder = await Banner.findOne({
        displayOrderNo,
        _id: { $ne: id },
      });

      if (existingOrder) {
        return res.status(400).json({
          success: false,
          message: "Display Order No already exists",
        });
      }

      banner.displayOrderNo = Number(displayOrderNo);
    }

    if (isActive !== undefined) {
      banner.isActive = isActive === "true" || isActive === true;
    }

    banner.updateby = req.user?.id;

    if (req.file) {
      if (banner.bannerImage) {
        const oldPath = path.join("uploads", banner.bannerImage);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      banner.bannerImage = req.file.filename;
    }

    banner.updatedate = new Date();

    const updatedBanner = await banner.save();

    return res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      data: updatedBanner,
    });
  } catch (error) {
    console.error("Update Banner Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate field value detected",
        error: error.keyValue,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// this is use for web
export const getAllBannerWeb = async (req, res) => {
  try {
    const bannerList = await Banner.find()
      .populate("createby", "name email")
      .populate("updateby", "name email")
      .sort({ displayOrderNo: 1 });

    const data = bannerList.map((banner) => ({
      id: banner._id,
      bannerImage: banner.bannerImage,
      bannerTitle: banner.bannerTitle || "",
      title: banner.title || { en: "", hi: "" },
      subTitle: banner.subTitle || { en: "", hi: "" },
      displayOrderNo: banner.displayOrderNo,
      isActive: banner.isActive,
      createdBy: banner.createby || null,
      updatedBy: banner.updateby || null,
      createdAt: banner.createdate,
      updatedAt: banner.updatedate || null,
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
      message: "Error fetching banners",
    });
  }
};
