import { Router } from "express";
import multer from "multer";
import {
  uploadVoice,
  getAllVoices,
  deleteVoice,
} from "../Controller/voiceController.js";
import { authenticate } from "../Middleware/auth.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

router.post("/", upload.single("audio"), uploadVoice);
router.get("/", getAllVoices);
router.delete("/:id", deleteVoice);

export default router;
