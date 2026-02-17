import Photo from "../Models/Photo.js";
import { uploadFile, deleteFile } from "../Utils/supabase.js";
import dotenv from "dotenv";
dotenv.config();

const BUCKET = process.env.SUPABASE_BUCKET;

// Upload a photo
export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { caption, tags, albumId } = req.body;
    const file = req.file;

    // Create unique file path
    const filePath = `photos/${Date.now()}-${file.originalname}`;

    // Upload to Supabase
    const publicUrl = await uploadFile(
      BUCKET,
      filePath,
      file.buffer,
      file.mimetype
    );

    // Save to DB
    const photo = await Photo.create({
      userId: req.user.id,
      portalCode: req.user.portalCode,
      url: publicUrl,
      caption: caption || "",
      tags: tags ? JSON.parse(tags) : [],
      albumId: albumId || null,
    });

    res.status(201).json({
      message: "Photo uploaded! 📸💕",
      photo,
    });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

// Get all photos (both users see everything)
export const getAllPhotos = async (req, res) => {
  try {
    const photos = await Photo.find({ 
      $or: [
        { portalCode: req.user.portalCode },
        { userId: req.user.id, portalCode: { $exists: false } }
      ]
    })
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 });

    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a single photo
export const getPhotoById = async (req, res) => {
  try {
    const photo = await Photo.findOne({
      _id: req.params.id,
      portalCode: req.user.portalCode,
    }).populate("userId", "name avatar");

    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    res.json(photo);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a photo
export const deletePhoto = async (req, res) => {
  try {
    const photo = await Photo.findOne({
      _id: req.params.id,
      portalCode: req.user.portalCode,
    });
    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    // Extract file path from URL to delete from Supabase
    const url = new URL(photo.url);
    const pathParts = url.pathname.split(`/storage/v1/object/public/${BUCKET}/`);
    if (pathParts[1]) {
      await deleteFile(BUCKET, pathParts[1]);
    }

    await Photo.findByIdAndDelete(req.params.id);
    res.json({ message: "Photo deleted 🗑️" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

// Update a photo (caption, tags)
export const updatePhoto = async (req, res) => {
  try {
    const { caption, tags } = req.body;
    const photo = await Photo.findOne({
      _id: req.params.id,
      portalCode: req.user.portalCode,
    });

    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    if (caption !== undefined) photo.caption = caption;
    if (tags !== undefined) photo.tags = tags;

    await photo.save();

    const updated = await Photo.findById(photo._id).populate("userId", "name avatar");
    res.json({ message: "Photo updated! ✏️💕", photo: updated });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};
