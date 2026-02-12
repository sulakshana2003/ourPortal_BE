import Album from "../Models/Album.js";
import Photo from "../Models/Photo.js";

// Create an album
export const createAlbum = async (req, res) => {
  try {
    const { title, description } = req.body;

    const album = await Album.create({
      userId: req.user.id,
      portalCode: req.user.portalCode,
      title,
      description: description || "",
    });

    res.status(201).json({
      message: "Album created! 📸💕",
      album,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all albums
export const getAllAlbums = async (req, res) => {
  try {
    const albums = await Album.find({ 
      $or: [
        { portalCode: req.user.portalCode },
        { userId: req.user.id, portalCode: { $exists: false } }
      ]
    })
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 });

    res.json(albums);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get single album with its photos
export const getAlbumById = async (req, res) => {
  try {
    const album = await Album.findOne({
      _id: req.params.id,
      portalCode: req.user.portalCode,
    }).populate("userId", "name avatar");

    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    const photos = await Photo.find({ albumId: album._id }).sort({
      createdAt: -1,
    });

    res.json({ album, photos });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete album (and optionally keep/delete photos? For now, keep photos but unlink)
export const deleteAlbum = async (req, res) => {
  try {
    const album = await Album.findOne({
      _id: req.params.id,
      portalCode: req.user.portalCode,
    });
    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    // Unlink photos from this album (only those in the same portal)
    await Photo.updateMany(
      { albumId: req.params.id, portalCode: req.user.portalCode },
      { albumId: null }
    );

    await Album.findByIdAndDelete(req.params.id);
    res.json({ message: "Album deleted 🗑️" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
