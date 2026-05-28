import Student from "../models/StudentSchema.js";


export const createStudent = async (req, res) => {
  try {
    const {
      studentName_en,
      studentName_hi,
      rollNo,
      guideName_en,
      guideName_hi,
      studentCourseId,
    } = req.body;

    // Required fields validation
    if (!studentName_en || !studentName_hi || !rollNo || !studentCourseId) {
      return res.status(400).json({
        success: false,
        message:
          "studentName (en & hi), rollNo, and studentCourseId are required",
      });
    }

    // Authorization check
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    // Create Student instance
    const newStudent = new Student({
      studentName: {
        en: studentName_en,
        hi: studentName_hi,
      },
      rollNo,
      guideName: {
        en: guideName_en || "",
        hi: guideName_hi || "",
      },
      studentCourseId,
      createdBy: req.user.id,
      updatedBy: req.user.id,
    });

    const savedStudent = await newStudent.save();

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: savedStudent,
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


export const getStudentsByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params; 
    const isAll = req.query.all === "true";
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = Student.find({ studentCourseId: courseId }).sort({ createdDate: -1 });

    let students;
    const totalStudents = await Student.countDocuments({ studentCourseId: courseId });

    if (isAll) {
      students = await query;
    } else {
      students = await query.skip(skip).limit(limit);
    }

    res.status(200).json({
      success: true,
      count: students.length,
      total: totalStudents,
      page: isAll ? null : page,
      totalPages: isAll ? 1 : Math.ceil(totalStudents / limit),
      data: students,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      studentName_en,
      studentName_hi,
      rollNo,
      guideName_en,
      guideName_hi,
      studentCourseId,
      isActive,
    } = req.body;

    const record = await Student.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Student Name update
    if (studentName_en !== undefined || studentName_hi !== undefined) {
      if (
        (!studentName_en || studentName_en.trim() === "") &&
        (!studentName_hi || studentName_hi.trim() === "")
      ) {
        return res.status(400).json({
          success: false,
          message: "Student name cannot be empty",
        });
      }

      record.studentName = {
        en: studentName_en ?? record.studentName.en,
        hi: studentName_hi ?? record.studentName.hi,
      };
    }

    // Roll No update
    if (rollNo !== undefined) {
      if (!rollNo || rollNo.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "rollNo cannot be empty",
        });
      }
      record.rollNo = rollNo;
    }

    // Guide Name update
    if (guideName_en !== undefined || guideName_hi !== undefined) {
      record.guideName = {
        en: guideName_en ?? record.guideName.en,
        hi: guideName_hi ?? record.guideName.hi,
      };
    }

    // Student Course update
    if (studentCourseId !== undefined) {
      record.studentCourseId = studentCourseId;
    }

    // isActive update
    if (isActive !== undefined) {
      record.isActive = isActive === "true" || isActive === true;
    }

    // Updated metadata
    record.updatedBy = req.user?.id;
    record.updatedDate = Date.now();

    const updatedRecord = await record.save();

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: updatedRecord,
    });
  } catch (error) {
    console.error("Update Student Error =>", error);

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
        message: "Invalid ID format",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const updateStudentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const record = await Student.findByIdAndUpdate(
      id,
      {
        isActive: isActive === "true" || isActive === true,
        updatedBy: req.user?.id,
        updatedDate: new Date(),
      },
      { new: true }
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student status updated successfully",
      data: record,
    });
  } catch (error) {
    console.error("Update Student Status Error =>", error);

    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};


export const getAllStudents = async (req, res) => {
  try {
    // Fetch all students, populate references and sort by createdDate descending
    const studentsList = await Student.find()
      .populate("studentCourseId", "courseName semester") // populate course info
      .populate("createdBy", "name email") // populate creator info
      .populate("updatedBy", "name email") // populate updater info
      .sort({ createdDate: -1 });

    // Map data to clean response
    const data = studentsList.map((student) => ({
      id: student._id,
      studentName: student.studentName || { en: "", hi: "" },
      rollNo: student.rollNo,
      guideName: student.guideName || { en: "", hi: "" },
      isActive: student.isActive,
      studentCourse: student.studentCourseId || null,
      createdBy: student.createdBy || null,
      updatedBy: student.updatedBy || null,
      createdDate: student.createdDate,
      updatedDate: student.updatedDate || null,
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
      message: "Error fetching students",
    });
  }
};