import CollaborationsDetails from "../models/CollaborationsDetailsSchema.js";
import mongoose from "mongoose";

export const createCollaborationsDetails = async (req, res) => {
  try {
    const { CollaborationsId, subTitle_en, subTitle_hi, link, isActive } =
      req.body || {};

    const cleanEn = subTitle_en?.trim();
    const cleanHi = subTitle_hi?.trim();
    const cleanLink = link?.trim() || "";

    // Validation
    if (!CollaborationsId) {
      return res.status(400).json({
        success: false,
        message: "CollaborationsId is required",
      });
    }

    if (!cleanEn) {
      return res.status(400).json({
        success: false,
        message: "Subtitle (English) is required",
      });
    }

    if (!cleanHi) {
      return res.status(400).json({
        success: false,
        message: "Subtitle (Hindi) is required",
      });
    }

    const collaborationDetails = new CollaborationsDetails({
      CollaborationsId,
      subTitle: {
        en: cleanEn,
        hi: cleanHi,
      },
      link: cleanLink,
      isActive: typeof isActive === "boolean" ? isActive : true,
      createdBy: req.user?.id || null,
    });

    const saved = await collaborationDetails.save();

    return res.status(201).json({
      success: true,
      message: "Collaboration details created successfully",
      data: saved,
    });
  } catch (err) {
    console.error("Create CollaborationDetails Error =>", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Server Error",
    });
  }
};

export const getCollaborationsDetails = async (req, res) => {
  try {
    const { CollaborationsId } = req.params;

    if (!CollaborationsId) {
      return res.status(400).json({
        success: false,
        message: "CollaborationsId is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(CollaborationsId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid CollaborationsId",
      });
    }

    const data = await CollaborationsDetails.find({
      CollaborationsId: new mongoose.Types.ObjectId(CollaborationsId),
    })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .populate("CollaborationsId", "title");

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCollaborationsDetailsStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const record = await CollaborationsDetails.findByIdAndUpdate(
      id,
      {
        $set: {
          isActive: isActive === "true" || isActive === true,
          updatedBy: req.user?.id || null,
          updatedAt: new Date(),
        },
      },
      { new: true },
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Status updated",
      data: record,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCollaborationsDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const { CollaborationsId, subTitle_en, subTitle_hi, link, isActive } =
      req.body || {};

    const record = await CollaborationsDetails.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "CollaborationsDetails not found",
      });
    }

    // ---------------- CollaborationsId ----------------
    if (CollaborationsId !== undefined) {
      record.CollaborationsId = CollaborationsId;
    }

    // ---------------- SUBTITLE ----------------
    if (subTitle_en !== undefined || subTitle_hi !== undefined) {
      const current = record.subTitle || {};

      const newEn =
        typeof subTitle_en === "string" ? subTitle_en.trim() : current.en;

      const newHi =
        typeof subTitle_hi === "string" ? subTitle_hi.trim() : current.hi;

      if (!newEn) {
        return res.status(400).json({
          success: false,
          message: "English subtitle is required",
        });
      }

      if (!newHi) {
        return res.status(400).json({
          success: false,
          message: "Hindi subtitle is required",
        });
      }

      record.subTitle = {
        en: newEn,
        hi: newHi,
      };
    }

    // ---------------- LINK ----------------
    if (link !== undefined) {
      record.link = link?.trim();
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
      message: "CollaborationsDetails updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update CollaborationsDetails Error:", error);

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



// this is use for web
export const getCollaborationDetailsByCollabId = async (req, res) => {
  try {
    const { collaborationId } = req.params; 

    if (!collaborationId) {
      return res.status(400).json({
        success: false,
        message: "Collaboration ID is required",
      });
    }

    const detailsList = await CollaborationsDetails.find({
      CollaborationsId: collaborationId,
    })
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdAt: -1 });

    const data = detailsList.map((detail) => ({
      id: detail._id,
      subTitle: detail.subTitle || { en: "", hi: "" },
      link: detail.link || "",
      isActive: detail.isActive,
      createdBy: detail.createdBy || null,
      updatedBy: detail.updatedBy || null,
      createdAt: detail.createdAt,
      updatedAt: detail.updatedAt || null,
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
      message: "Error fetching collaboration details",
    });
  }
};


export const getAllCollaborationDetailsWeb = async (req, res) => {
  try {
    const detailsList = await CollaborationsDetails.find()
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdAt: -1 });

    const data = detailsList.map((detail) => ({
      id: detail._id,
      CollaborationsId: detail.CollaborationsId || null,
      subTitle: detail.subTitle || { en: "", hi: "" },
      link: detail.link || "",
      isActive: detail.isActive,
      createdBy: detail.createdBy || null,
      updatedBy: detail.updatedBy || null,
      createdAt: detail.createdAt,
      updatedAt: detail.updatedAt || null,
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
      message: "Error fetching collaboration details",
    });
  }
};