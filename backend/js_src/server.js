"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
const levelRoutes_1 = __importDefault(require("./api/routes/levelRoutes"));
const authRoutes_1 = __importDefault(require("./api/routes/authRoutes"));
const authMiddleware_1 = require("./api/middleware/authMiddleware");
app.use("/api", authRoutes_1.default);
app.use("/api", authMiddleware_1.requireAuth, levelRoutes_1.default);
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION:", err);
});
process.on("unhandledRejection", (reason) => {
    console.error("UNHANDLED REJECTION:", reason);
});
