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
    year: { type: String, trim: true, default: "" },
    responses: { type: Object, default: {} },
    points: { type: String, default: "", trim: true },
    comments: { type: String, default: "", trim: true },
    feedback: { type: String, default: "", trim: true }, // "positive" | "waitlist" | "negative" | ""
    evaluatedBy: { type: String, default: "" },
    evaluatedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    collection: "recruitment_applications",
    strict: false,
  }
);

RecruitmentApplicationSchema.index({ formId: 1, department: 1 });
RecruitmentApplicationSchema.index({ formId: 1, year: 1 });
RecruitmentApplicationSchema.index({ createdAt: -1 });

export default mongoose.models.RecruitmentApplication ||
  mongoose.model("RecruitmentApplication", RecruitmentApplicationSchema);
