import mongoose from "mongoose";

const AddSecSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
      enum: ["Software", "Mechanical", "Embedded", "PR"],
    },
  },
  {
    timestamps: true,
    collection: "addsecs",
  }
);

export default mongoose.models.AddSec || mongoose.model("AddSec", AddSecSchema);
