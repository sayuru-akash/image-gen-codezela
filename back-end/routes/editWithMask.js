import { Router } from "express";
import { OpenAI } from "openai";
import multer from "multer";
import dotenv from "dotenv";
import sharp from "sharp";

dotenv.config();

const router = Router();
const upload = multer();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error("Error: OPENAI_API_KEY not found in environment variables.");
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function ensurePngWithAlpha(maskBuffer) {
  try {
    const image = sharp(maskBuffer);
    const metadata = await image.metadata();

    if (metadata.format === "png" && metadata.hasAlpha) {
      return maskBuffer;
    }

    // Convert to RGBA PNG
    return await image.ensureAlpha().png().toBuffer();
  } catch (error) {
    console.error("Error processing mask image with sharp:", error);
    throw new Error("Failed to process mask image for RGBA PNG conversion.");
  }
}

router.post(
  "/edit-with-mask",
  upload.fields([
    { name: "original_image", maxCount: 1 },
    { name: "mask_image", maxCount: 1 },
  ]),
  async (req, res) => {
    const { prompt, style = "realistic", size = "1024x1024" } = req.body;
    const originalImage = req.files.original_image
      ? req.files.original_image[0]
      : null;
    const maskImage = req.files.mask_image ? req.files.mask_image[0] : null;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ error: "Missing prompt parameter" });
    }

    if (!originalImage || !maskImage) {
      return res
        .status(400)
        .json({ error: "Both original_image and mask_image are required." });
    }

    const imgFilename = originalImage.originalname || "";
    const mskFilename = maskImage.originalname || "";

    const imgExt = imgFilename.split(".").pop().toLowerCase();
    const mskExt = mskFilename.split(".").pop().toLowerCase();

    if (
      !["png", "jpg", "jpeg"].includes(imgExt) ||
      !["png", "jpg", "jpeg"].includes(mskExt)
    ) {
      return res.status(400).json({
        error: "Allowed image types for both original and mask: png, jpg, jpeg",
      });
    }

    try {
      const processedMaskBuffer = await ensurePngWithAlpha(maskImage.buffer);

      // Create File objects for OpenAI API
      const originalImageFile = new File([originalImage.buffer], imgFilename, {
        type: originalImage.mimetype,
      });
      const maskImageFile = new File([processedMaskBuffer], mskFilename, {
        type: "image/png",
      });

      const full_prompt = `${prompt} in a ${style} style`;

      const response = await openai.images.edit({
        model: "gpt-image-1",
        image: originalImageFile,
        mask: maskImageFile,
        prompt: full_prompt,
        size: size,
        n: 1,
      });

      if (
        response.data &&
        response.data.length > 0 &&
        response.data[0].b64_json
      ) {
        const image_b64 = response.data[0].b64_json;
        const data_url = `data:image/png;base64,${image_b64}`;
        return res.status(200).json({ image_url: data_url });
      } else {
        return res
          .status(500)
          .json({ error: "Image editing failed: no image data returned." });
      }
    } catch (e) {
      console.error(
        `Error during image editing with mask: ${e.name} - ${e.message}`
      );
      console.error(e.stack);

      if (e.status) {
        return res.status(e.status).json({ error: e.message });
      }
      return res
        .status(500)
        .json({ error: e.message || "An unknown error occurred" });
    }
  }
);

export default router;
