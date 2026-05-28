import ExternallyFundedProject from "../models/ExternallyFundedProjectSchema.js";

export const createExternallyFundedProject = async (req, res) => {
  try {
    const {
      title_en,
      title_hi,
      fundingAgency_en,
      fundingAgency_hi,
      sanctionedBudget_en,
      sanctionedBudget_hi,
      principalInvestigator_en,
      principalInvestigator_hi,
    } = req.body;

    if (
      !title_en ||
      !title_hi ||
      !fundingAgency_en ||
      !fundingAgency_hi ||
      !sanctionedBudget_en ||
      !sanctionedBudget_hi ||
      !principalInvestigator_en ||
      !principalInvestigator_hi
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const project = new ExternallyFundedProject({
      title: { en: title_en, hi: title_hi },
      fundingAgency: { en: fundingAgency_en, hi: fundingAgency_hi },
      sanctionedBudget: {
        en: sanctionedBudget_en,
        hi: sanctionedBudget_hi,
      },
      principalInvestigator: {
        en: principalInvestigator_en,
        hi: principalInvestigator_hi,
      },
      createdBy: req.user.id,
    });

    const savedProject = await project.save();

    return res.status(201).json({
      success: true,
      message: "Externally Funded Project created successfully",
      data: savedProject,
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

export const getExternallyFundedProjects = async (req, res) => {
  try {
    const isAll = req.query.all === "true";

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    let query = ExternallyFundedProject.find();

    const totalProjects = await ExternallyFundedProject.countDocuments();

    let projects;
    if (isAll) {
      projects = await query;
    } else {
      projects = await query.skip(skip).limit(limit);
    }

    res.status(200).json({
      success: true,
      count: projects.length,
      total: totalProjects,
      page: isAll ? null : page,
      totalPages: isAll ? 1 : Math.ceil(totalProjects / limit),
      data: projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const updateExternallyFundedProject = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title_en,
      title_hi,
      fundingAgency_en,
      fundingAgency_hi,
      sanctionedBudget_en,
      sanctionedBudget_hi,
      principalInvestigator_en,
      principalInvestigator_hi,
      isActive,
    } = req.body;

    const project = await ExternallyFundedProject.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    //  Title update
    if (title_en !== undefined || title_hi !== undefined) {
      if (
        (!title_en || title_en.trim() === "") &&
        (!title_hi || title_hi.trim() === "")
      ) {
        return res.status(400).json({
          success: false,
          message: "Title (English or Hindi) cannot be empty",
        });
      }
      project.title = {
        en: title_en ?? project.title.en,
        hi: title_hi ?? project.title.hi,
      };
    }

    //  Funding Agency update
    if (fundingAgency_en !== undefined || fundingAgency_hi !== undefined) {
      if (
        (!fundingAgency_en || fundingAgency_en.trim() === "") &&
        (!fundingAgency_hi || fundingAgency_hi.trim() === "")
      ) {
        return res.status(400).json({
          success: false,
          message: "Funding Agency (English or Hindi) cannot be empty",
        });
      }
      project.fundingAgency = {
        en: fundingAgency_en ?? project.fundingAgency.en,
        hi: fundingAgency_hi ?? project.fundingAgency.hi,
      };
    }

    //  Sanctioned Budget update
    if (
      sanctionedBudget_en !== undefined ||
      sanctionedBudget_hi !== undefined
    ) {
      project.sanctionedBudget = {
        en: sanctionedBudget_en ?? project.sanctionedBudget.en,
        hi: sanctionedBudget_hi ?? project.sanctionedBudget.hi,
      };
    }

    // Principal Investigator update
    if (
      principalInvestigator_en !== undefined ||
      principalInvestigator_hi !== undefined
    ) {
      project.principalInvestigator = {
        en: principalInvestigator_en ?? project.principalInvestigator.en,
        hi: principalInvestigator_hi ?? project.principalInvestigator.hi,
      };
    }

    //  isActive update
    if (isActive !== undefined) {
      project.isActive = isActive === "true" || isActive === true;
    }

    project.updatedBy = req.user?.id;
    project.updatedDate = Date.now();

    const updatedProject = await project.save();

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: updatedProject,
    });
  } catch (error) {
    console.error("Update Project Error =>", error);

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

export const updateExternallyFundedProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const project = await ExternallyFundedProject.findByIdAndUpdate(
      id,
      {
        isActive: isActive === "true" || isActive === true,
        updatedBy: req.user?.id,
        updatedDate: new Date(),
      },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Project status updated successfully",
      data: project,
    });
  } catch (error) {
    console.error("Update Project Status Error =>", error);

    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};


// this is use for web
export const getAllExternallyFundedProjectsWeb = async (req, res) => {
  try {
    const projectList = await ExternallyFundedProject.find()
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdDate: -1 });

    const data = projectList.map((project) => ({
      id: project._id,
      title: project.title || { en: "", hi: "" },
      fundingAgency: project.fundingAgency || { en: "", hi: "" },
      sanctionedBudget: project.sanctionedBudget || { en: "", hi: "" },
      principalInvestigator:
        project.principalInvestigator || { en: "", hi: "" },

      isActive: project.isActive,

      createdBy: project.createdBy || null,
      updatedBy: project.updatedBy || null,
      createdAt: project.createdDate,
      updatedAt: project.updatedDate || null,
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
      message: "Error fetching funded projects",
    });
  }
};