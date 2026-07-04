import mongoose from "mongoose";

const DocumentUploaderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  documentFile: {
    type: String,
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
}, { timestamps: true });

export default mongoose.model("DocumentUploader", DocumentUploaderSchema);