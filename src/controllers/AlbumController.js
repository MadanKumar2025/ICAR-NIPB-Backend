import Album from "../models/AlbumSchema.js";
import fs from "fs";
import path from "path";

export const createAlbum = async (req, res) => {
  try {
    let {
      type_en,
      type_hi,
      title_en,
      title_hi,
      venue_en,
      venue_hi,
      publishDate,
      expiryDate,
    } = req.body;

    type_en = type_en?.trim();
    type_hi = type_hi?.trim();
    title_en = title_en?.trim();
    title_hi = title_hi?.trim();
    venue_en = venue_en?.trim();
    venue_hi = venue_hi?.trim();

    if (!type_en) {
      return res.status(400).json({
        success: false,
        message: "Album type (English) is required",
      });
    }
    if (!type_hi) {
      return res.status(400).json({
        success: false,
        message: "Album type (Hindi) is required",
      });
    }
    if (!title_en) {
      return res.status(400).json({
        success: false,
        message: "Album title (English) is required",
      });
    }
    if (!title_hi) {
      return res.status(400).json({
        success: false,
        message: "Album title (Hindi) is required",
      });
    }

    if (!publishDate) {
      return res.status(400).json({
        success: false,
        message: "Publish date is required",
      });
    }

    const pubDate = new Date(publishDate);
    if (isNaN(pubDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid publish date format",
      });
    }

    let expDate = null;
    if (expiryDate) {
      expDate = new Date(expiryDate);

      if (isNaN(expDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid expiry date format",
        });
      }

      if (expDate < pubDate) {
        return res.status(400).json({
          success: false,
          message: "Expiry date must be after publish date",
        });
      }
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Cover image is required",
      });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Only image files (jpeg, png, jpg, webp) are allowed",
      });
    }

    const coverPic = req.file.filename;

    const createdBy = req.user?.id || null;

    const album = new Album({
      type: { en: type_en, hi: type_hi || "" },
      title: { en: title_en, hi: title_hi || "" },
      venue: { en: venue_en || "", hi: venue_hi || "" },
      publishDate: pubDate,
      expiryDate: expDate,
      coverPic,
      createdBy,
    });

    const savedAlbum = await album.save();

    res.status(201).json({
      success: true,
      message: "Album created successfully",
      data: savedAlbum,
    });
  } catch (error) {
    console.error(error);

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
      message: "Internal server error",
    });
  }
};

export const getAlbums = async (req, res) => {
  try {
    const isAll = req.query.all === "true";

    // Pagination setup
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Base query
    const query = Album.find().sort({ createdDate: -1 });

    let albums;
    let totalAlbums;

    if (isAll) {
      // Fetch all albums
      albums = await query;
      totalAlbums = albums.length;
    } else {
      // Count total albums for pagination
      totalAlbums = await Album.countDocuments();
      // Fetch paginated albums
      albums = await query.skip(skip).limit(limit);
    }

    res.status(200).json({
      success: true,
      count: albums.length,
      total: totalAlbums,
      page: isAll ? null : page,
      totalPages: isAll ? 1 : Math.ceil(totalAlbums / limit),
      data: albums,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      type_en,
      type_hi,
      title_en,
      title_hi,
      venue_en,
      venue_hi,
      publishDate,
      expiryDate,
      isActive,
    } = req.body;

    // Find the album
    const album = await Album.findById(id);
    if (!album) {
      return res.status(404).json({
        success: false,
        message: "Album not found",
      });
    }

    // Trim all string fields
    const trimmedTypeEn = type_en?.trim();
    const trimmedTypeHi = type_hi?.trim();
    const trimmedTitleEn = title_en?.trim();
    const trimmedTitleHi = title_hi?.trim();
    const trimmedVenueEn = venue_en?.trim();
    const trimmedVenueHi = venue_hi?.trim();

    // Validate required fields
    if (trimmedTypeEn === "" || trimmedTypeHi === "") {
      return res.status(400).json({
        success: false,
        message: "Album type in both languages cannot be empty",
      });
    }
    if (trimmedTitleEn === "" || trimmedTitleHi === "") {
      return res.status(400).json({
        success: false,
        message: "Album title in both languages cannot be empty",
      });
    }
    if (
      (venue_en && trimmedVenueEn === "") ||
      (venue_hi && trimmedVenueHi === "")
    ) {
      return res.status(400).json({
        success: false,
        message: "Venue in both languages cannot be empty",
      });
    }

    // Update multilingual fields
    album.type = {
      en: trimmedTypeEn || album.type?.en,
      hi: trimmedTypeHi || album.type?.hi,
    };
    album.title = {
      en: trimmedTitleEn || album.title?.en,
      hi: trimmedTitleHi || album.title?.hi,
    };
    if (trimmedVenueEn || trimmedVenueHi) {
      album.venue = {
        en: trimmedVenueEn || album.venue?.en,
        hi: trimmedVenueHi || album.venue?.hi,
      };
    }

    // Update dates
    if (publishDate) {
      const pubDate = new Date(publishDate);
      if (isNaN(pubDate.getTime())) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid publish date" });
      }
      album.publishDate = pubDate;
    }

    if (expiryDate) {
      const expDate = new Date(expiryDate);
      if (isNaN(expDate.getTime())) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid expiry date" });
      }
      if (album.publishDate && expDate < album.publishDate) {
        return res.status(400).json({
          success: false,
          message: "Expiry date must be after publish date",
        });
      }
      album.expiryDate = expDate;
    }

    // Update isActive if provided
    if (isActive !== undefined) {
      album.isActive = isActive === "true" || isActive === true;
    }

    // Update cover image
    if (req.file) {
      if (album.coverPic) {
        const oldImagePath = path.join("uploads", album.coverPic);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      album.coverPic = req.file.filename;
    }

    // Update metadata
    album.updatedBy = req.user?.id;
    album.updatedDate = Date.now();

    // Save updated album
    const updatedAlbum = await album.save();

    res.status(200).json({
      success: true,
      message: "Album updated successfully",
      data: updatedAlbum,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateAlbumStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: "isActive value is required",
      });
    }

    const album = await Album.findByIdAndUpdate(
      id,
      {
        isActive: isActive === "true" || isActive === true,
        updatedBy: req.user?.id,
        updatedDate: new Date(),
      },
      { new: true },
    );

    if (!album) {
      return res.status(404).json({
        success: false,
        message: "Album not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Album status updated successfully",
      data: album,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// this is use for web

export const getAllAlbumWeb = async (req, res) => {
  try {
    // Fetch all albums with creator/updater info
    const albumList = await Album.find()
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdDate: -1 });

    // Map albums into clean response format
    const data = albumList.map((album) => ({
      id: album._id,
      type: album.type || { en: "", hi: "" },
      title: album.title || { en: "", hi: "" },
      venue: album.venue || { en: "", hi: "" },
      publishDate: album.publishDate || null,
      expiryDate: album.expiryDate || null,
      coverPic: album.coverPic || null,
      isActive: album.isActive ?? true,
      createdBy: album.createdBy || null,
      updatedBy: album.updatedBy || null,
      createdAt: album.createdDate || null,
      updatedAt: album.updatedDate || null,
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
      message: "Error fetching album data",
    });
  }
};

export const getAllAlbumByTypeWeb = async (req, res) => {
  try {
    const { type } = req.params;

    const filter = {};

    if (type) {
      filter["type.en"] = type; 
    }

    const albumList = await Album.find(filter)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdDate: -1 });

    const data = albumList.map((album) => ({
      id: album._id,
      type: album.type || { en: "", hi: "" },
      title: album.title || { en: "", hi: "" },
      venue: album.venue || { en: "", hi: "" },
      publishDate: album.publishDate || null,
      expiryDate: album.expiryDate || null,
      coverPic: album.coverPic || null,
      isActive: album.isActive ?? true,
      createdBy: album.createdBy || null,
      updatedBy: album.updatedBy || null,
      createdAt: album.createdDate || null,
      updatedAt: album.updatedDate || null,
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
      message: "Error fetching album data",
    });
  }
};

export const getAlbumByIdWeb = async (req, res) => {
  try {
    const { id } = req.params;

    const album = await Album.findById(id)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!album) {
      return res.status(404).json({
        success: false,
        message: "Album not found",
      });
    }

    const data = {
      id: album._id,
      type: album.type || { en: "", hi: "" },
      title: album.title || { en: "", hi: "" },
      venue: album.venue || { en: "", hi: "" },
      coverPic: album.coverPic || null,
      isActive: album.isActive ?? true,
      publishDate: album.publishDate || null,
      expiryDate: album.expiryDate || null,
      createdBy: album.createdBy || null,
      updatedBy: album.updatedBy || null,
      createdDate: album.createdDate || null,
      updatedDate: album.updatedDate || null,
    };

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching album",
    });
  }
};
