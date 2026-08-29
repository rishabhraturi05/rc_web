import mongoose from "mongoose";

const FreshersRegistrationSchema = new mongoose.Schema(
  {
    teamName: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    contactNo: { type: String, required: true },
    rollNo: { type: String, required: true, index: true },
    branch: { type: String, required: true },
    participants: {
      type: [mongoose.Schema.Types.Mixed],
      required: true,
    },
    considerRecruitment: { type: Boolean, default: false },
    attended: { type: Boolean, default: false },
    isWalkIn: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: "freshers_registrations",
  }
);

// Indexes for ultra-fast lookups on team participant roll numbers
FreshersRegistrationSchema.index({ "participants.rollNo": 1 });

export default mongoose.models.FreshersRegistration ||
  mongoose.model("FreshersRegistration", FreshersRegistrationSchema);
