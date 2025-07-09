import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { cloudinary } from "../config/cloudinary";
import { responseHelper } from "../utils";
import multer from "multer";
import path from "path";

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req: any, file: any, cb: any) => {
  // Accept only image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export class UploadController {
  /**
   * Upload image to Cloudinary
   */
  async uploadImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(responseHelper.error("Authentication required"));
        return;
      }

      if (!req.file) {
        res.status(400).json(responseHelper.error("No image file provided"));
        return;
      }

      // Convert buffer to base64 data URI
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

      // Generate unique public ID
      const publicId = `event-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 15)}`;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        public_id: publicId,
        folder: "event-management/events",
        resource_type: "image",
        transformation: [
          { width: 1200, height: 800, crop: "limit" },
          { quality: "auto", fetch_format: "auto" },
        ],
      });

      res.json(
        responseHelper.success("Image uploaded successfully", {
          url: result.secure_url,
          publicId: result.public_id,
          originalFilename: req.file.originalname,
        })
      );
    } catch (error) {
      console.error("Error uploading image:", error);

      // Handle specific Cloudinary errors
      if (error && typeof error === "object" && "message" in error) {
        const errorMessage = (error as { message: string }).message;
        if (errorMessage.includes("File size too large")) {
          res
            .status(400)
            .json(
              responseHelper.error(
                "Image file is too large. Maximum size is 5MB"
              )
            );
          return;
        } else if (errorMessage.includes("Invalid image file")) {
          res
            .status(400)
            .json(responseHelper.error("Invalid image file format"));
          return;
        }
      }

      res.status(500).json(responseHelper.error("Failed to upload image"));
    }
  }

  /**
   * Validate image URL
   */
  async validateImageUrl(req: Request, res: Response): Promise<void> {
    try {
      const { url } = req.body;

      // Check if URL is provided and not empty
      if (!url || typeof url !== "string" || url.trim() === "") {
        res.status(400).json(responseHelper.error("Image URL is required"));
        return;
      }

      const trimmedUrl = url.trim();

      // Basic URL validation
      try {
        new URL(trimmedUrl);
      } catch {
        res.status(400).json(responseHelper.error("Invalid URL format"));
        return;
      }

      // Check if URL points to an image by extension
      const imageExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".bmp",
      ];
      const urlPath = new URL(trimmedUrl).pathname.toLowerCase();
      const isImageUrl = imageExtensions.some((ext) => urlPath.endsWith(ext));

      if (!isImageUrl) {
        // If no file extension, check if URL looks like it could be an image
        // Check for common image hosting domains or query parameters
        const imageHostPatterns = [
          /\.(jpg|jpeg|png|gif|webp|bmp)/i,
          /cloudinary\.com/i,
          /imgur\.com/i,
          /unsplash\.com/i,
          /pexels\.com/i,
          /pixabay\.com/i,
          /\/image\//i,
          /\/photo\//i,
          /\/picture\//i,
        ];

        const isLikelyImage = imageHostPatterns.some((pattern) =>
          pattern.test(trimmedUrl)
        );

        if (!isLikelyImage) {
          res
            .status(400)
            .json(
              responseHelper.error(
                "URL does not appear to point to an image. Please ensure the URL ends with an image extension (.jpg, .png, etc.) or is from a known image hosting service."
              )
            );
          return;
        }
      }

      res.json(
        responseHelper.success("Image URL is valid", {
          url: trimmedUrl,
          isValid: true,
        })
      );
    } catch (error) {
      console.error("Error validating image URL:", error);
      res
        .status(500)
        .json(responseHelper.error("Failed to validate image URL"));
    }
  }

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(responseHelper.error("Authentication required"));
        return;
      }

      const { publicId } = req.params;

      if (!publicId) {
        res.status(400).json(responseHelper.error("Public ID is required"));
        return;
      }

      // Delete from Cloudinary
      const result = await cloudinary.uploader.destroy(
        `event-management/events/${publicId}`
      );

      if (result.result === "ok") {
        res.json(responseHelper.success("Image deleted successfully"));
      } else {
        res
          .status(404)
          .json(responseHelper.error("Image not found or already deleted"));
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json(responseHelper.error("Failed to delete image"));
    }
  }
}

export const uploadController = new UploadController();
