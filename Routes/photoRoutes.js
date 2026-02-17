import { Router } from "express";
import multer from "multer";
import {
  uploadPhoto,
  getAllPhotos,
  getPhotoById,
  deletePhoto,
  updatePhoto,
} from "../Controller/photoController.js";
import { authenticate } from "../Middleware/auth.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

router.post("/", upload.single("photo"), uploadPhoto);
router.get("/", getAllPhotos);
router.get("/:id", getPhotoById);
router.put("/:id", updatePhoto);
router.delete("/:id", deletePhoto);

export default router;
