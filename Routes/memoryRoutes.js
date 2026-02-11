import { Router } from "express";
import multer from "multer";
import {
  createMemory,
  getAllMemories,
  getMemoryById,
  updateMemory,
  deleteMemory,
} from "../Controller/memoryController.js";
import { authenticate } from "../Middleware/auth.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

router.post("/", upload.array("photos", 10), createMemory);
router.get("/", getAllMemories);
router.get("/:id", getMemoryById);
router.put("/:id", upload.array("photos", 10), updateMemory);
router.delete("/:id", deleteMemory);

export default router;
