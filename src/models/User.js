import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  mobileNo: {
    type: String,
    required: true,
    match: [/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"],
  },

  designation: {
    type: String,
    required: true,
  },

  photo: {
    type: String,
    // required: true,
  },
  imageTitle: {
    type: String,
    default: "",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  scientistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Scientist",
  },
  createdate: {
    type: Date,
    default: Date.now,
  },

  createby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  updateby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  updatedate: {
    type: Date,
  },
});

export default mongoose.model("User", userSchema);
