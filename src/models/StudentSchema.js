
import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
  studentName: {
    en: { type: String, required: true },
    hi: { type: String ,required: true },
  },
  rollNo: {
    type: String,
    required: true,
    unique: true,
  },
  guideName: {
    en: { type: String },
    hi: { type: String },
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  studentCourseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudentCourse",
    required: true,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  createdDate: {
    type: Date,
    default: Date.now,
  },
  updatedDate: {
    type: Date,
  },
});

export default mongoose.model("Student", StudentSchema);
