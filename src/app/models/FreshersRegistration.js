import mongoose from "mongoose";

const FreshersRegistrationSchema = new mongoose.Schema(
  {
    teamName: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    contactNo: { type: String, required: true },
    rollNo: { type: String, required: true },
    branch: { type: String, required: true },
    participants: [{ type: String, required: true }],
    considerRecruitment: { type: Boolean, default: false },
    attended: { type: Boolean, default: false },
    isWalkIn: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: "freshers_registrations",
  }
);

export default mongoose.models.FreshersRegistration ||
  mongoose.model("FreshersRegistration", FreshersRegistrationSchema);
