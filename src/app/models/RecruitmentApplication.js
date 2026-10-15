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
    positiveRemarks: { type: [String], default: [] },
    negativeRemarks: { type: [String], default: [] },
    feedback: { type: String, default: "", trim: true }, // "positive" | "waitlist" | "negative" | ""
    interviewSlot: { type: String, default: "", trim: true },
    interviewDate: { type: String, default: "", trim: true },
    panel: { type: String, default: "", trim: true },
    interviewStatus: { type: String, default: "pending", trim: true }, // "pending" | "in_queue" | "completed"
    queueDepartment: { type: String, default: "", trim: true },
    queueAddedAt: { type: Date, default: null },
    queueOrder: { type: Number, default: 0 },
    interviewCompletedAt: { type: Date, default: null },
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
RecruitmentApplicationSchema.index({ formId: 1, interviewStatus: 1 });
RecruitmentApplicationSchema.index({ formId: 1, queueDepartment: 1 });
RecruitmentApplicationSchema.index({ createdAt: -1 });

export default mongoose.models.RecruitmentApplication ||
  mongoose.model("RecruitmentApplication", RecruitmentApplicationSchema);
