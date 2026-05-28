import Page from "../models/pageSchema.js";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";

export const createPage = async (req, res) => {
  try {
    const {
      pageTitle_en,
      pageTitle_hi,
      slug,
      subtitle_en,
      subtitle_hi,
      metaDescription,
      designTemplate,
      keyword,
      seoPageType,
      imageTitle,
      apiName,
    } = req.body;

    const processedKeywords = keyword
      ? Array.isArray(keyword)
        ? keyword
        : keyword.split(",").map((k) => k.trim())
      : [];

    if (processedKeywords.length > 100) {
      return res.status(400).json({
        success: false,
        message: "You can add up to 100 keywords only",
      });
    }
    if (!pageTitle_en || !pageTitle_hi) {
      return res.status(400).json({
        success: false,
        message: "PageTitle (en & hi) are required",
      });
    }

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Display URL are required",
      });
    }
    // if (!apiName) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "apiName is required",
    //   });
    // }
    if (!subtitle_en || !subtitle_hi) {
      return res.status(400).json({
        success: false,
        message: "Subtitle (en & hi) are required",
      });
    }
    if (!designTemplate) {
      return res.status(400).json({
        success: false,
        message: "DesignTemplate  are required",
      });
    }
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Photo is required",
      });
    }
    const photo = req.file ? req.file.filename : null;
    const createby = req.user.id;

    const page = new Page({
      pageTitle: {
        en: pageTitle_en,
        hi: pageTitle_hi,
      },
      slug,
      apiName,
      metaDescription,
      photo,
      designTemplate,
      subtitle: {
        en: subtitle_en,
        hi: subtitle_hi,
      },
      createby,
      keyword: processedKeywords,
      seoPageType,
      imageTitle,
      createdate: new Date(),
    });

    const savedPage = await page.save();

    res.status(201).json({
      success: true,
      message: "Page created successfully",
      data: savedPage,
    });
  } catch (error) {
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
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getAllPages = async (req, res) => {
  try {
    const isAll = req.query.all === "true";

    const pageNumber = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (pageNumber - 1) * limit;

    const filter = {};
    if (req.query.slug) filter.slug = req.query.slug;

    if (req.query.apiName) {
      filter.apiName = { $regex: req.query.apiName, $options: "i" };
    }

    if (req.query.pageTitle)
      filter.pageTitle = { $regex: req.query.pageTitle, $options: "i" };

    let pagesQuery = Page.find(filter)
      .populate("designTemplate", "name")
      .populate("createby", "username")
      .populate("updateby", "username");

    let pages;
    let totalPagesCount = await Page.countDocuments(filter);

    if (isAll) {
      // All data
      pages = await pagesQuery;
    } else {
      // Pagination
      pages = await pagesQuery.skip(skip).limit(limit);
    }

    res.status(200).json({
      success: true,
      count: pages.length,
      total: totalPagesCount,
      page: isAll ? null : pageNumber,
      totalPages: isAll ? 1 : Math.ceil(totalPagesCount / limit),
      data: pages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// export const getPageById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // validate ObjectId
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid page ID",
//       });
//     }

//     const page = await Page.findById(id)
//       .populate("designTemplate", "name")
//       .populate("createby", "username")
//       .populate("updateby", "username");

//     if (!page) {
//       return res.status(404).json({
//         success: false,
//         message: "Page not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: page,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };



export const updatePageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, updateby } = req.body;

    const page = await Page.findByIdAndUpdate(
      id,
      {
        isActive: isActive,
        updateby: updateby,
        updatedate: new Date(),
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Page status updated successfully",
      data: page,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePage = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      pageTitle_en,
      pageTitle_hi,
      slug,
      subtitle_en,
      subtitle_hi,
      metaDescription,
      designTemplate,
      keyword,
      seoPageType,
      imageTitle,
      isActive,
      apiName,
    } = req.body;

    const page = await Page.findById(id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    if (pageTitle_en) {
      const existingEn = await Page.findOne({
        "pageTitle.en": pageTitle_en,
        _id: { $ne: id },
      });
      if (existingEn) {
        return res.status(400).json({
          success: false,
          message: "English Page title already exists",
        });
      }
      page.pageTitle.en = pageTitle_en;
    }

    if (pageTitle_hi) {
      const existingHi = await Page.findOne({
        "pageTitle.hi": pageTitle_hi,
        _id: { $ne: id },
      });
      if (existingHi) {
        return res.status(400).json({
          success: false,
          message: "Hindi Page title already exists",
        });
      }
      page.pageTitle.hi = pageTitle_hi;
    }
    if (apiName) {
      const existingApi = await Page.findOne({
        apiName,
        _id: { $ne: id },
      });
      // if (existingApi) {
      //   return res.status(400).json({
      //     success: false,
      //     message: "apiName already exists",
      //   });
      // }
      page.apiName = apiName;
    }
    if (subtitle_en) page.subtitle.en = subtitle_en;
    if (subtitle_hi) page.subtitle.hi = subtitle_hi;

    if (slug) {
      const existingSlug = await Page.findOne({
        slug,
        _id: { $ne: id },
      });
      if (existingSlug) {
        return res.status(400).json({
          success: false,
          message: "Display URL already exists",
        });
      }
      page.slug = slug;
    }

    if (metaDescription !== undefined) page.metaDescription = metaDescription;
    if (designTemplate) page.designTemplate = designTemplate;
    if (seoPageType) page.seoPageType = seoPageType;
    if (imageTitle) page.imageTitle = imageTitle;

    if (keyword) {
      const processedKeywords = Array.isArray(keyword)
        ? keyword
        : keyword.split(",").map((k) => k.trim());

      if (processedKeywords.length > 100) {
        return res.status(400).json({
          success: false,
          message: "You can add up to 100 keywords only",
        });
      }

      page.keyword = processedKeywords;
    }

    if (isActive !== undefined) {
      page.isActive = isActive === "true" || isActive === true;
    }

    page.updateby = req.user?.id;

    if (req.file) {
      if (page.photo) {
        const oldImagePath = path.join("uploads", page.photo);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      page.photo = req.file.filename;
    }

    page.updatedate = new Date();

    const updatedPage = await page.save();

    return res.status(200).json({
      success: true,
      message: "Page updated successfully",
      data: updatedPage,
    });
  } catch (error) {
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
export const getAllPagesWeb = async (req, res) => {
  try {
    const pagesList = await Page.find()
      .populate("designTemplate", "name title")
      .populate("createby", "name email")
      .populate("updateby", "name email")
      .sort({ createdate: -1 });

    return res.status(200).json({
      success: true,
      count: pagesList.length,
      data: pagesList,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching pages",
    });
  }
};

export const getPageById = async (req, res) => {
  try {
    const { id } = req.params;

    let page;

    // Agar valid ObjectId hai to ID se fetch
    if (mongoose.Types.ObjectId.isValid(id)) {
      page = await Page.findById(id)
        .populate("designTemplate", "name")
        .populate("createby", "username")
        .populate("updateby", "username");
    } else {
      // Warna apiName se fetch
      page = await Page.findOne({ apiName: id })
        .populate("designTemplate", "name")
        .populate("createby", "username")
        .populate("updateby", "username");
    }

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    res.status(200).json({
      success: true,
      data: page,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// export const getPageBySlug = async (req, res) => {
//   try {
//     const { slug } = req.params;

//     const page = await Page.findOne({ slug })
//       .populate("designTemplate", "name")
//       .populate("createby", "username")
//       .populate("updateby", "username");

//     if (!page) {
//       return res.status(404).json({
//         success: false,
//         message: "Page not found",
//       });
//     }

//     const data = {
//       id: page._id,
//       pageTitle: page.pageTitle || { en: "", hi: "" },
//       slug: page.slug,
//       subtitle: page.subtitle || { en: "", hi: "" },
//       metaDescription: page.metaDescription || "",
//       designTemplate: page.designTemplate || null,
//       keyword: page.keyword || [],
//       seoPageType: page.seoPageType || "",
//       photo: page.photo,
//       imageTitle: page.imageTitle || "",
//       apiName: page?.apiName || "",
//       isActive: page.isActive,
//       createdBy: page.createby || null,
//       updatedBy: page.updateby || null,
//       createdAt: page.createdate,
//       updatedAt: page.updatedate || null,
//     };

//     return res.status(200).json({
//       success: true,
//       data,
//     });

//   } catch (error) {
//     console.error(error);

//     return res.status(500).json({
//       success: false,
//       message: "Error fetching page",
//     });
//   }
// };

export const getPageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const page = await Page.findOne({ slug })
      .populate({
        path: "designTemplate",
        select: "templateName htmlDescription createby updateby createdAt updatedAt",
        populate: [
          { path: "createby", select: "username" },
          { path: "updateby", select: "username" },
        ],
      })
      .populate("createby", "username")
      .populate("updateby", "username");

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    const data = {
      id: page._id,
      pageTitle: page.pageTitle || { en: "", hi: "" },
      slug: page.slug,
      subtitle: page.subtitle || { en: "", hi: "" },
      metaDescription: page.metaDescription || "",
      designTemplate: page.designTemplate || null, // now includes template details + user info
      keyword: page.keyword || [],
      seoPageType: page.seoPageType || "",
      photo: page.photo,
      imageTitle: page.imageTitle || "",
      apiName: page?.apiName || "",
      isActive: page.isActive,
      createdBy: page.createby || null,
      updatedBy: page.updateby || null,
      createdAt: page.createdate,
      updatedAt: page.updatedate || null,
    };

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error fetching page",
    });
  }
};