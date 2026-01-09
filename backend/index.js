import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./api/utils/db.js"; // Database connection
import authRoutes from "./api/auth/authRoutes.js"; // Authentication routes

dotenv.config();
connectDB();

const app = express();

// CORS configuration
app.use(
  cors({
    origin: process.env.VITE_API_URL || "http://localhost:3000/api",
    credentials: true,
  })
);

// Middleware to parse JSON
app.use(express.json());
app.use("/api/auth", authRoutes);

// Adjusted wildcard route
app.get("/*splat", (req, res) => {
  const { splat } = req.params; // Capture the wildcard segments
  res.json({ message: `You accessed: ${splat}` });
});

// Basic route to verify server is running
app.get("/", (req, res) => {
  res.json({ message: "API running" });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
