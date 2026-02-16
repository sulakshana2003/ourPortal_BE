import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import https from "https";
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
      ping: "/api/ping",
    },
  });
});

// Ping endpoint for keep-alive
app.get("/api/ping", (req, res) => {
  res.status(200).json({ message: "pong", timestamp: new Date().toISOString() });
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

  // Keep-alive mechanism for Render
  const RENDER_URL = process.env.RENDER_EXTERNAL_URL;
  if (RENDER_URL) {
    console.log(`🚀 Keep-alive active. Target: ${RENDER_URL}/api/ping`);
    setInterval(() => {
      https.get(`${RENDER_URL}/api/ping`, (res) => {
        console.log(`💓 Keep-alive ping sent: Status ${res.statusCode}`);
      }).on("error", (err) => {
        console.error("💔 Keep-alive ping failed:", err.message);
      });
    }, 10 * 60 * 1000); // 10 minutes
  } else {
    console.log("ℹ️ RENDER_EXTERNAL_URL not found. Keep-alive disabled.");
  }
});
