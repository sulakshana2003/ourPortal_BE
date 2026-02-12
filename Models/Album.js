import mongoose from "mongoose";

const albumSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    portalCode: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Album title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    coverPhoto: {
      type: String, // URL of the cover photo
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Album = mongoose.model("Album", albumSchema);
export default Album;
