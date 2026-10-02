import mongoose from "mongoose";

const RecruitmentApplicationSchema = new mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecruitmentConfig",
      required: true,
      index: true,
    },
    department: { type: String, required: true, trim: true },
    responses: { type: Object, default: {} },
  },
  {
    timestamps: true,
    collection: "recruitment_applications",
  }
);

RecruitmentApplicationSchema.index({ formId: 1, department: 1 });
RecruitmentApplicationSchema.index({ createdAt: -1 });

export default mongoose.models.RecruitmentApplication ||
  mongoose.model("RecruitmentApplication", RecruitmentApplicationSchema);
