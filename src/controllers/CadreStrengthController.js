import CadreStrength from "../models/cadreStrengthSchema.js";

export const createCadreStrength = async (req, res) => {
  try {
    const {
      staff_en,
      staff_hi,
      sanctionedStrength,
      filled,
      vacant,
      isActive = true,
    } = req.body;

    if (!staff_en?.trim() || !staff_hi?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Staff name (EN & HI) is required",
      });
    }

    const newCadre = await CadreStrength.create({
      staff: {
        en: staff_en.trim(),
        hi: staff_hi.trim(),
      },
      sanctionedStrength,
      filled,
      vacant,
      isActive,
      createby: req.user?.id,
    });

    return res.status(201).json({
      success: true,
      message: "Cadre Strength created successfully",
      data: newCadre,
    });

  } catch (error) {
    console.error("Create CadreStrength Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate entry found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllCadreStrength = async (req, res) => {
  try {
    const isAll = req.query.all === "true";

    const pageNumber = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (pageNumber - 1) * limit;

    const filter = {};

    if (req.query.staff) {
      filter.$or = [
        { "staff.en": { $regex: req.query.staff, $options: "i" } },
        { "staff.hi": { $regex: req.query.staff, $options: "i" } },
      ];
    }

    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === "true";
    }

    let query = CadreStrength.find(filter)
      .populate("createby", "username")
      .populate("updateby", "username")
      .sort({ createdate: -1 });

    let data;
    const totalCount = await CadreStrength.countDocuments(filter);

    if (isAll) {
      data = await query;
    } else {
      data = await query.skip(skip).limit(limit);
    }

    res.status(200).json({
      success: true,
      count: data.length,
      total: totalCount,
      page: isAll ? null : pageNumber,
      totalPages: isAll ? 1 : Math.ceil(totalCount / limit),
      data,
    });
  } catch (error) {
    console.error("Get CadreStrength Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCadreStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const cadre = await CadreStrength.findByIdAndUpdate(
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

    if (!cadre) {
      return res.status(404).json({
        success: false,
        message: "CadreStrength not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cadre status updated successfully",
      data: cadre,
    });
  } catch (error) {
    console.error("Update Cadre Status Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCadreStrength = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      staff_en,
      staff_hi,
      sanctionedStrength,
      filled,
      vacant,
      isActive,
    } = req.body;

    const cadre = await CadreStrength.findById(id);

    if (!cadre) {
      return res.status(404).json({
        success: false,
        message: "CadreStrength not found",
      });
    }

    if (staff_en) cadre.staff.en = staff_en.trim();
    if (staff_hi) cadre.staff.hi = staff_hi.trim();

    if (sanctionedStrength !== undefined) {
      cadre.sanctionedStrength = Number(sanctionedStrength);
    }

    if (filled !== undefined) {
      cadre.filled = Number(filled);
    }

    if (vacant !== undefined) {
      cadre.vacant = Number(vacant);
    }

    if (isActive !== undefined) {
      cadre.isActive = isActive === true || isActive === "true";
    }

    cadre.updateby = req.user?.id;
    cadre.updatedate = new Date();

    const updatedCadre = await cadre.save();

    return res.status(200).json({
      success: true,
      message: "CadreStrength updated successfully",
      data: updatedCadre,
    });

  } catch (error) {
    console.error("Update CadreStrength Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate field value detected",
        error: error.keyValue,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// this is use for web
export const getAllCadreStrengthWeb = async (req, res) => {
  try {
    const cadreList = await CadreStrength.find()
      .populate("createby", "name email")
      .populate("updateby", "name email")
      .sort({ createdate: -1 });

    const data = cadreList.map((item) => ({
      id: item._id,
      staff: item.staff || { en: "", hi: "" },
      sanctionedStrength: item.sanctionedStrength,
      filled: item.filled,
      vacant: item.vacant,
      isActive: item.isActive,
      createdate: item.createdate,
      updatedate: item.updatedate || null,
      createby: item.createby || null,
      updateby: item.updateby || null,
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
      message: "Error fetching cadre strength",
    });
  }
};