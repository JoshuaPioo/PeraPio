    import express from "express";
    import cors from "cors";
    import dotenv from "dotenv";
    import connectDB from "./utils/db.js";

    dotenv.config();
    connectDB();

    const app = express();

    app.use(cors());
    app.use(express.json());

    app.get("/", (req, res) => {
      res.json({ message: "API running" });
    });

    export default app;
