import mongoose from "mongoose";

const OrganogramSchema = new mongoose.Schema({
  photo: {
    type: String,
    default: null,
  },
  photoTitle: {
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
  createdDate: {
    type: Date,
    default: Date.now,
  },
  updatedDate: {
    type: Date,
  },
});

export default mongoose.model("Organogram", OrganogramSchema);