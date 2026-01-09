import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./api/utils/db.js";
import authRoutes from "./api/auth/authRoutes.js";

dotenv.config();
connectDB();

const app = express();

// Update CORS to allow multiple origins or the required one
const allowedOrigins = [
  "http://localhost:5173", // Local development
  "https://pera-pio.vercel.app", // Production URL
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API running" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
