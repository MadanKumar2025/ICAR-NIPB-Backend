import InstitutionalProjectDetails from "../models/InstitutionalProjectsDetailsSchema.js";
import InstitutionalProject from "../models/InstitutionalProjectsSchema.js";

export const createInstitutionalProjectDetails = async (req, res) => {
  try {
    const {
      institutionalProjectID,
      subProjects_en,
      subProjects_hi,
      principalInvestigators_en,
      principalInvestigators_hi,
      isActive,
    } = req.body;

    // 1. Required field validation
    if (
      !institutionalProjectID ||
      !subProjects_en ||
      !subProjects_hi ||
      !principalInvestigators_en ||
      !principalInvestigators_hi
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 2. Auth check
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // 3. Check parent project exists
    const parentProject = await InstitutionalProject.findById(
      institutionalProjectID,
    );

    if (!parentProject) {
      return res.status(404).json({
        success: false,
        message: "Institutional Project not found",
      });
    }

    // 4. Create document
    const details = new InstitutionalProjectDetails({
      institutionalProjectID,
      subProjects: {
        en: subProjects_en,
        hi: subProjects_hi,
      },
      principalInvestigators: {
        en: principalInvestigators_en,
        hi: principalInvestigators_hi,
      },
      isActive: isActive ?? true,
      createdBy: req.user.id,
      updatedDate: new Date(),
    });

    const saved = await details.save();

    return res.status(201).json({
      success: true,
      message: "Project details created successfully",
      data: saved,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getInstitutionalProjectDetailsByProjectID = async (req, res) => {
  try {
    const { institutionalProjectID } = req.params;

    if (!institutionalProjectID) {
      return res.status(400).json({
        success: false,
        message: "institutionalProjectID is required",
      });
    }

    const details = await InstitutionalProjectDetails.find({
      institutionalProjectID,
    })
      .populate("institutionalProjectID")
      .sort({ createdDate: -1 });

    if (!details.length) {
      return res.status(404).json({
        success: false,
        message: "No details found for this project",
      });
    }

    return res.status(200).json({
      success: true,
      count: details.length,
      data: details,
    });
  } catch (error) {
    console.error("ERROR =>", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const updateInstitutionalProjectDetails = async (req, res) => {
  try {
    const { id } = req.params;

    let {
      institutionalProjectID,
      subProjects_en,
      subProjects_hi,
      principalInvestigators_en,
      principalInvestigators_hi,
      isActive,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Details ID is required",
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const details = await InstitutionalProjectDetails.findById(id);

    if (!details) {
      return res.status(404).json({
        success: false,
        message: "Project details not found",
      });
    }

    if (institutionalProjectID !== undefined) {
      details.institutionalProjectID = institutionalProjectID;
    }

    if (subProjects_en !== undefined || subProjects_hi !== undefined) {
      details.subProjects = {
        en: subProjects_en ?? details.subProjects?.en,
        hi: subProjects_hi ?? details.subProjects?.hi,
      };
    }

    if (
      principalInvestigators_en !== undefined ||
      principalInvestigators_hi !== undefined
    ) {
      details.principalInvestigators = {
        en: principalInvestigators_en ?? details.principalInvestigators?.en,
        hi: principalInvestigators_hi ?? details.principalInvestigators?.hi,
      };
    }

    if (typeof isActive !== "undefined") {
      details.isActive =
        isActive === true || isActive === "true" ? true : false;
    }

    details.updatedBy = req.user.id;
    details.updatedDate = new Date();


    const updated = await details.save();

    return res.status(200).json({
      success: true,
      message: "Project details updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("ERROR =>", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const updateInstitutionalProjectDetailsStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // Check ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Project Details ID is required",
      });
    }

    // Update document
    const projectDetails = await InstitutionalProjectDetails.findByIdAndUpdate(
      id,
      {
        isActive: isActive === "true" || isActive === true,
        updatedBy: req.user?.id,
        updatedDate: new Date(),
      },
      { new: true },
    );

    // If not found
    if (!projectDetails) {
      return res.status(404).json({
        success: false,
        message: "Project Details not found",
      });
    }

    // Success response
    return res.status(200).json({
      success: true,
      message: "Project Details status updated successfully",
      data: projectDetails,
    });
  } catch (error) {
    console.error("Update Project Details Status Error =>", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const deleteInstitutionalProjectDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Project Details ID is required",
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const deleted = await InstitutionalProjectDetails.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Project Details not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project Details permanently deleted",
    });
  } catch (error) {
    console.error("Delete Error =>", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// this is use for web

export const getProjectDetailsByProjectIDWeb = async (req, res) => {
  try {
    const { institutionalProjectID } = req.params;

    const projectDetailsList = await InstitutionalProjectDetails.find({
      institutionalProjectID: institutionalProjectID,
    })
      .populate("institutionalProjectID", "projectName")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdDate: -1 });

    const data = projectDetailsList.map((item) => ({
      id: item._id,

      institutionalProject: item.institutionalProjectID
        ? {
            id: item.institutionalProjectID._id,
            projectName: item.institutionalProjectID.projectName || "",
          }
        : null,

      subProjects: item.subProjects || { en: "", hi: "" },
      principalInvestigators:
        item.principalInvestigators || { en: "", hi: "" },

      isActive: item.isActive,

      createdBy: item.createdBy || null,
      updatedBy: item.updatedBy || null,

      createdDate: item.createdDate,
      updatedDate: item.updatedDate || null,
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
      message: "Error fetching project details",
    });
  }
};

export const getAllInstitutionalProjectDetailsWeb = async (req, res) => {
  try {
    const list = await InstitutionalProjectDetails.find()
      .populate("institutionalProjectID")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdDate: -1 });

    const data = list.map((item) => ({
      id: item._id,
      institutionalProjectID: item.institutionalProjectID || null,

      subProjects: item.subProjects || { en: "", hi: "" },
      principalInvestigators: item.principalInvestigators || { en: "", hi: "" },

      isActive: item.isActive,

      createdBy: item.createdBy || null,
      updatedBy: item.updatedBy || null,

      createdDate: item.createdDate,
      updatedDate: item.updatedDate || null,
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
      message: "Error fetching institutional project details",
    });
  }
};