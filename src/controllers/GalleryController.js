import Gallery from "../models/GallerySchema.js";
import mongoose from "mongoose";

import fs from "fs";
import path from "path";

export const createGallery = async (req, res) => {
  try {
    let { albumId, title_en, title_hi, type, videoUrl } = req.body;

    albumId = albumId?.trim();
    title_en = title_en?.trim();
    title_hi = title_hi?.trim();
    type = type?.trim();
    videoUrl = videoUrl?.trim();

    // Validate albumId ObjectId
    if (!albumId || !mongoose.Types.ObjectId.isValid(albumId)) {
      return res.status(400).json({
        success: false,
        message: "Valid Album ID is required",
      });
    }

    // Validate titles (at least one required)
    // if (!title_en && !title_hi) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Gallery title in English or Hindi is required",
    //   });
    // }

    // Validate type
    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Gallery type is required",
      });
    }

    // URL validation using built-in URL class for better reliability
    const isValidUrl = (url) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };

    // let photo = null;

    // if (type.toLowerCase() === "photo" || type.toLowerCase() === "Pdf") {
    //   if (!req.file) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "Photo file is required for photo type",
    //     });
    //   }

    //   const allowedTypes = [
    //     "image/jpeg",
    //     "image/png",
    //     "image/jpg",
    //     "image/webp",
    //   ];
    //   if (!allowedTypes.includes(req.file.mimetype)) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "Only image files (jpeg, jpg, png, webp) are allowed",
    //     });
    //   }

    //   photo = req.file.filename;
    // } else if (type.toLowerCase() === "video") {
    //   if (!videoUrl) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "Video URL is required for video type",
    //     });
    //   }

    //   if (!isValidUrl(videoUrl)) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "Invalid video URL format",
    //     });
    //   }
    // } else {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Gallery type must be either 'photo' , 'PDF' or 'video'",
    //   });
    // }

    let photo = null;
    let document = null;
    const t = type?.toLowerCase();

    // ================= PHOTO =================
    if (t === "photo") {
      if (!req.files?.photo?.[0]) {
        return res.status(400).json({
          success: false,
          message: "Photo file is required",
        });
      }

      photo = req.files.photo[0].filename;
    }

    // ================= DOCUMENT =================
    else if (t === "document") {
      if (!req.files?.document?.[0]) {
        return res.status(400).json({
          success: false,
          message: "Document file is required",
        });
      }

      document = req.files.document[0].filename;
    }

    // ================= VIDEO =================
    else if (t === "video") {
      if (!videoUrl || !isValidUrl(videoUrl)) {
        return res.status(400).json({
          success: false,
          message: "Valid video URL is required",
        });
      }
    }

    // ================= INVALID =================
    else {
      return res.status(400).json({
        success: false,
        message: "Type must be photo, document or video",
      });
    }

    const createdBy = req.user?.id || null;

    const title = {};
    if (title_en) title.en = title_en;
    if (title_hi) title.hi = title_hi;

    const gallery = new Gallery({
      albumId,
      title,
      type,
      photo,
      document,
      videoUrl: videoUrl || null,
      createdBy,
    });

    const savedGallery = await gallery.save();

    res.status(201).json({
      success: true,
      message: "Gallery item created successfully",
      data: savedGallery,
    });
  } catch (error) {
    console.error(error);

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

// export const getGallery = async (req, res) => {
//   try {
//     const isAll = req.query.all === "true";

//     const page = parseInt(req.query.page) || 1;
//     const limit = 10;
//     const skip = (page - 1) * limit;

//     let query = Gallery.find().sort({ createdDate: -1 });

//     let galleryItems;
//     const totalGallery = await Gallery.countDocuments();

//     if (isAll) {
//       galleryItems = await query;
//     } else {
//       galleryItems = await query.skip(skip).limit(limit);
//     }

//     res.status(200).json({
//       success: true,
//       count: galleryItems.length,
//       total: totalGallery,
//       page: isAll ? null : page,
//       totalPages: isAll ? 1 : Math.ceil(totalGallery / limit),
//       data: galleryItems,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: error.message || "Internal server error",
//     });
//   }
// };

export const getGallery = async (req, res) => {
  try {
    const isAll = req.query.all === "true";

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const baseQuery = Gallery.find()
      .sort({ createdDate: -1 })
      .populate("albumId", "title")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    const totalGallery = await Gallery.countDocuments();

    const galleryItems = isAll
      ? await baseQuery
      : await baseQuery.skip(skip).limit(limit);

    const data = galleryItems.map((g) => ({
      id: g._id,

      albumId: g.albumId?._id || null,
      albumTitle: g.albumId?.title || { en: "", hi: "" },

      title: g.title || { en: "", hi: "" },
      type: g.type || "",

      photo: g.photo || null,
      document: g.document || null,
      videoUrl: g.videoUrl || null,

      isActive: g.isActive ?? true,

      createdBy: g.createdBy || null,
      updatedBy: g.updatedBy || null,

      createdAt: g.createdDate,
      updatedAt: g.updatedDate || null,
    }));

    return res.status(200).json({
      success: true,
      count: data.length,
      total: totalGallery,
      page: isAll ? null : page,
      totalPages: isAll ? 1 : Math.ceil(totalGallery / limit),
      data,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// export const updateGallery = async (req, res) => {
//   try {
//     let { id } = req.params;
//     let { title_en, title_hi, type, videoUrl, isActive } = req.body;

//     // Trim values
//     // title_en = title_en?.trim();
//     // title_hi = title_hi?.trim();
//     type = type?.trim();
//     videoUrl = videoUrl?.trim();

//     // Validate ID
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Valid Gallery ID is required",
//       });
//     }

//     const gallery = await Gallery.findById(id);
//     if (!gallery) {
//       return res.status(404).json({
//         success: false,
//         message: "Gallery item not found",
//       });
//     }

//     // Validate title (at least one required if updating)
//     // if (title_en === "" && title_hi === "") {
//     //   return res.status(400).json({
//     //     success: false,
//     //     message: "At least one title (English or Hindi) is required",
//     //   });
//     // }

//     // URL validation
//     const isValidUrl = (url) => {
//       try {
//         new URL(url);
//         return true;
//       } catch {
//         return false;
//       }
//     };

//     // Update title object
//     if (title_en || title_hi) {
//       gallery.title = {
//         en: title_en || gallery.title.en,
//         hi: title_hi || gallery.title.hi,
//       };
//     }

//     // Validate & update type
//     if (type) {
//       if (!["photo", "video"].includes(type.toLowerCase())) {
//         return res.status(400).json({
//           success: false,
//           message: "Gallery type must be either 'photo' or 'video'",
//         });
//       }
//       gallery.type = type.toLowerCase();
//     }

//     // Handle PHOTO type
//     if (gallery.type === "photo") {
//       if (req.file) {
//         const allowedTypes = [
//           "image/jpeg",
//           "image/png",
//           "image/jpg",
//           "image/webp",
//         ];

//         if (!allowedTypes.includes(req.file.mimetype)) {
//           return res.status(400).json({
//             success: false,
//             message: "Only image files are allowed",
//           });
//         }

//         // Delete old photo
//         if (gallery.photo) {
//           const oldPath = path.join("uploads", gallery.photo);
//           if (fs.existsSync(oldPath)) {
//             fs.unlinkSync(oldPath);
//           }
//         }

//         gallery.photo = req.file.filename;
//       }

//       // Remove video if switching to photo
//       if (gallery.videoUrl) {
//         gallery.videoUrl = null;
//       }
//     }

//     // Handle VIDEO type
//     if (gallery.type === "video") {
//       if (videoUrl) {
//         if (!isValidUrl(videoUrl)) {
//           return res.status(400).json({
//             success: false,
//             message: "Invalid video URL",
//           });
//         }

//         // Delete old photo if exists
//         if (gallery.photo) {
//           const oldPath = path.join("uploads", gallery.photo);
//           if (fs.existsSync(oldPath)) {
//             fs.unlinkSync(oldPath);
//           }
//           gallery.photo = null;
//         }

//         gallery.videoUrl = videoUrl;
//       } else if (!gallery.videoUrl) {
//         return res.status(400).json({
//           success: false,
//           message: "Video URL is required for video type",
//         });
//       }
//     }

//     // isActive handling
//     if (isActive !== undefined) {
//       gallery.isActive = isActive === "true" || isActive === true;
//     }

//     gallery.updatedBy = req.user?.id || null;
//     gallery.updatedDate = Date.now();

//     const updatedGallery = await gallery.save();

//     res.status(200).json({
//       success: true,
//       message: "Gallery updated successfully",
//       data: updatedGallery,
//     });
//   } catch (error) {
//     console.error(error);

//     if (error.name === "ValidationError") {
//       const messages = Object.values(error.errors).map((val) => val.message);
//       return res.status(400).json({
//         success: false,
//         message: messages.join(", "),
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

export const updateGallery = async (req, res) => {
  try {
    const { id } = req.params;

    let { title_en, title_hi, type, videoUrl, isActive } = req.body;

    type = type?.trim()?.toLowerCase();
    videoUrl = videoUrl?.trim();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid Gallery ID is required",
      });
    }

    const gallery = await Gallery.findById(id);
    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found",
      });
    }

    const isValidUrl = (url) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };

    // ================= TITLE =================
    if (title_en || title_hi) {
      gallery.title = {
        en: title_en || gallery.title?.en,
        hi: title_hi || gallery.title?.hi,
      };
    }

    // ================= TYPE =================
    if (type) {
      if (!["photo", "video", "document"].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Type must be photo, video, or document",
        });
      }
      gallery.type = type;
    }

    // ================= PHOTO =================
    if (gallery.type === "photo") {
      if (req.files?.photo?.[0]) {
        const file = req.files.photo[0];

        // delete old file
        if (gallery.photo) {
          const oldPath = path.join("uploads", gallery.photo);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        gallery.photo = file.filename;
        gallery.videoUrl = null;
        gallery.document = null;
      }
    }

    // ================= DOCUMENT =================
    if (gallery.type === "document") {
      if (req.files?.document?.[0]) {
        const file = req.files.document[0];

        // delete old file
        if (gallery.document) {
          const oldPath = path.join("uploads", gallery.document);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        gallery.document = file.filename;
        gallery.photo = null;
        gallery.videoUrl = null;
      }
    }

    // ================= VIDEO =================
    if (gallery.type === "video") {
      if (videoUrl) {
        if (!isValidUrl(videoUrl)) {
          return res.status(400).json({
            success: false,
            message: "Invalid video URL",
          });
        }

        // cleanup files
        if (gallery.photo) {
          const oldPath = path.join("uploads", gallery.photo);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          gallery.photo = null;
        }

        if (gallery.document) {
          const oldPath = path.join("uploads", gallery.document);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          gallery.document = null;
        }

        gallery.videoUrl = videoUrl;
      }
    }

    // ================= ACTIVE STATUS =================
    if (isActive !== undefined) {
      gallery.isActive = isActive === "true" || isActive === true;
    }

    gallery.updatedBy = req.user?.id || null;
    gallery.updatedDate = new Date();

    const updated = await gallery.save();

    return res.status(200).json({
      success: true,
      message: "Gallery updated successfully",
      data: updated,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// export const getGalleryByAlbumId = async (req, res) => {
//   try {
//     const { albumId } = req.params;

//     const galleryItems = await Gallery.find({ albumId })
//       .populate("albumId", "title")
//       .populate("createdBy", "name email")
//       .populate("updatedBy", "name email")
//       .sort({ createdDate: -1 });

//     const formattedData = galleryItems.map((gallery) => ({
//       id: gallery._id,
//       albumId: gallery.albumId?._id || null,
//       albumTitle: gallery.albumId?.title || { en: "", hi: "" },
//       title: gallery.title || { en: "", hi: "" },
//       type: gallery.type || "",
//       photo: gallery.photo || null,
//       videoUrl: gallery.videoUrl || null,
//       isActive: gallery.isActive,
//       createdBy: gallery.createdBy || null,
//       updatedBy: gallery.updatedBy || null,
//       createdAt: gallery.createdDate,
//       updatedAt: gallery.updatedDate || null,
//     }));

//     res.status(200).json({
//       success: true,
//       count: formattedData.length,
//       data: formattedData,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

export const getGalleryByAlbumId = async (req, res) => {
  try {
    const { albumId } = req.params;

  
    if (!mongoose.Types.ObjectId.isValid(albumId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid albumId",
      });
    }

    const galleryItems = await Gallery.find({ albumId })
      .sort({ createdDate: -1 })
      .populate("albumId", "title")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .lean();  

    const formattedData = galleryItems.map((g) => ({
      id: g._id,

      albumId: g.albumId?._id || null,
      albumTitle: g.albumId?.title || { en: "", hi: "" },

      title: g.title || { en: "", hi: "" },
      type: g.type || "",

      photo: g.photo || null,
      document: g.document || null, 
      videoUrl: g.videoUrl || null,

      isActive: g.isActive ?? true,

      createdBy: g.createdBy || null,
      updatedBy: g.updatedBy || null,

      createdAt: g.createdDate,
      updatedAt: g.updatedDate || null,
    }));

    return res.status(200).json({
      success: true,
      count: formattedData.length,
      data: formattedData,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const updateGalleryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: "isActive value is required",
      });
    }

    const gallery = await Gallery.findByIdAndUpdate(
      id,
      {
        isActive: isActive === "true" || isActive === true,
        updatedBy: req.user?.id,
        updatedDate: new Date(),
      },
      { new: true },
    );

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Gallery status updated successfully",
      data: gallery,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// this is use for web
// export const getAllGalleryWeb = async (req, res) => {
//   try {
//     const galleryList = await Gallery.find()
//       .populate("albumId", "title")
//       .populate("createdBy", "name email")
//       .populate("updatedBy", "name email")
//       .sort({ createdDate: -1 });

//     const data = galleryList.map((gallery) => ({
//       id: gallery._id,
//       albumId: gallery.albumId?._id || null,
//       albumTitle: gallery.albumId?.title || { en: "", hi: "" },

//       title: gallery.title || { en: "", hi: "" },
//       type: gallery.type || "",
//       photo: gallery.photo || null,
//       videoUrl: gallery.videoUrl || null,
//       isActive: gallery.isActive,

//       createdBy: gallery.createdBy || null,
//       updatedBy: gallery.updatedBy || null,
//       createdAt: gallery.createdDate,
//       updatedAt: gallery.updatedDate || null,
//     }));

//     res.status(200).json({
//       success: true,
//       count: data.length,
//       data,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching gallery data",
//     });
//   }
// };

export const getAllGalleryWeb = async (req, res) => {
  try {
    const isAll = req.query.all === "true";

    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const query = Gallery.find()
      .populate("albumId", "title")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdDate: -1 });

    const total = await Gallery.countDocuments();

    const galleryList = isAll
      ? await query
      : await query.skip(skip).limit(limit);

    const data = galleryList.map((gallery) => ({
      id: gallery._id,
      albumId: gallery.albumId?._id || null,

      albumTitle: {
        en: gallery.albumId?.title?.en || "",
        hi: gallery.albumId?.title?.hi || "",
      },

      title: {
        en: gallery.title?.en || "",
        hi: gallery.title?.hi || "",
      },

      type: gallery.type || "",
      photo: gallery.photo || null,
      document: gallery.document || null,
      videoUrl: gallery.videoUrl || null,

      isActive: gallery.isActive ?? true,

      createdBy: gallery.createdBy || null,
      updatedBy: gallery.updatedBy || null,

      createdAt: gallery.createdDate,
      updatedAt: gallery.updatedDate || null,
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      total,
      page: isAll ? null : page,
      totalPages: isAll ? 1 : Math.ceil(total / limit),
      data,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching gallery data",
    });
  }
};
// this is use for web
 
// export const getGalleryByAlbumIdWeb = async (req, res) => {
//   try {
//     const { albumId } = req.params;

//     const isAll = req.query.all === "true";
//     const page = parseInt(req.query.page) || 1;
//     const limit = 1000;
//     const skip = (page - 1) * limit;

//     let query = Gallery.find({ albumId })
//       .populate("albumId", "title")
//       .populate("createdBy", "name email")
//       .populate("updatedBy", "name email")
//       .sort({ createdDate: -1 });

//     let galleryItems;
//     const totalGallery = await Gallery.countDocuments({ albumId });

//     if (isAll) {
//       galleryItems = await query;
//     } else {
//       galleryItems = await query.skip(skip).limit(limit);
//     }

//     const formattedData = galleryItems.map((gallery) => ({
//       id: gallery._id,

//       albumId: gallery.albumId?._id || null,
//       albumTitle: gallery.albumId?.title || { en: "", hi: "" },

//       title: gallery.title || { en: "", hi: "" },
//       type: gallery.type || "",
//       photo: gallery.photo || null,
//       videoUrl: gallery.videoUrl || null,
//       isActive: gallery.isActive,

//       createdBy: gallery.createdBy || null,
//       updatedBy: gallery.updatedBy || null,

//       createdAt: gallery.createdDate,
//       updatedAt: gallery.updatedDate || null,
//     }));

//     res.status(200).json({
//       success: true,
//       count: formattedData.length,
//       total: totalGallery,
//       page: isAll ? null : page,
//       totalPages: isAll ? 1 : Math.ceil(totalGallery / limit),
//       data: formattedData,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: error.message || "Internal server error",
//     });
//   }
// };

export const getGalleryByAlbumIdWeb = async (req, res) => {
  try {
    const { albumId } = req.params;

    if (!albumId || !mongoose.Types.ObjectId.isValid(albumId)) {
      return res.status(400).json({
        success: false,
        message: "Valid albumId is required",
      });
    }

    const isAll = req.query.all === "true";
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const baseQuery = Gallery.find({ albumId })
      .populate("albumId", "title")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdDate: -1 });

    const [totalGallery, galleryItems] = await Promise.all([
      Gallery.countDocuments({ albumId }),
      isAll ? baseQuery : baseQuery.skip(skip).limit(limit),
    ]);

    const formattedData = galleryItems.map((gallery) => ({
      id: gallery._id,

      albumId: gallery.albumId?._id || null,
      albumTitle: {
        en: gallery.albumId?.title?.en || "",
        hi: gallery.albumId?.title?.hi || "",
      },

      title: {
        en: gallery.title?.en || "",
        hi: gallery.title?.hi || "",
      },

      type: gallery.type || "",
      photo: gallery.photo || null,
      document: gallery.document || null,
      videoUrl: gallery.videoUrl || null,

      isActive: gallery.isActive ?? true,

      createdBy: gallery.createdBy || null,
      updatedBy: gallery.updatedBy || null,

      createdAt: gallery.createdDate,
      updatedAt: gallery.updatedDate || null,
    }));

    res.status(200).json({
      success: true,
      count: formattedData.length,
      total: totalGallery,
      page: isAll ? null : page,
      totalPages: isAll ? 1 : Math.ceil(totalGallery / limit),
      data: formattedData,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};