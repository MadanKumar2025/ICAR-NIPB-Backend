import Patents from "../models/patentsSchema.js";

export const createPatents = async (req, res) => {
  try {
    const { type_en, type_hi, title_en, title_hi } = req.body;

    // validations
    if (!type_en || !type_hi) {
      return res.status(400).json({
        success: false,
        message: "Type (EN & HI) is required",
      });
    }

    if (!title_en || !title_hi) {
      return res.status(400).json({
        success: false,
        message: "Title (EN & HI) is required",
      });
    }

    const createby = req.user?.id;

    const patent = new Patents({
      type: {
        en: type_en,
        hi: type_hi,
      },
      title: {
        en: title_en,
        hi: title_hi,
      },
      createby,
      createdate: new Date(),
    });

    const savedPatent = await patent.save();

    res.status(201).json({
      success: true,
      message: "Patent created successfully",
      data: savedPatent,
    });
  } catch (error) {
    console.error("Create Patent Error:", error);

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

export const getAllPatents = async (req, res) => {
  try {
    const isAll = req.query.all === "true";

    const pageNumber = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (pageNumber - 1) * limit;

    const filter = {};

    if (req.query.title) {
      filter.$or = [
        { "title.en": { $regex: req.query.title, $options: "i" } },
        { "title.hi": { $regex: req.query.title, $options: "i" } },
      ];
    }

    if (req.query.type) {
      filter.$or = [
        { "type.en": { $regex: req.query.type, $options: "i" } },
        { "type.hi": { $regex: req.query.type, $options: "i" } },
      ];
    }

    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === "true";
    }

    let patentQuery = Patents.find(filter)
      .populate("createby", "username")
      .populate("updateby", "username")
      .sort({ createdate: -1 });

    let patents;
    const totalCount = await Patents.countDocuments(filter);

    if (isAll) {
      patents = await patentQuery;
    } else {
      patents = await patentQuery.skip(skip).limit(limit);
    }

    res.status(200).json({
      success: true,
      count: patents.length,
      total: totalCount,
      page: isAll ? null : pageNumber,
      totalPages: isAll ? 1 : Math.ceil(totalCount / limit),
      data: patents,
    });
  } catch (error) {
    console.error("Get Patents Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePatentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const patent = await Patents.findByIdAndUpdate(
      id,
      {
        isActive: isActive,
        updateby: req.user?.id,
        updatedate: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!patent) {
      return res.status(404).json({
        success: false,
        message: "Patent not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Patent status updated successfully",
      data: patent,
    });
  } catch (error) {
    console.error("Update Patent Status Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePatent = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      type_en,
      type_hi,
      title_en,
      title_hi,
      isActive,
    } = req.body;

    const patent = await Patents.findById(id);

    if (!patent) {
      return res.status(404).json({
        success: false,
        message: "Patent not found",
      });
    }
 
    if (type_en) {
      patent.type.en = type_en;
    }

    if (type_hi) {
      patent.type.hi = type_hi;
    }

    if (title_en) {
      patent.title.en = title_en;
    }

    if (title_hi) {
      patent.title.hi = title_hi;
    }

    if (isActive !== undefined) {
      patent.isActive =
        isActive === "true" || isActive === true;
    }

    patent.updateby = req.user?.id;
    patent.updatedate = new Date();

    const updatedPatent = await patent.save();

    return res.status(200).json({
      success: true,
      message: "Patent updated successfully",
      data: updatedPatent,
    });
  } catch (error) {
    console.error("Update Patent Error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (val) => val.message
      );
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getAllPatentsWeb = async (req, res) => {
  try {
    const patentsList = await Patents.find()
      .populate("createby", "name email")
      .populate("updateby", "name email")
      .sort({ createdate: -1 });

    const data = patentsList.map((patent) => ({
      id: patent._id,
      type: patent.type || { en: "", hi: "" },
      title: patent.title || { en: "", hi: "" },
      isActive: patent.isActive,
      createdBy: patent.createby || null,
      updatedBy: patent.updateby || null,
      createdAt: patent.createdate,
      updatedAt: patent.updatedate || null,
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
      message: "Error fetching patents",
    });
  }
};