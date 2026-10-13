import mongoose from "mongoose";

const TechnozianRegistrationSchema = new mongoose.Schema(
  {
    rollNo: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    rfidUid: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    branch: {
      type: String,
      trim: true,
      default: "",
    },
    year: {
      type: String,
      trim: true,
      default: "",
    },
    contactNo: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      default: "",
    },
    eventName: {
      type: String,
      trim: true,
      default: "Technozian",
    },
    deviceId: {
      type: String,
      trim: true,
      default: "BOX_1",
    },
    scanCount: {
      type: Number,
      default: 1,
    },
    lastScannedAt: {
      type: Date,
      default: Date.now,
    },
    attended: {
      type: Boolean,
      default: true,
    },
    isManual: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: "",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "technozian_registrations",
  }
);

// Optimize fast lookup on roll number and deletion status
TechnozianRegistrationSchema.index({ rollNo: 1, isDeleted: 1 });
TechnozianRegistrationSchema.index({ rfidUid: 1, isDeleted: 1 });

export default mongoose.models.TechnozianRegistration ||
  mongoose.model("TechnozianRegistration", TechnozianRegistrationSchema);
