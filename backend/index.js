
    dotenv.config();
    connectDB();

    import express from "express";
    import cors from "cors";
    import dotenv from "dotenv";
    import connectDB from "./api/utils/db.js";
    import authRoutes from "./api/auth/authRoutes.js";


    const app = express();

    app.use(
      cors({
        origin: process.env.VITE_API_URL, // Use the environment variable
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
