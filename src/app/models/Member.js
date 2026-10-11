import mongoose from "mongoose";

const MemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      default: "Software",
      trim: true,
    },
    category: {
      type: String,
      default: "member", // "member" | "core" | "alumni" | "professor"
      trim: true,
    },
    isAlumni: {
      type: Boolean,
      default: false,
    },
    isProf: {
      type: Boolean,
      default: false,
    },
    isCore: {
      type: Boolean,
      default: false,
    },
    isAddlSec: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: "Member",
      trim: true,
    },
    year: {
      type: String,
      default: "",
      trim: true,
    },
    rollNumber: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    img: {
      type: String,
      default: "",
      trim: true,
    },
    linkedin: {
      type: String,
      default: "",
      trim: true,
    },
    instagram: {
      type: String,
      default: "",
      trim: true,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
    },
    // Scoring fields (just like recruitment)
    points: {
      type: String,
      default: "",
      trim: true,
    },
    comments: {
      type: String,
      default: "",
      trim: true,
    },
    positiveRemarks: {
      type: [String],
      default: [],
    },
    negativeRemarks: {
      type: [String],
      default: [],
    },
    feedback: {
      type: String,
      default: "",
      trim: true,
    },
    evaluatedBy: {
      type: String,
      default: "",
    },
    evaluatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "members",
    strict: false,
  }
);

MemberSchema.index({ department: 1 });
MemberSchema.index({ category: 1 });
MemberSchema.index({ isAlumni: 1 });
MemberSchema.index({ isProf: 1 });

export default mongoose.models.Member || mongoose.model("Member", MemberSchema);
