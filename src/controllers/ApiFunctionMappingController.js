import ApiFunctionMapping from "../models/ApiFunctionMappingSchema.js";

export const createApiFunctionMapping = async (req, res) => {
  try {
    const { functionalityName, apiName } = req.body;

    if (
      !functionalityName ||
      !apiName ||
      functionalityName.trim() === "" ||
      apiName.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Functionality name and API name are required",
      });
    }

    const createdBy = req.user?.id;

    const newMapping = new ApiFunctionMapping({
      functionalityName: functionalityName.trim(),
      apiName: apiName.trim(),
      createdBy,
      isActive: true,
    });

    const saved = await newMapping.save();

    return res.status(201).json({
      success: true,
      message: "API Function Mapping created successfully",
      data: saved,
    });
  } catch (error) {
    console.error("Create API Function Mapping Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// export const getAllApiFunctionMappings = async (req, res) => {
//   try {
//     const isAll = req.query.all === "true";

//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const filter = {};

//     // search functionality
//     if (req.query.search) {
//       filter.$or = [
//         { functionalityName: { $regex: req.query.search, $options: "i" } },
//         { apiName: { $regex: req.query.search, $options: "i" } },
//       ];
//     }

//     // active filter
//     if (req.query.isActive !== undefined) {
//       filter.isActive = req.query.isActive === "true";
//     }

//     let query = ApiFunctionMapping.find(filter)
//       .populate("createdBy", "username email")
//       .populate("updatedBy", "username email")
//       .sort({ createdAt: -1 });

//     const total = await ApiFunctionMapping.countDocuments(filter);

//     let data;

//     if (isAll) {
//       data = await query;
//     } else {
//       data = await query.skip(skip).limit(limit);
//     }

//     return res.status(200).json({
//       success: true,
//       count: data.length,
//       total,
//       page: isAll ? null : page,
//       limit: isAll ? null : limit,
//       totalPages: isAll ? 1 : Math.ceil(total / limit),
//       data,
//     });
//   } catch (error) {
//     console.error("Get API Function Mapping Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Server Error",
//     });
//   }
// };


export const getAllApiFunctionMappings = async (req, res) => {
  try {
    const mappings = await ApiFunctionMapping.find()
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdAt: -1 });

    const data = mappings.map((item) => ({
      id: item._id,
      functionalityName: item.functionalityName,
      apiName: item.apiName,
      isActive: item.isActive,
      createdBy: item.createdBy || null,
      updatedBy: item.updatedBy || null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt || null,
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
      message: "Error fetching API function mappings",
    });
  }
};