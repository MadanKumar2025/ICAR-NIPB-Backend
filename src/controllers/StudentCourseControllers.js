import StudentCourse from "../models/StudentCourseSchema.js";

export const createStudentCourse = async (req, res) => {
  try {
    const { courseName_en, courseName_hi, semester_en, semester_hi } = req.body;

    if (!courseName_en || !courseName_hi || !semester_en || !semester_hi) {
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

    const studentCourse = new StudentCourse({
      courseName: {
        en: courseName_en,
        hi: courseName_hi,
      },
      semester: {
        en: semester_en,
        hi: semester_hi,
      },
      createdBy: req.user.id,
    });

    const savedCourse = await studentCourse.save();

    return res.status(201).json({
      success: true,
      message: "Student Course created successfully",
      data: savedCourse,
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

export const getStudentCourses = async (req, res) => {
  try {
    const isAll = req.query.all === "true";

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    let query = StudentCourse.find();

    const totalRecords = await StudentCourse.countDocuments();

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

export const updateStudentCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const { courseName_en, courseName_hi, semester_en, semester_hi, isActive } =
      req.body;

    const record = await StudentCourse.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    // Course Name update
    if (courseName_en !== undefined || courseName_hi !== undefined) {
      if (
        (!courseName_en || courseName_en.trim() === "") &&
        (!courseName_hi || courseName_hi.trim() === "")
      ) {
        return res.status(400).json({
          success: false,
          message: "Course name cannot be empty",
        });
      }

      record.courseName = {
        en: courseName_en ?? record.courseName.en,
        hi: courseName_hi ?? record.courseName.hi,
      };
    }

    // Semester update
    if (semester_en !== undefined || semester_hi !== undefined) {
      if (
        (!semester_en || semester_en.trim() === "") &&
        (!semester_hi || semester_hi.trim() === "")
      ) {
        return res.status(400).json({
          success: false,
          message: "Semester cannot be empty",
        });
      }

      record.semester = {
        en: semester_en ?? record.semester.en,
        hi: semester_hi ?? record.semester.hi,
      };
    }

    // isActive update
    if (isActive !== undefined) {
      record.isActive = isActive === "true" || isActive === true;
    }

    record.updatedBy = req.user?.id;
    record.updatedDate = Date.now();

    const updatedRecord = await record.save();

    return res.status(200).json({
      success: true,
      message: "Student Course updated successfully",
      data: updatedRecord,
    });
  } catch (error) {
    console.error("Update Student Course Error =>", error);

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

export const updateStudentCourseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const record = await StudentCourse.findByIdAndUpdate(
      id,
      {
        isActive: isActive === "true" || isActive === true,
        updatedBy: req.user?.id,
        updatedDate: new Date(),
      },
      { new: true },
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student Course status updated successfully",
      data: record,
    });
  } catch (error) {
    console.error("Update Student Course Status Error =>", error);

    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};




// this is use for web
export const getAllStudentCoursesWeb = async (req, res) => {
  try {
    // Fetch all student courses, populate user info, sort by creation date descending
    const coursesList = await StudentCourse.find()
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdDate: -1 });

    // Map data to a clean response
    const data = coursesList.map((course) => ({
      id: course._id,
      courseName: course.courseName || { en: "", hi: "" },
      semester: course.semester || { en: "", hi: "" },
      isActive: course.isActive,
      createdBy: course.createdBy || null,
      updatedBy: course.updatedBy || null,
      createdDate: course.createdDate,
      updatedDate: course.updatedDate || null,
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
      message: "Error fetching student courses",
    });
  }
};