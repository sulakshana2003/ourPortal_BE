import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../Models/User.js";
import Memory from "../Models/Memory.js";
import Note from "../Models/Note.js";
import Photo from "../Models/Photo.js";
import Voice from "../Models/Voice.js";
import Album from "../Models/Album.js";
import dotenv from "dotenv";
dotenv.config();

// Register a new user
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered 💔" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate unique portal code
    let portalCode;
    let isUnique = false;
    while (!isUnique) {
      portalCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      const existingCode = await User.findOne({ portalCode });
      if (!existingCode) isUnique = true;
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      portalCode,
    });

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, portalCode: user.portalCode },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(201).json({
      message: "Welcome to our portal! 💕",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        portalCode: user.portalCode,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials 💔" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials 💔" });
    }

    // Ensure user has a portalCode (for existing users)
    if (!user.portalCode) {
      let code;
      let isUnique = false;
      while (!isUnique) {
        code = Math.random().toString(36).substring(2, 10).toUpperCase();
        const existingCode = await User.findOne({ portalCode: code });
        if (!existingCode) isUnique = true;
      }
      await User.findByIdAndUpdate(user._id, { portalCode: code });
      user.portalCode = code;

      // Migrate all user's existing content to the new portalCode
      const filter = { userId: user._id };
      const update = { portalCode: user.portalCode };
      await Promise.all([
        Memory.updateMany(filter, update),
        Note.updateMany(filter, update),
        Photo.updateMany(filter, update),
        Voice.updateMany(filter, update),
        Album.updateMany(filter, update),
      ]);
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, portalCode: user.portalCode },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      message: "Welcome back! 💕",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        portalCode: user.portalCode,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get current user profile
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure user has a portalCode (for existing users)
    if (!user.portalCode) {
      let code;
      let isUnique = false;
      while (!isUnique) {
        code = Math.random().toString(36).substring(2, 10).toUpperCase();
        const existingCode = await User.findOne({ portalCode: code });
        if (!existingCode) isUnique = true;
      }
      await User.findByIdAndUpdate(user._id, { portalCode: code });
      user.portalCode = code;

      // Migrate all user's existing content to the new portalCode
      const filter = { userId: user._id };
      const update = { portalCode: user.portalCode };
      await Promise.all([
        Memory.updateMany(filter, update),
        Note.updateMany(filter, update),
        Photo.updateMany(filter, update),
        Voice.updateMany(filter, update),
        Album.updateMany(filter, update),
      ]);
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Join a portal
export const joinPortal = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: "Portal code is required" });
    }

    const partner = await User.findOne({ portalCode: code.toUpperCase() });
    if (!partner) {
      return res.status(404).json({ message: "Invalid portal code 💔" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { portalCode: partner.portalCode },
      { new: true }
    ).select("-password");

    // Migrate all user's existing content to the new portalCode
    const filter = { userId: req.user.id }; // Update everything they own to the new shared portal
    const update = { portalCode: partner.portalCode };
    
    await Promise.all([
      Memory.updateMany(filter, update),
      Note.updateMany(filter, update),
      Photo.updateMany(filter, update),
      Voice.updateMany(filter, update),
      Album.updateMany(filter, update),
    ]);

    // Generate new token with updated portalCode
    const token = jwt.sign(
      { id: user._id, email: user.email, portalCode: user.portalCode },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      message: "Successfully joined portal! 💕",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        portalCode: user.portalCode,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
