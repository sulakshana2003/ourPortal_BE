import { Router } from "express";
import {
  createAlbum,
  getAllAlbums,
  getAlbumById,
  deleteAlbum,
} from "../Controller/albumController.js";
import { authenticate } from "../Middleware/auth.js";

const router = Router();
router.use(authenticate);

router.post("/", createAlbum);
router.get("/", getAllAlbums);
router.get("/:id", getAlbumById);
router.delete("/:id", deleteAlbum);

export default router;
