import mongoose from "mongoose";

const userPermissionsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  menuPermissions: [
    {
      menuId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AdminMenuMaster",
        required: true,
      },

      pageAccess: {
        type: Boolean,
        default: false,
      },
      addAccess: {
        type: Boolean,
        default: false,
      },
      editAccess: {
        type: Boolean,
        default: false,
      },

      activeAccess: {
        type: Boolean,
        default: false,
      },

      deleteAccess: {
        type: Boolean,
        default: false,
      },
    },
  ],

  isActive: {
    type: Boolean,
    default: true,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
  },
});
userPermissionsSchema.index({ userId: 1}, { unique: true });
export default mongoose.model("UserPermissions", userPermissionsSchema);
