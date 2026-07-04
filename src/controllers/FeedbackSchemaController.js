import Feedback from "../models/FeedbackSchema.js";

export const createFeedback = async (req, res) => {
  try {
    const { name, message } = req.body || {};

    const cleanName = name?.trim();
    const cleanMessage = message?.trim();

    // Validation
    if (!cleanName) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!cleanMessage) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // Create feedback (ONLY schema fields)
    const feedback = new Feedback({
      name: cleanName,
      message: cleanMessage,
      isActive: true,
      createdBy: req.user?.id || null,
    });

    const saved = await feedback.save();

    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: saved,
    });
  } catch (err) {
    console.error("Create Feedback Error =>", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Server Error",
    });
  }
};

// export const getFeedback = async (req, res) => {
//   try {
//     const isAll = req.query.all === "true";

//     const page = parseInt(req.query.page) || 1;
//     const limit = 10;
//     const skip = (page - 1) * limit;

//     const query = Feedback.find()
//       .sort({ createdAt: -1 })
//       .populate("createdBy", "name email");

//     const totalFeedback = await Feedback.countDocuments();

//     let feedback;

//     if (isAll) {
//       feedback = await query;
//     } else {
//       feedback = await query.skip(skip).limit(limit);
//     }

//     return res.status(200).json({
//       success: true,
//       count: feedback.length,
//       total: totalFeedback,
//       page: isAll ? null : page,
//       totalPages: isAll ? 1 : Math.ceil(totalFeedback / limit),
//       data: feedback,
//     });
//   } catch (error) {
//     console.error("Get Feedback Error =>", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Something went wrong",
//     });
//   }
// };

export const getFeedback = async (req, res) => {
  try {
    const isAll = req.query.all === "true";

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = 10;
    const skip = (page - 1) * limit;

    const query = Feedback.find({ isActive: true })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    const total = await Feedback.countDocuments({ isActive: true });

    let feedbackList;

    if (isAll) {
      feedbackList = await query;
    } else {
      feedbackList = await query.skip(skip).limit(limit);
    }

    const data = feedbackList.map((item) => ({
      id: item._id,
      name: item.name || "",
      message: item.message || "",
      isActive: item.isActive,
      createdBy: item.createdBy || null,
      updatedBy: item.updatedBy || null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt || null,
    }));

    return res.status(200).json({
      success: true,
      count: data.length,
      total,
      page: isAll ? null : page,
      totalPages: isAll ? 1 : Math.ceil(total / limit),
      data,
    });
  } catch (error) {
    console.error("Get Feedback Error =>", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching feedback",
    });
  }
};

// export const updateFeedbackStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { isActive } = req.body;

//     const record = await Feedback.findByIdAndUpdate(
//       id,
//       {
//         $set: {
//           isActive: isActive === "true" || isActive === true,
//           updatedBy: req.user?.id || null,
//         },
//       },
//       { new: true },
//     );

//     if (!record) {
//       return res.status(404).json({
//         success: false,
//         message: "Feedback not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Status updated successfully",
//       data: record,
//     });
//   } catch (error) {
//     console.error("Update Contractual Staff Status Error =>", error);

//     res.status(500).json({
//       success: false,
//       message: error.message || "Something went wrong",
//     });
//   }
// };

export const updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const record = await Feedback.findByIdAndUpdate(
      id,
      {
        $set: {
          isActive: isActive === "true" || isActive === true,
          updatedBy: req.user?.id || null,
          updatedAt: new Date(),
        },
      },
      { new: true }
    )
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Feedback status updated successfully",
      data: {
        id: record._id,
        name: record.name,
        message: record.message,
        isActive: record.isActive,
        createdBy: record.createdBy || null,
        updatedBy: record.updatedBy || null,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt || null,
      },
    });
  } catch (error) {
    console.error("Update Feedback Status Error =>", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// export const getFeedbackID = async (req, res) => {
//   try {
//     const feedbackId = req.query.id;

//     if (!feedbackId) {
//       return res.status(400).json({
//         success: false,
//         message: "Feedback ID is required",
//       });
//     }

//     const feedback = await Feedback.findById(feedbackId).populate(
//       "createdBy",
//       "name email",
//     );

//     if (!feedback) {
//       return res.status(404).json({
//         success: false,
//         message: "Feedback not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: feedback,
//     });
//   } catch (error) {
//     console.error("Get Feedback Error =>", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Something went wrong",
//     });
//   }
// };
 

export const getFeedbackId = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findById(id)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    console.error("Get Feedback Error =>", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};
