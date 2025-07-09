import { Router } from "express";
import { uploadController, upload } from "../controllers/upload.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

// All upload routes require authentication
router.use(authenticate);

/**
 * @route POST /api/upload/image
 * @description Upload image file to Cloudinary
 * @access Private (Authenticated users)
 */
router.post("/image", upload.single("image"), uploadController.uploadImage);

/**
 * @route POST /api/upload/validate-url
 * @description Validate image URL
 * @access Private (Authenticated users)
 */
router.post("/validate-url", uploadController.validateImageUrl);

/**
 * @route DELETE /api/upload/image/:publicId
 * @description Delete image from Cloudinary
 * @access Private (Authenticated users)
 */
router.delete("/image/:publicId", uploadController.deleteImage);

export default router;
