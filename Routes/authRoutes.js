import { Router } from "express";
import { register, login, getMe } from "../Controller/authController.js";
import { authenticate } from "../Middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getMe);

export default router;
