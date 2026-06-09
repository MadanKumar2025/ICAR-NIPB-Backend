import Scientist from "../models/ScientistSchema.js";
import mongoose from "mongoose";

export const createScientist = async (req, res) => {
  try {
    const {
      scientistName_en,
      scientistName_hi,
      designationId,
      phone1,
      phone2,
      email1,
      email2,
      education_en,
      education_hi,
      majorCourses_en,
      majorCourses_hi,
      photoTitle,
      researchInterest_en,
      researchInterest_hi,
      publications_en,
      publications_hi,
      IPR_en,
      IPR_hi,
      awards_en,
      awards_hi,
      externallyFundedProjects_en,
      externallyFundedProjects_hi,
      labProfile,
      displayOrder,
      createby,
    } = req.body;

    // validation
    const missingFields = [];
    if (!scientistName_en) missingFields.push("Scientist Name (English)");
    if (!scientistName_hi) missingFields.push("Scientist Name (Hindi)");
    if (!designationId) missingFields.push("Designation");
    if (
      displayOrder === undefined ||
      displayOrder === null ||
      displayOrder === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Display order is required",
      });
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(designationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid designationId",
      });
    }

    // const createby = req.user?.id;
    // main photo
    const photoFile = req.files.find((f) => f.fieldname === "photo");
    const photo = photoFile?.filename || null;

    const parseLabProfile = (data) => {
      if (!data) return [];
      try {
        const parsed = JSON.parse(data);
        return parsed.map((item) => {
          const file = req.files.find((f) => f.fieldname === item.photoKey);
          return {
            name: item.name,
            position: item.position,
            project: item.project,
            duration: item.duration,
            ImageTitle: item.ImageTitle,
            photo1: file?.filename || null,
          };
        });
      } catch {
        return [];
      }
    };

    const scientist = new Scientist({
      scientistName: {
        en: scientistName_en,
        hi: scientistName_hi,
      },
      designationId,
      phone1,
      phone2,
      email1,
      email2,
      education: {
        en: education_en || "",
        hi: education_hi || "",
      },
      majorCourses: {
        en: majorCourses_en || "",
        hi: majorCourses_hi || "",
      },
      photoTitle: photoTitle || "",
      photo,
      researchInterest: {
        en: researchInterest_en || "",
        hi: researchInterest_hi || "",
      },
      publications: {
        en: publications_en || "",
        hi: publications_hi || "",
      },
      IPR: {
        en: IPR_en || "",
        hi: IPR_hi || "",
      },
      awards: {
        en: awards_en || "",
        hi: awards_hi || "",
      },
      externallyFundedProjects: {
        en: externallyFundedProjects_en || "",
        hi: externallyFundedProjects_hi || "",
      },
      labProfile: parseLabProfile(labProfile),
      displayOrder: displayOrder ?? 0,
      createby,
    });

    const savedScientist = await scientist.save();

    return res.status(201).json({
      success: true,
      message: "Scientist created successfully",
      data: savedScientist,
    });
  } catch (error) {
    console.error("Create Scientist Error:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getScientist = async (req, res) => {
  try {
    const scientistList = await Scientist.find()
      .populate({
        path: "designationId",
        select: "name isActive createdDate updatedDate createdBy updatedBy",
        populate: [
          { path: "createdBy", select: "name email" },
          { path: "updatedBy", select: "name email" },
        ],
      })
      .populate("createby", "name email")
      .populate("updateby", "name email")
      .sort({ createdate: -1 });

    const data = scientistList.map((scientist) => ({
      id: scientist._id,

      scientistName: scientist.scientistName || { en: "", hi: "" },

      designation: scientist.designationId
        ? {
            id: scientist.designationId._id,
            name: scientist.designationId.name,
            isActive: scientist.designationId.isActive,
            createdDate: scientist.designationId.createdDate,
            updatedDate: scientist.designationId.updatedDate,
            createdBy: scientist.designationId.createdBy,
            updatedBy: scientist.designationId.updatedBy,
          }
        : null,

      phone1: scientist.phone1 || "",
      phone2: scientist.phone2 || "",

      email1: scientist.email1 || "",
      email2: scientist.email2 || "",

      education: scientist.education || { en: "", hi: "" },
      majorCourses: scientist.majorCourses || { en: "", hi: "" },

      photoTitle: scientist.photoTitle || "",
      photo: scientist?.photo || null,

      displayOrder: scientist?.displayOrder || null,

      isActive: scientist.isActive,

      researchInterest: scientist.researchInterest || { en: "", hi: "" },
      publications: scientist.publications || { en: "", hi: "" },
      IPR: scientist.IPR || { en: "", hi: "" },
      awards: scientist.awards || { en: "", hi: "" },

      externallyFundedProjects: scientist.externallyFundedProjects || {
        en: "",
        hi: "",
      },

      labProfile:
        scientist.labProfile?.map((lab) => ({
          name: lab.name || { en: "", hi: "" },
          position: lab.position || { en: "", hi: "" },
          project: lab.project || { en: "", hi: "" },
          duration: lab.duration || { en: "", hi: "" },
          ImageTitle: lab.ImageTitle || "",
          photo1: lab.photo1 || "",
        })) || [],

      createdBy: scientist.createby || null,
      updatedBy: scientist.updateby || null,

      createdAt: scientist.createdate,
      updatedAt: scientist.updatedate || null,
    }));

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching scientists",
    });
  }
};

export const updateScientist = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid scientist id",
      });
    }

    const scientist = await Scientist.findById(id);

    if (!scientist) {
      return res.status(404).json({
        success: false,
        message: "Scientist not found",
      });
    }

    const {
      scientistName_en,
      scientistName_hi,
      designationId,
      phone1,
      phone2,
      email1,
      email2,
      education_en,
      education_hi,
      majorCourses_en,
      majorCourses_hi,
      photoTitle,
      researchInterest_en,
      researchInterest_hi,
      publications_en,
      publications_hi,
      IPR_en,
      IPR_hi,
      awards_en,
      awards_hi,
      externallyFundedProjects_en,
      externallyFundedProjects_hi,
      displayOrder,
      labProfile,
    } = req.body;

    // Validate designationId
    if (designationId && !mongoose.Types.ObjectId.isValid(designationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid designationId",
      });
    }
    // if (designationId) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid designationId",
    //   });
    // }

    // Validate displayOrder if sent
    if (
      displayOrder !== undefined &&
      displayOrder !== "" &&
      isNaN(Number(displayOrder))
    ) {
      return res.status(400).json({
        success: false,
        message: "Display order must be a number",
      });
    }

    const updateIfExists = (newVal, oldVal) => {
      return newVal !== undefined ? newVal : oldVal;
    };

    // Main Photo
    const photoFile = req.files?.find((f) => f.fieldname === "photo");

    if (photoFile) {
      scientist.photo = photoFile.filename;
    }

    // Parse Lab Profile
    const parseLabProfile = (data) => {
      if (!data) return scientist.labProfile || [];

      try {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;

        return parsed.map((item, index) => {
          const file = req.files?.find((f) => f.fieldname === item.photoKey);

          return {
            name: {
              en: item?.name?.en || "",
              hi: item?.name?.hi || "",
            },
            position: {
              en: item?.position?.en || "",
              hi: item?.position?.hi || "",
            },
            project: {
              en: item?.project?.en || "",
              hi: item?.project?.hi || "",
            },
            duration: {
              en: item?.duration?.en || "",
              hi: item?.duration?.hi || "",
            },
            ImageTitle: item?.ImageTitle || "",
            photo1:
              file?.filename || scientist.labProfile?.[index]?.photo1 || null,
          };
        });
      } catch (err) {
        console.error("Lab Profile Parse Error:", err.message);

        return scientist.labProfile || [];
      }
    };

    // Update fields

    scientist.scientistName = {
      en: updateIfExists(scientistName_en, scientist.scientistName?.en),
      hi: updateIfExists(scientistName_hi, scientist.scientistName?.hi),
    };

    scientist.designationId = updateIfExists(
      designationId,
      scientist.designationId,
    );

    scientist.phone1 = updateIfExists(phone1, scientist.phone1);

    scientist.phone2 = updateIfExists(phone2, scientist.phone2);

    scientist.email1 = updateIfExists(email1, scientist.email1);

    scientist.email2 = updateIfExists(email2, scientist.email2);

    scientist.education = {
      en: updateIfExists(education_en, scientist.education?.en),
      hi: updateIfExists(education_hi, scientist.education?.hi),
    };

    scientist.majorCourses = {
      en: updateIfExists(majorCourses_en, scientist.majorCourses?.en),
      hi: updateIfExists(majorCourses_hi, scientist.majorCourses?.hi),
    };

    scientist.photoTitle = updateIfExists(photoTitle, scientist.photoTitle);

    scientist.researchInterest = {
      en: updateIfExists(researchInterest_en, scientist.researchInterest?.en),
      hi: updateIfExists(researchInterest_hi, scientist.researchInterest?.hi),
    };

    scientist.publications = {
      en: updateIfExists(publications_en, scientist.publications?.en),
      hi: updateIfExists(publications_hi, scientist.publications?.hi),
    };

    scientist.IPR = {
      en: updateIfExists(IPR_en, scientist.IPR?.en),
      hi: updateIfExists(IPR_hi, scientist.IPR?.hi),
    };

    scientist.awards = {
      en: updateIfExists(awards_en, scientist.awards?.en),
      hi: updateIfExists(awards_hi, scientist.awards?.hi),
    };

    scientist.externallyFundedProjects = {
      en: updateIfExists(
        externallyFundedProjects_en,
        scientist.externallyFundedProjects?.en,
      ),
      hi: updateIfExists(
        externallyFundedProjects_hi,
        scientist.externallyFundedProjects?.hi,
      ),
    };

    // IMPORTANT: displayOrder fix
    scientist.displayOrder = Number(
      displayOrder ?? scientist.displayOrder ?? 0,
    );

    scientist.labProfile = parseLabProfile(labProfile);

    if (req.user?.id) {
      scientist.updateby = req.user.id;
    }

    scientist.updatedate = new Date();

    scientist.markModified("labProfile");

    const updatedScientist = await scientist.save();

    return res.status(200).json({
      success: true,
      message: "Scientist updated successfully",
      data: updatedScientist,
    });
  } catch (error) {
    console.error("Update Scientist Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateScientistStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // check scientist exists
    const scientist = await Scientist.findById(id);

    if (!scientist) {
      return res.status(404).json({
        success: false,
        message: "Scientist not found",
      });
    }

    // update status
    scientist.isActive = isActive;

    //  meta update
    scientist.updateby = req.user?.id;
    scientist.updatedate = new Date();

    await scientist.save();

    return res.status(200).json({
      success: true,
      message: `Scientist ${
        isActive ? "activated" : "deactivated"
      } successfully`,
      data: scientist,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getScientistById = async (req, res) => {
  try {
    const { id } = req.params;

    const scientist = await Scientist.findById(id).populate("designationId");

    if (!scientist) {
      return res.status(404).json({
        success: false,
        message: "Scientist not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: scientist,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// this is use for web
export const getAllScientistsWeb = async (req, res) => {
  try {
    const scientistList = await Scientist.find()
      .populate({
        path: "designationId",
        select: "name isActive createdDate updatedDate createdBy updatedBy",
        populate: [
          { path: "createdBy", select: "name email" },
          { path: "updatedBy", select: "name email" },
        ],
      })
      .populate("createby", "name email")
      .populate("updateby", "name email")
      .sort({ displayOrder: 1 });

    const data = scientistList.map((scientist) => ({
      id: scientist._id,

      scientistName: scientist.scientistName || { en: "", hi: "" },

      designation: scientist.designationId
        ? {
            id: scientist.designationId._id,
            name: scientist.designationId.name,
            // isActive: scientist.designationId.isActive,
            // createdDate: scientist.designationId.createdDate,
            // updatedDate: scientist.designationId.updatedDate,
            // createdBy: scientist.designationId.createdBy,
            // updatedBy: scientist.designationId.updatedBy,
          }
        : null,

      // phone1: scientist.phone1 || "",
      // phone2: scientist.phone2 || "",

      // email1: scientist.email1 || "",
      // email2: scientist.email2 || "",

      // education: scientist.education || { en: "", hi: "" },
      // majorCourses: scientist.majorCourses || { en: "", hi: "" },

      photoTitle: scientist.photoTitle || "",
      photo: scientist?.photo || null,

      isActive: scientist.isActive,

      // researchInterest: scientist.researchInterest || { en: "", hi: "" },
      // publications: scientist.publications || { en: "", hi: "" },
      // IPR: scientist.IPR || { en: "", hi: "" },
      // awards: scientist.awards || { en: "", hi: "" },

      // externallyFundedProjects: scientist.externallyFundedProjects || {
      //   en: "",
      //   hi: "",
      // },

      // labProfile:
      //   scientist.labProfile?.map((lab) => ({
      //     name: lab.name || { en: "", hi: "" },
      //     position: lab.position || { en: "", hi: "" },
      //     project: lab.project || { en: "", hi: "" },
      //     duration: lab.duration || { en: "", hi: "" },
      //     ImageTitle: lab.ImageTitle || "",
      //     photo1: lab.photo1 || "",
      //   })) || [],

      // createdBy: scientist.createby || null,
      // updatedBy: scientist.updateby || null,

      // createdAt: scientist.createdate,
      // updatedAt: scientist.updatedate || null,
    }));

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching scientists",
    });
  }
};

export const getScientistByIdWeb = async (req, res) => {
  try {
    const { id } = req.params;

    const scientist = await Scientist.findById(id)
      .populate({
        path: "designationId",
        select: "name isActive createdDate updatedDate createdBy updatedBy",
        populate: [
          { path: "createdBy", select: "name email" },
          { path: "updatedBy", select: "name email" },
        ],
      })
      .populate("createby", "name email")
      .populate("updateby", "name email");

    if (!scientist) {
      return res.status(404).json({
        success: false,
        message: "Scientist not found",
      });
    }

    const data = {
      id: scientist._id,

      scientistName: scientist.scientistName || { en: "", hi: "" },

      designation: scientist.designationId
        ? {
            id: scientist.designationId._id,
            name: scientist.designationId.name,
            isActive: scientist.designationId.isActive,
            createdDate: scientist.designationId.createdDate,
            updatedDate: scientist.designationId.updatedDate,
            createdBy: scientist.designationId.createdBy,
            updatedBy: scientist.designationId.updatedBy,
          }
        : null,

      phone1: scientist.phone1 || "",
      phone2: scientist.phone2 || "",

      email1: scientist.email1 || "",
      email2: scientist.email2 || "",

      education: scientist.education || { en: "", hi: "" },
      majorCourses: scientist.majorCourses || { en: "", hi: "" },

      photoTitle: scientist.photoTitle || "",
      photo: scientist?.photo || null,

      isActive: scientist.isActive,

      researchInterest: scientist.researchInterest || { en: "", hi: "" },
      publications: scientist.publications || { en: "", hi: "" },
      IPR: scientist.IPR || { en: "", hi: "" },
      awards: scientist.awards || { en: "", hi: "" },

      externallyFundedProjects: scientist.externallyFundedProjects || {
        en: "",
        hi: "",
      },

      labProfile:
        scientist.labProfile?.map((lab) => ({
          name: lab.name || { en: "", hi: "" },
          position: lab.position || { en: "", hi: "" },
          project: lab.project || { en: "", hi: "" },
          duration: lab.duration || { en: "", hi: "" },
          ImageTitle: lab.ImageTitle || "",
          photo1: lab.photo1 || "",
        })) || [],

      createdBy: scientist.createby || null,
      updatedBy: scientist.updateby || null,

      createdAt: scientist.createdate,
      updatedAt: scientist.updatedate || null,
    };

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching scientist",
    });
  }
};
