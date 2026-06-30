import mongoose from "mongoose";

const visitorCounterSchema = new mongoose.Schema({
  todayDate: {
    type: Date,
    required: true,
    default: Date.now,
  },

  todayViews: {
    type: Number,
    default: 0,
  },

  totalViews: {
    type: Number,
    default: 0,
  },

});

export default mongoose.model("VisitorCounter", visitorCounterSchema);