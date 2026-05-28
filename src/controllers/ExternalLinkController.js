import ExternalLink from "../models/ExternalLinkSchema.js";

export const createExternalLink = async (req, res) => {
  try {
    const {
      type,
      title_en,
      title_hi,
      link,
    } = req.body || {};

    const cleanType = type?.trim();
    const cleanTitleEn = title_en?.trim();
    const cleanTitleHi = title_hi?.trim();
    const cleanLink = link?.trim();

    // Validation
    if (!cleanType) {
      return res.status(400).json({
        success: false,
        message: "Type is required",
      });
    }

    if (!cleanTitleEn) {
      return res.status(400).json({
        success: false,
        message: "Title (English) is required",
      });
    }

    if (!cleanLink) {
      return res.status(400).json({
        success: false,
        message: "Link is required",
      });
    }

    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(cleanLink)) {
      return res.status(400).json({
        success: false,
        message: "Invalid URL format",
      });
    }

    // Create document
    const externalLink = new ExternalLink({
      type: cleanType,

      title: {
        en: cleanTitleEn,
        hi: cleanTitleHi,
      },

      link: cleanLink,

      isActive: true,

      createdBy: req.user?.id || null,
    });

    const saved = await externalLink.save();

    return res.status(201).json({
      success: true,
      message: "External link created successfully",
      data: saved,
    });
  } catch (err) {
    console.error("Create External Link Error =>", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Server Error",
    });
  }
};

export const getExternalLinks = async (req, res) => {
  try {
    const isAll = req.query.all === "true";

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const query = ExternalLink.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email");

    const totalLinks = await ExternalLink.countDocuments();

    let links;

    if (isAll) {
      links = await query;
    } else {
      links = await query.skip(skip).limit(limit);
    }

    return res.status(200).json({
      success: true,
      count: links.length,
      total: totalLinks,
      page: isAll ? null : page,
      totalPages: isAll ? 1 : Math.ceil(totalLinks / limit),
      data: links,
    });
  } catch (error) {
    console.error("Get External Links Error =>", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const updateExternalLinkStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const record = await ExternalLink.findByIdAndUpdate(
      id,
      {
        $set: {
          isActive: isActive === "true" || isActive === true,
          updatedBy: req.user?.id || null,
        },
      },
      { new: true }
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "External link not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: record,
    });
  } catch (error) {
    console.error("Update External Link Status Error =>", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const updateExternalLink = async (req, res) => {
  try {
    const { id } = req.params;

    const { type, title_en, title_hi, link, isActive } = req.body || {};

    const record = await ExternalLink.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "External link not found",
      });
    }

    // ---------------- TYPE ----------------
    if (type !== undefined) {
      const cleanType = typeof type === "string" ? type.trim() : "";

      if (!cleanType) {
        return res.status(400).json({
          success: false,
          message: "Type cannot be empty",
        });
      }

      record.type = cleanType;
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

      record.title = {
        en: newEn,
        hi: newHi,
      };
    }

    // ---------------- LINK ----------------
    if (link !== undefined) {
      const cleanLink = typeof link === "string" ? link.trim() : "";

      if (!cleanLink) {
        return res.status(400).json({
          success: false,
          message: "Link cannot be empty",
        });
      }

      record.link = cleanLink; // schema will validate URL
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
      message: "External link updated successfully",
      data: updated,
    });

  } catch (error) {
    console.error("Update External Link Error:", error);

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