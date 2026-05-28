import TechnologiesDeveloped from "../models/TechnologiesDevelopedSchema.js";

export const createTechnologiesDeveloped = async (req, res) => {
  try {
    const {
      nameOfOtherParty_en,
      nameOfOtherParty_hi,
      collaboratingInstituteICAR_en,
      collaboratingInstituteICAR_hi,
      nameOfTechnology_en,
      nameOfTechnology_hi,
      mouDate,
      duration,
    } = req.body;

    if (
      !nameOfOtherParty_en ||
      !nameOfOtherParty_hi ||
      !collaboratingInstituteICAR_en ||
      !collaboratingInstituteICAR_hi ||
      !nameOfTechnology_en ||
      !nameOfTechnology_hi ||
      !mouDate
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const tech = new TechnologiesDeveloped({
      nameOfOtherParty: {
        en: nameOfOtherParty_en,
        hi: nameOfOtherParty_hi,
      },
      collaboratingInstituteICAR: {
        en: collaboratingInstituteICAR_en,
        hi: collaboratingInstituteICAR_hi,
      },
      nameOfTechnology: {
        en: nameOfTechnology_en,
        hi: nameOfTechnology_hi,
      },
      mouDate,
      duration,
      createdBy: req.user.id,
    });

    const savedTech = await tech.save();

    return res.status(201).json({
      success: true,
      message: "Technology Developed record created successfully",
      data: savedTech,
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

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const getTechnologiesDeveloped = async (req, res) => {
  try {
    const isAll = req.query.all === "true";

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    let query = TechnologiesDeveloped.find();

    const totalRecords = await TechnologiesDeveloped.countDocuments();

    let records;
    if (isAll) {
      records = await query;
    } else {
      records = await query.skip(skip).limit(limit);
    }

    res.status(200).json({
      success: true,
      count: records.length,
      total: totalRecords,
      page: isAll ? null : page,
      totalPages: isAll ? 1 : Math.ceil(totalRecords / limit),
      data: records,
    });
  } catch (error) {
    console.error("ERROR =>", error);

    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};


export const updateTechnologiesDeveloped = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      nameOfOtherParty_en,
      nameOfOtherParty_hi,
      collaboratingInstituteICAR_en,
      collaboratingInstituteICAR_hi,
      nameOfTechnology_en,
      nameOfTechnology_hi,
      mouDate,
      duration,
      isActive,
    } = req.body;

    const record = await TechnologiesDeveloped.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    if (nameOfOtherParty_en !== undefined || nameOfOtherParty_hi !== undefined) {
      if (
        (!nameOfOtherParty_en || nameOfOtherParty_en.trim() === "") &&
        (!nameOfOtherParty_hi || nameOfOtherParty_hi.trim() === "")
      ) {
        return res.status(400).json({
          success: false,
          message: "Name of Other Party cannot be empty",
        });
      }
      record.nameOfOtherParty = {
        en: nameOfOtherParty_en ?? record.nameOfOtherParty.en,
        hi: nameOfOtherParty_hi ?? record.nameOfOtherParty.hi,
      };
    }

    if (
      collaboratingInstituteICAR_en !== undefined ||
      collaboratingInstituteICAR_hi !== undefined
    ) {
      if (
        (!collaboratingInstituteICAR_en ||
          collaboratingInstituteICAR_en.trim() === "") &&
        (!collaboratingInstituteICAR_hi ||
          collaboratingInstituteICAR_hi.trim() === "")
      ) {
        return res.status(400).json({
          success: false,
          message: "Collaborating Institute cannot be empty",
        });
      }
      record.collaboratingInstituteICAR = {
        en:
          collaboratingInstituteICAR_en ??
          record.collaboratingInstituteICAR.en,
        hi:
          collaboratingInstituteICAR_hi ??
          record.collaboratingInstituteICAR.hi,
      };
    }

    if (nameOfTechnology_en !== undefined || nameOfTechnology_hi !== undefined) {
      if (
        (!nameOfTechnology_en || nameOfTechnology_en.trim() === "") &&
        (!nameOfTechnology_hi || nameOfTechnology_hi.trim() === "")
      ) {
        return res.status(400).json({
          success: false,
          message: "Technology name cannot be empty",
        });
      }
      record.nameOfTechnology = {
        en: nameOfTechnology_en ?? record.nameOfTechnology.en,
        hi: nameOfTechnology_hi ?? record.nameOfTechnology.hi,
      };
    }

    if (mouDate !== undefined) {
      record.mouDate = mouDate;
    }

    if (duration !== undefined) {
      record.duration = duration;
    }

   
    if (isActive !== undefined) {
      record.isActive = isActive === "true" || isActive === true;
    }

    record.updatedBy = req.user?.id;
    record.updatedDate = Date.now();

    const updatedRecord = await record.save();

    return res.status(200).json({
      success: true,
      message: "Technology Developed record updated successfully",
      data: updatedRecord,
    });
  } catch (error) {
    console.error("Update Technology Error =>", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const updateTechnologiesDevelopedStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const record = await TechnologiesDeveloped.findByIdAndUpdate(
      id,
      {
        isActive: isActive === "true" || isActive === true,
        updatedBy: req.user?.id,
        updatedDate: new Date(),
      },
      { new: true }
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Technology Developed status updated successfully",
      data: record,
    });
  } catch (error) {
    console.error("Update Technology Status Error =>", error);

    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};


// this is use for web
export const getAllTechnologiesWeb = async (req, res) => {
  try {
    const techList = await TechnologiesDeveloped.find()
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdDate: -1 });

    const data = techList.map((tech) => ({
      id: tech._id,
      nameOfOtherParty: tech.nameOfOtherParty || { en: "", hi: "" },
      collaboratingInstituteICAR: tech.collaboratingInstituteICAR || { en: "", hi: "" },
      nameOfTechnology: tech.nameOfTechnology || { en: "", hi: "" },
      mouDate: tech.mouDate || null,
      duration: tech.duration || "",
      isActive: tech.isActive,
      createdBy: tech.createdBy || null,
      updatedBy: tech.updatedBy || null,
      createdDate: tech.createdDate,
      updatedDate: tech.updatedDate || null,
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
      message: "Error fetching technologies developed",
    });
  }
};