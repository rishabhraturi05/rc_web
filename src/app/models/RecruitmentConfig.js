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
    isOpen: { type: Boolean, default: true },
    deadline: { type: Date, default: null },
    fields: { type: [RecruitmentFieldSchema], default: [] },
    departments: { type: [String], default: [] },
  },
  {
    timestamps: true,
    collection: "recruitment_configs",
  }
);

RecruitmentConfigSchema.index({ isOpen: 1, deadline: 1 });
RecruitmentConfigSchema.index({ updatedAt: -1 });

export default mongoose.models.RecruitmentConfig ||
  mongoose.model("RecruitmentConfig", RecruitmentConfigSchema);
