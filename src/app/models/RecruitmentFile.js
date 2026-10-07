import mongoose from "mongoose";

const RecruitmentFileSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true, trim: true },
    contentType: { type: String, required: true, default: "application/pdf" },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
  },
  {
    timestamps: true,
    collection: "recruitment_files",
  }
);

RecruitmentFileSchema.index({ createdAt: -1 });

export default mongoose.models.RecruitmentFile ||
  mongoose.model("RecruitmentFile", RecruitmentFileSchema);
