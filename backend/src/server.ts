import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
import levelRoutes from "./api/routes/levelRoutes";
import authRoutes from "./api/routes/authRoutes";
import { requireAuth } from "./api/middleware/authMiddleware";

app.use("/api", authRoutes);
app.use("/api", requireAuth, levelRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});
