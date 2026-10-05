import mongoose from "mongoose";

const RecruitmentFieldSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["text", "email", "number", "textarea", "select", "radio", "checkbox"],
      required: true,
    },
    required: { type: Boolean, default: false },
    options: { type: [String], default: [] },
  },
  { _id: false }
);

const RecruitmentConfigSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    isOpen: { type: Boolean, default: true },
    deadline: { type: Date, default: null },
    fields: { type: [RecruitmentFieldSchema], default: [] },
    departments: { type: [String], default: [] },
    years: {
      type: [String],
      default: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
    },
  },
  {
    timestamps: true,
    collection: "recruitment_configs",
    strict: false,
  }
);

RecruitmentConfigSchema.index({ isOpen: 1, deadline: 1 });
RecruitmentConfigSchema.index({ updatedAt: -1 });

const RecruitmentConfig =
  mongoose.models.RecruitmentConfig ||
  mongoose.model("RecruitmentConfig", RecruitmentConfigSchema);

export default RecruitmentConfig;
