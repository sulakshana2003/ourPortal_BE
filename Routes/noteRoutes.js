import { Router } from "express";
import {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  togglePin,
  deleteNote,
} from "../Controller/noteController.js";
import { authenticate } from "../Middleware/auth.js";

const router = Router();
router.use(authenticate);

router.post("/", createNote);
router.get("/", getAllNotes);
router.get("/:id", getNoteById);
router.put("/:id", updateNote);
router.patch("/:id/pin", togglePin);
router.delete("/:id", deleteNote);

export default router;
