import PublicationsSchema from "../models/PublicationsSchema.js";
import Publications from "../models/PublicationsSchema.js";
import mongoose from "mongoose";

export const createPublication = async (req, res) => {
  try {
    let { year, title_en, title_hi, category, isActive } = req.body;

    // Trim values
    year = year?.trim();
    title_en = title_en?.trim();
    title_hi = title_hi?.trim();
    category = category?.trim();

    // Validation
    // if (!year) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Year is required",
    //   });
    // }

    if (!title_en || !title_hi) {
      return res.status(400).json({
        success: false,
        message: "Both English and Hindi titles are required",
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    // File handling
    let file = null;
    if (req.file) {
      file = req.file.filename;
    }

    // Create publication
    const publication = new PublicationsSchema({
      year,

      title: {
        en: title_en,
        hi: title_hi,
      },

      category,

      file,

      isActive: isActive !== undefined ? isActive : true,

      createdBy: req.user.id,
    });

    // Save publication
    const savedPublication = await publication.save();

    return res.status(201).json({
      success: true,
      message: "Publication created successfully",
      data: savedPublication,
    });
  } catch (error) {
    console.error(error);

    // Duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];

      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    // Validation error
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);

      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    // Cast error
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid data format",
      });
    }

    // Server error
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllPublications = async (req, res) => {
  try {
    const publicationsList = await Publications.find()
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdAt: -1 });

    const data = publicationsList.map((pub) => ({
      id: pub._id,
      year: pub.year,
      title: pub.title || { en: "", hi: "" },
      category: pub.category || "",
      file: pub.file || null,
      isActive: pub.isActive,
      createdBy: pub.createdBy || null,
      updatedBy: pub.updatedBy || null,
      createdAt: pub.createdAt,
      updatedAt: pub.updatedAt || null,
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
      message: "Error fetching publications",
    });
  }
};

export const updatePublication = async (req, res) => {
  try {
    const { id } = req.params;
    let { year, title_en, title_hi, category, isActive } = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Publication ID",
      });
    }

    // Check publication exists
    const publication = await PublicationsSchema.findById(id);

    if (!publication) {
      return res.status(404).json({
        success: false,
        message: "Publication not found",
      });
    }

    // Unauthorized check
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    // Trim values (like create API style)
    year = year?.trim();
    title_en = title_en?.trim();
    title_hi = title_hi?.trim();
    category = category?.trim();

    // Update fields only if provided
    if (year !== undefined) {
      publication.year = year;
    }

    if (title_en || title_hi) {
      publication.title = {
        en: title_en || publication.title.en,
        hi: title_hi || publication.title.hi,
      };
    }

    if (category) {
      publication.category = category;
    }

    if (isActive !== undefined) {
      publication.isActive = isActive;
    }

    // File handling
    if (req.file) {
      publication.file = req.file.filename;
    }

    // Updated by
    publication.updatedBy = req.user.id;

    // Save
    const updatedPublication = await publication.save();

    return res.status(200).json({
      success: true,
      message: "Publication updated successfully",
      data: updatedPublication,
    });
  } catch (error) {
    console.error(error);

    // Validation error
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);

      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    // Cast error
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid data format",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updatePublicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user, login karo pehle",
      });
    }

    const updatedPublication = await PublicationsSchema.findByIdAndUpdate(
      id,
      {
        isActive: isActive === "true" || isActive === true,
        updatedBy: req.user.id,
        updatedAt: new Date(),
      },
      { new: true },
    );

    if (!updatedPublication) {
      return res.status(404).json({
        success: false,
        message: "Publication not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Publication status updated successfully",
      data: updatedPublication,
    });
  } catch (error) {
    console.error("Update Publication Status Error =>", error);

    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// this is use for web

export const getAllPublicationsWeb = async (req, res) => {
  try {
    const publicationsList = await PublicationsSchema.find()
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdAt: -1 });

    const data = publicationsList.map((publication) => ({
      id: publication._id,
      year: publication.year || null,

      title: publication.title || {
        en: "",
        hi: "",
      },

      category: publication.category || "",

      file: publication.file ? publication.file : null,

      isActive: publication.isActive ?? true,

      createdBy: publication.createdBy || null,
      updatedBy: publication.updatedBy || null,

      createdAt: publication.createdAt || null,
      updatedAt: publication.updatedAt || null,
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("ERROR =>", error);

    res.status(500).json({
      success: false,
      message: "Error fetching publications",
    });
  }
};

export const getPublicationsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    const publications = await PublicationsSchema.find({
      category: category,
      isActive: true,
    })
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdAt: -1 });

    const data = publications.map((item) => ({
      id: item._id,
      year: item.year || null,

      title: item.title || {
        en: "",
        hi: "",
      },

      category: item.category || "",

      file: item.file || null,

      isActive: item.isActive ?? true,

      createdBy: item.createdBy || null,
      updatedBy: item.updatedBy || null,

      createdAt: item.createdAt || null,
      updatedAt: item.updatedAt || null,
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("ERROR =>", error);

    res.status(500).json({
      success: false,
      message: "Error fetching publications",
    });
  }
};
