import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    queryType: String,
    otherQuery: String,
    message: String,
    isSpecial: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Prevent re-registering model
export default mongoose.models.Contact || mongoose.model("Contact", ContactSchema);
