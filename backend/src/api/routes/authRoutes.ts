// api/routes/authRoutes.ts
import { Router } from "express";
import * as authController from "../controllers/authController";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authController.me); // protected

export default router;
