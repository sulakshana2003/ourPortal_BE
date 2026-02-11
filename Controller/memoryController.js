import Memory from "../Models/Memory.js";
import { uploadFile, deleteFile } from "../Utils/supabase.js";
import dotenv from "dotenv";
dotenv.config();

const BUCKET = process.env.SUPABASE_BUCKET;

// Create a memory
export const createMemory = async (req, res) => {
  try {
    const { title, description, date, mood } = req.body;
    const photoUrls = [];

    // Upload multiple photos if provided
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const filePath = `memories/${Date.now()}-${file.originalname}`;
        const publicUrl = await uploadFile(
          BUCKET,
          filePath,
          file.buffer,
          file.mimetype
        );
        photoUrls.push(publicUrl);
      }
    }

    const memory = await Memory.create({
      userId: req.user.id,
      title,
      description: description || "",
      date: date || Date.now(),
      photos: photoUrls,
      mood: mood || "💕",
    });

    res.status(201).json({
      message: "Memory saved forever! 💖✨",
      memory,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all memories
export const getAllMemories = async (req, res) => {
  try {
    const memories = await Memory.find()
      .populate("userId", "name avatar")
      .sort({ date: -1 });

    res.json(memories);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get memory by ID
export const getMemoryById = async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id).populate(
      "userId",
      "name avatar"
    );

    if (!memory) {
      return res.status(404).json({ message: "Memory not found" });
    }

    res.json(memory);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a memory
export const updateMemory = async (req, res) => {
  try {
    const { title, description, date, mood } = req.body;
    const updateData = { title, description, date, mood };

    // Handle new photo uploads
    if (req.files && req.files.length > 0) {
      const newPhotoUrls = [];
      for (const file of req.files) {
        const filePath = `memories/${Date.now()}-${file.originalname}`;
        const publicUrl = await uploadFile(
          BUCKET,
          filePath,
          file.buffer,
          file.mimetype
        );
        newPhotoUrls.push(publicUrl);
      }

      // Get existing memory to merge photos
      const existingMemory = await Memory.findById(req.params.id);
      if (existingMemory) {
        updateData.photos = [...existingMemory.photos, ...newPhotoUrls];
      } else {
        updateData.photos = newPhotoUrls;
      }
    }

    const memory = await Memory.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!memory) {
      return res.status(404).json({ message: "Memory not found" });
    }

    res.json({
      message: "Memory updated! ✨",
      memory,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a memory
export const deleteMemory = async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) {
      return res.status(404).json({ message: "Memory not found" });
    }

    // Delete photos from Supabase
    for (const photoUrl of memory.photos) {
      try {
        const url = new URL(photoUrl);
        const pathParts = url.pathname.split(
          `/storage/v1/object/public/${BUCKET}/`
        );
        if (pathParts[1]) {
          await deleteFile(BUCKET, pathParts[1]);
        }
      } catch {
        // Continue even if a single delete fails
      }
    }

    await Memory.findByIdAndDelete(req.params.id);
    res.json({ message: "Memory deleted 🗑️" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
