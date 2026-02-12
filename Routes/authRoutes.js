import { Router } from "express";
import { register, login, getMe, joinPortal } from "../Controller/authController.js";
import { authenticate } from "../Middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getMe);
router.post("/join-portal", authenticate, joinPortal);

export default router;
