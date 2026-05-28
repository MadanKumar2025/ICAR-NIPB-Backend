import Template from "../models/TemplateSchema.js";

export const createTemplate = async (req, res) => {
  try {
    const { templateName, htmlDescription } = req.body;

    if (!templateName || !htmlDescription) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingTemplate = await Template.findOne({ templateName });
    if (existingTemplate) {
      return res.status(409).json({
        status: "fail",
        message: "Template with this name already exists",
      });
    }

    const newTemplate = new Template({
      templateName,
      htmlDescription,
      createby: req.user?._id,
    });
    await newTemplate.save();

    res.status(201).json({
      status: "success",
      message: "Template created successfully",
      data: newTemplate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { templateName, htmlDescription } = req.body;
    
    if (templateName) {
      const existingTemplate = await Template.findOne({
        templateName,
        _id: { $ne: id }, 
      });

      if (existingTemplate) {
        return res.status(409).json({
          status: "fail",
          message: "Template with this name already exists",
        });
      }
    }

    const updateData = {};
    if (templateName) updateData.templateName = templateName;
    if (htmlDescription) updateData.htmlDescription = htmlDescription;

    updateData.updateby = req.user?._id;
    updateData.updatedate = new Date();

    const updatedTemplate = await Template.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );

    if (!updatedTemplate) {
      return res.status(404).json({
        message: "Template not found",
      });
    }

    res.status(200).json({
      message: "Template updated successfully",
      data: updatedTemplate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

export const getTemplates = async (req, res) => {
  try {
    const isAll = req.query.all === "true";

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    let query = Template.find()
      .populate("createby", "name email")
      .populate("updateby", "name email");

    let templates;
    const totalTemplates = await Template.countDocuments();

    if (isAll) {
      templates = await query;
    } else {
      templates = await query.skip(skip).limit(limit);
    }

    res.status(200).json({
      success: true,
      count: templates.length,
      total: totalTemplates,
      page: isAll ? null : page,
      totalPages: isAll ? 1 : Math.ceil(totalTemplates / limit),
      data: templates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
