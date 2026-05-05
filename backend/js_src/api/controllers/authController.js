"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.me = me;
// api/controllers/authController.ts
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("../logic/auth");
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
// Helper to generate JWT
function generateToken(userId) {
    return jsonwebtoken_1.default.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}
// POST /api/register
async function register(req, res) {
    try {
        const { username, password } = req.body;
        if (!username || !password)
            return res.status(400).json({ error: "Missing username or password" });
        const existing = await (0, auth_1.findUserByUsername)(username);
        if (existing)
            return res.status(409).json({ error: "Username already taken" });
        const user = await (0, auth_1.createUser)(username, password);
        if (!user || !user.id) {
            return res.status(409).json({ error: "Error while creating user" });
        }
        const token = generateToken(user.id);
        //console.log("Login token:", token);
        res.json({
            token,
            user: { id: user.id, username: user.username },
        });
    }
    catch (err) {
        console.error("DB ERROR:", err);
        if (err instanceof Error) {
            res.status(500).json({ error: err?.message ?? "unknown error" });
        }
        else {
            res.status(500).json({ error: "unknown error" });
        }
    }
}
// POST /api/login
async function login(req, res) {
    try {
        const { username, password } = req.body;
        if (!username || !password)
            return res.status(400).json({ error: "Missing username or password" });
        const user = await (0, auth_1.findUserByUsername)(username);
        if (!user)
            return res.status(401).json({ error: "Invalid credentials" });
        const ok = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!ok)
            return res.status(401).json({ error: "Invalid credentials" });
        const token = generateToken(user.id);
        //console.log("Login token:", token);
        res.json({
            token,
            user: { id: user.id, username: user.username },
        });
    }
    catch (err) {
        console.error("DB ERROR:", err);
        if (err instanceof Error) {
            res.status(500).json({ error: err?.message ?? "unknown error" });
        }
        else {
            res.status(500).json({ error: "unknown error" });
        }
    }
}
// GET /api/me (protected)
function me(req, res) {
    const user = req.user;
    res.json(user);
}
