import InstitutionalProject from "../models/InstitutionalProjectsSchema.js";

export const createInstitutionalProject = async (req, res) => {
  try {
    const {
      mainProject_en,
      mainProject_hi,
      groupLeader_en,
      groupLeader_hi,
      isActive,
    } = req.body;

    if (
      !mainProject_en ||
      !mainProject_hi ||
      !groupLeader_en ||
      !groupLeader_hi
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const project = new InstitutionalProject({
      mainProject: {
        en: mainProject_en,
        hi: mainProject_hi,
      },
      groupLeader: {
        en: groupLeader_en,
        hi: groupLeader_hi,
      },
      isActive: isActive ?? true,
      createdBy: req.user.id,
      updatedDate: new Date(),
    });

    const saved = await project.save();

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
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

export const getInstitutionalProjects = async (req, res) => {
  try {
    const isAll = req.query.all === "true";

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 10;
    const skip = (page - 1) * limit;

    const baseQuery = InstitutionalProject.find().sort({ createdDate: -1 }); // latest first

    const totalProjects = await InstitutionalProject.countDocuments();

    let projects;

    if (isAll) {
      projects = await baseQuery;
    } else {
      projects = await baseQuery.skip(skip).limit(limit);
    }

    return res.status(200).json({
      success: true,
      count: projects.length,
      total: totalProjects,
      page: isAll ? null : page,
      totalPages: isAll ? 1 : Math.ceil(totalProjects / limit),
      data: projects,
    });
  } catch (error) {
    console.error("ERROR =>", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const updateInstitutionalProject = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      mainProject_en,
      mainProject_hi,
      groupLeader_en,
      groupLeader_hi,
      isActive,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const project = await InstitutionalProject.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Update only if values are provided
    if (mainProject_en || mainProject_hi) {
      project.mainProject = {
        en: mainProject_en ?? project.mainProject.en,
        hi: mainProject_hi ?? project.mainProject.hi,
      };
    }

    if (groupLeader_en || groupLeader_hi) {
      project.groupLeader = {
        en: groupLeader_en ?? project.groupLeader.en,
        hi: groupLeader_hi ?? project.groupLeader.hi,
      };
    }

    if (typeof isActive !== "undefined") {
      project.isActive =
        isActive === true || isActive === "true" ? true : false;
    }

    project.updatedBy = req.user.id;
    project.updatedDate = new Date();

    const updatedProject = await project.save();

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: updatedProject,
    });
  } catch (error) {
    console.error("ERROR =>", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const updateInstitutionalProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    const project = await InstitutionalProject.findByIdAndUpdate(
      id,
      {
        isActive: isActive === "true" || isActive === true,
        updatedBy: req.user?.id,
        updatedDate: new Date(),
      },
      { new: true },
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project status updated successfully",
      data: project,
    });
  } catch (error) {
    console.error("Update Project Status Error =>", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};


// this is use for web
export const getAllInstitutionalProjectsWeb = async (req, res) => {
  try {
    const projectList = await InstitutionalProject.find()
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdDate: -1 });

    const data = projectList.map((project) => ({
      id: project._id,
      mainProject: project.mainProject || { en: "", hi: "" },
      groupLeader: project.groupLeader || { en: "", hi: "" },

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
      message: "Error fetching institutional projects",
    });
  }
};