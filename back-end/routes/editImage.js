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

router.post("/edit-image", upload.single("image"), async (req, res) => {
  const { prompt, style = "realistic", size = "1024x1024" } = req.body;
  const image = req.file; // The uploaded file

  if (!prompt || prompt.trim() === "") {
    return res.status(400).json({ error: "Missing prompt parameter" });
  }

  if (!image) {
    return res.status(400).json({ error: "No image file provided." });
  }

  const filename = image.originalname || "";
  const ext = filename.split(".").pop().toLowerCase();
  if (!["png", "jpg", "jpeg"].includes(ext)) {
    return res.status(400).json({
      error: "Allowed image types: png, jpg, jpeg",
    });
  }

  try {
    // Create a File object from the buffer
    const imageFile = new File([image.buffer], filename, {
      type: image.mimetype,
    });

    const full_prompt = `${prompt} in a ${style} style`;

    const response = await openai.images.edit({
      model: "gpt-image-1",
      image: imageFile,
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
    console.error(`Error during image editing: ${e.name} - ${e.message}`);
    console.error(e.stack);

    if (e.status) {
      return res.status(e.status).json({ error: e.message });
    }
    return res
      .status(500)
      .json({ error: e.message || "An unknown error occurred" });
  }
});

export default router;
