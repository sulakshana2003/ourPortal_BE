import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./Models/index.js";

// Route imports
import authRoutes from "./Routes/authRoutes.js";
import photoRoutes from "./Routes/photoRoutes.js";
import noteRoutes from "./Routes/noteRoutes.js";
import memoryRoutes from "./Routes/memoryRoutes.js";
import voiceRoutes from "./Routes/voiceRoutes.js";
import albumRoutes from "./Routes/albumRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();
// Root
app.get("/", (req, res) => {
  res.json({
    message: "💕 Welcome to Our Love Portal API 💕",
    endpoints: {
      auth: "/api/auth",
      photos: "/api/photos",
      notes: "/api/notes",
      memories: "/api/memories",
      voices: "/api/voices",
    },
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/memories", memoryRoutes);
app.use("/api/voices", voiceRoutes);
app.use("/api/albums", albumRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("💔 Error:", err.message);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`💕 Love Portal server running on port ${PORT}`);
});
