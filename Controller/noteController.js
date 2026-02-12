import Note from "../Models/Note.js";

// Create a note
export const createNote = async (req, res) => {
  try {
    const { title, content, color } = req.body;

    const note = await Note.create({
      userId: req.user.id,
      portalCode: req.user.portalCode,
      title,
      content: content || "",
      color: color || "#fff5f5",
    });

    res.status(201).json({
      message: "Note created! 📝💕",
      note,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all notes
export const getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find({ 
      $or: [
        { portalCode: req.user.portalCode },
        { userId: req.user.id, portalCode: { $exists: false } }
      ]
    })
      .populate("userId", "name avatar")
      .sort({ pinned: -1, createdAt: -1 });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get note by ID
export const getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      portalCode: req.user.portalCode,
    }).populate("userId", "name avatar");

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a note
export const updateNote = async (req, res) => {
  try {
    const { title, content, color } = req.body;

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, portalCode: req.user.portalCode },
      { title, content, color },
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json({
      message: "Note updated! ✏️",
      note,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Toggle pin
export const togglePin = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      portalCode: req.user.portalCode,
    });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    note.pinned = !note.pinned;
    await note.save();

    res.json({
      message: note.pinned ? "Note pinned! 📌" : "Note unpinned",
      note,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a note
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      portalCode: req.user.portalCode,
    });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json({ message: "Note deleted 🗑️" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
