import Voice from "../Models/Voice.js";
import { uploadFile, deleteFile } from "../Utils/supabase.js";
import dotenv from "dotenv";
dotenv.config();

const BUCKET = process.env.SUPABASE_BUCKET;

// Upload a voice note
export const uploadVoice = async (req, res) => {
  try {
    console.log("🎤 Upload Voice Request Received");
    console.log("Body:", req.body);
    console.log("File:", req.file);

    if (!req.file) {
      console.log("❌ No file received in request");
      return res.status(400).json({ message: "No audio file uploaded" });
    }

    const { title, duration } = req.body;
    const file = req.file;

    // Create unique file path
    const filePath = `voices/${Date.now()}-${file.originalname}`;

    // Upload to Supabase
    const publicUrl = await uploadFile(
      BUCKET,
      filePath,
      file.buffer,
      file.mimetype,
    );

    // Save to DB
    const voice = await Voice.create({
      userId: req.user.id,
      url: publicUrl,
      title: title || "Untitled Voice Note",
      duration: duration ? Number(duration) : 0,
    });

    res.status(201).json({
      message: "Voice note saved! 🎤💕",
      voice,
    });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

// Get all voice notes
export const getAllVoices = async (req, res) => {
  try {
    const voices = await Voice.find()
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 });

    res.json(voices);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a voice note
export const deleteVoice = async (req, res) => {
  try {
    const voice = await Voice.findById(req.params.id);
    if (!voice) {
      return res.status(404).json({ message: "Voice note not found" });
    }

    // Delete from Supabase
    const url = new URL(voice.url);
    const pathParts = url.pathname.split(
      `/storage/v1/object/public/${BUCKET}/`,
    );
    if (pathParts[1]) {
      await deleteFile(BUCKET, pathParts[1]);
    }

    await Voice.findByIdAndDelete(req.params.id);
    res.json({ message: "Voice note deleted 🗑️" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};
