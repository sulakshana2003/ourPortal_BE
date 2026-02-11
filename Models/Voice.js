import mongoose from "mongoose";

const voiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    url: {
      type: String,
      required: [true, "Voice URL is required"],
    },
    title: {
      type: String,
      default: "Untitled Voice Note",
      trim: true,
    },
    duration: {
      type: Number, // seconds
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Voice = mongoose.model("Voice", voiceSchema);
export default Voice;
