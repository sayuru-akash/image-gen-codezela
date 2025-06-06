import { Router } from "express";
import { OpenAI } from "openai";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

const router = Router();
const upload = multer();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error("Error: OPENAI_API_KEY not found in environment variables.");
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

router.post(
  "/create-from-references",
  upload.array("images", 10),
  async (req, res) => {
    const { prompt, style = "realistic", size = "1024x1024" } = req.body;
    const images = req.files;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ error: "Missing prompt parameter" });
    }

    if (!images || images.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one reference image is required" });
    }

    if (images.length > 10) {
      return res
        .status(400)
        .json({ error: "Maximum 10 reference images allowed" });
    }

    // Validate all uploaded files
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const filename = image.originalname || `image_${i}`;
      const ext = filename.split(".").pop().toLowerCase();
      if (!["png", "jpg", "jpeg"].includes(ext)) {
        return res.status(400).json({
          error: `Image ${
            i + 1
          } (${filename}): Allowed image types are png, jpg, jpeg`,
        });
      }
    }

    try {
      const imageFiles = images.map((image, i) => {
        return new File(
          [image.buffer],
          image.originalname || `image_${i}.png`,
          { type: image.mimetype }
        );
      });

      const full_prompt = `${prompt} in a ${style} style`;

      const response = await openai.images.edit({
        model: "gpt-image-1",
        image: imageFiles[0],
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
          .json({ error: "Image creation failed: no image data returned." });
      }
    } catch (e) {
      console.error(
        `Error during image creation from references: ${e.name} - ${e.message}`
      );
      console.error(e.stack);

      // OpenAI API errors often have a  property
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
