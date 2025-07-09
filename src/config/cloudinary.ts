import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Validate Cloudinary configuration
function validateCloudinaryConfig() {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    console.warn(
      "⚠️ Cloudinary configuration is incomplete. Image upload will use placeholder images."
    );
    return false;
  }
  return true;
}

// Test Cloudinary connection
export async function testCloudinaryConnection(): Promise<void> {
  try {
    if (!validateCloudinaryConfig()) {
      console.log("⏭️ Skipping Cloudinary test - configuration incomplete");
      return;
    }

    console.log("🧪 Testing Cloudinary connection...");

    // Upload a test image
    const uploadResult = await cloudinary.uploader
      .upload(
        "https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg",
        {
          public_id: "test-connection",
          folder: "event-management/test",
          overwrite: true,
        }
      )
      .catch((error) => {
        console.error("❌ Cloudinary test upload failed:", error);
        return null;
      });

    if (uploadResult) {
      console.log(
        "✅ Cloudinary connection successful:",
        uploadResult.secure_url
      );

      // Test optimization URL generation
      const optimizeUrl = cloudinary.url("test-connection", {
        fetch_format: "auto",
        quality: "auto",
        folder: "event-management/test",
      });
      console.log("🔧 Optimized URL:", optimizeUrl);

      // Test transformation
      const autoCropUrl = cloudinary.url("test-connection", {
        crop: "auto",
        gravity: "auto",
        width: 500,
        height: 500,
        folder: "event-management/test",
      });
      console.log("✂️ Auto-crop URL:", autoCropUrl);
    }
  } catch (error) {
    console.error("❌ Cloudinary test failed:", error);
  }
}

// Helper function to upload image to Cloudinary
export async function uploadImageToCloudinary(
  imageUrl: string,
  publicId: string
): Promise<string> {
  try {
    if (!validateCloudinaryConfig()) {
      console.log(
        `⏭️ Using placeholder for ${publicId} - Cloudinary not configured`
      );
      return `https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=${encodeURIComponent(
        publicId
      )}`;
    }

    const result = await cloudinary.uploader.upload(imageUrl, {
      public_id: publicId,
      folder: "event-management/events",
      overwrite: true,
    });
    return result.secure_url;
  } catch (error) {
    console.error(`Failed to upload image ${publicId}:`, error);
    // Return a placeholder image URL if upload fails
    return `https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=${encodeURIComponent(
      publicId
    )}`;
  }
}

export { cloudinary };
