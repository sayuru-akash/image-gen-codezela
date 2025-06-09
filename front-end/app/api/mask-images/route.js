// app/api/inpaint-image/route.js
import { NextResponse } from "next/server";

// Environment variables required for this API route
const REQUIRED_ENV_VARS = [
  "AZURE_OPENAI_API_KEY",
  "AZURE_OPENAI_DEPLOYMENT",
  "NEXT_PUBLIC_AZURE_ENDPOINT",
];

// Supported DALL-E sizes for inpainting
const DALL_E_VALID_SIZES = {
  SQUARE: "1024x1024",
  WIDE: "1792x1024",
  TALL: "1024x1792",
};

// Maximum file size for uploads (10MB)
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

// Helper function to check for missing environment variables
function checkEnvironmentVariables() {
  const missingVars = REQUIRED_ENV_VARS.filter((v) => !process.env[v]);
  if (missingVars.length > 0) {
    console.error(`Missing environment variables: ${missingVars.join(", ")}`);
    return {
      isValid: false,
      errorResponse: NextResponse.json(
        {
          error: `Server configuration error: Missing environment variables: ${missingVars.join(
            ", "
          )}.`,
        },
        { status: 500 }
      ),
    };
  }
  return { isValid: true };
}

/**
 * Validates uploaded file
 * @param {File} file - The uploaded file
 * @param {string} fieldName - Name of the field for error messages
 * @returns {object} Validation result
 */
function validateFile(file, fieldName) {
  if (!file) {
    return {
      isValid: false,
      error: `${fieldName} is required.`,
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `${fieldName} is too large. Maximum size is 10MB.`,
    };
  }

  // Check file type
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `${fieldName} must be a PNG, JPEG, JPG, or GIF image.`,
    };
  }

  return { isValid: true };
}

async function fileToBase64(file) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString("base64");
}

export async function POST(request) {
  const envCheck = checkEnvironmentVariables();
  if (!envCheck.isValid) {
    return envCheck.errorResponse;
  }

  let formData;
  try {
    formData = await request.formData();
  } catch (e) {
    console.error("Invalid form data in request:", e);
    return NextResponse.json(
      { error: "Invalid request body: Expected form data." },
      { status: 400 }
    );
  }

  // Extract form fields
  const originalImageFile = formData.get("original_image");
  const maskImageFile = formData.get("mask_image");
  const prompt = formData.get("prompt");
  const style = formData.get("style");
  const n = parseInt(formData.get("n") || "1", 10);

  // Validate required fields
  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return NextResponse.json(
      { error: "Prompt is required to generate an inpainted image." },
      { status: 400 }
    );
  }

  if (!style || typeof style !== "string") {
    return NextResponse.json(
      { error: "Style is required to generate an inpainted image." },
      { status: 400 }
    );
  }

  // Validate original image file
  const originalImageValidation = validateFile(
    originalImageFile,
    "Original image"
  );
  if (!originalImageValidation.isValid) {
    return NextResponse.json(
      { error: originalImageValidation.error },
      { status: 400 }
    );
  }

  // Validate mask image file
  const maskImageValidation = validateFile(maskImageFile, "Mask image");
  if (!maskImageValidation.isValid) {
    return NextResponse.json(
      { error: maskImageValidation.error },
      { status: 400 }
    );
  }

  try {
    // Convert files to base64 for Azure OpenAI API
    const originalImageBase64 = await fileToBase64(originalImageFile);
    const maskImageBase64 = await fileToBase64(maskImageFile);

    // Create image objects for the API
    const originalImage = `data:${originalImageFile.type};base64,${originalImageBase64}`;
    const maskImage = `data:${maskImageFile.type};base64,${maskImageBase64}`;

    // Determine appropriate size (you might want to get actual image dimensions here)
    // For now, we'll use square as default
    const DALL_E_size_to_use = DALL_E_VALID_SIZES.SQUARE;

    console.log(`Using DALL-E size: ${DALL_E_size_to_use} for inpainting`);

    // Create the final prompt with style
    const finalPrompt = `${prompt.trim()}, in a ${style.toLowerCase()} style`;

    // Azure OpenAI API endpoint for image editing (inpainting)
    const azureApiUrl = `${process.env.NEXT_PUBLIC_AZURE_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/images/edits?api-version=2024-02-01`;

    // Prepare the request body for Azure OpenAI
    const requestBody = {
      image: originalImage,
      mask: maskImage,
      prompt: finalPrompt,
      size: DALL_E_size_to_use,
      n: Math.min(Math.max(n, 1), 4), // Ensure n is between 1 and 4
    };

    const azureResponse = await fetch(azureApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.AZURE_OPENAI_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    if (!azureResponse.ok) {
      let errorData;
      try {
        errorData = await azureResponse.json();
      } catch {
        console.error(
          "Azure API responded with non-OK status, and failed to parse error JSON:",
          azureResponse.statusText
        );
        return NextResponse.json(
          {
            error: `Azure API error: ${azureResponse.status} ${azureResponse.statusText}`,
          },
          { status: azureResponse.status }
        );
      }

      console.error("Azure API Error:", errorData);
      return NextResponse.json(
        {
          error:
            errorData.error?.message ||
            "Failed to inpaint image due to an Azure API error.",
        },
        { status: azureResponse.status }
      );
    }

    const responseData = await azureResponse.json();

    if (!responseData.data || responseData.data.length === 0) {
      console.error(
        "Azure API response did not contain image data:",
        responseData
      );
      return NextResponse.json(
        {
          error:
            "Image inpainting succeeded but no image data was returned from Azure.",
        },
        { status: 500 }
      );
    }

    // Extract image URLs from the response
    const imageUrls = responseData.data
      .map((item) => item.url)
      .filter((url) => url);

    if (imageUrls.length === 0) {
      return NextResponse.json(
        {
          error:
            "No valid image URLs were returned from the inpainting service.",
        },
        { status: 500 }
      );
    }

    // Return the first inpainted image (or all if multiple requested)
    return NextResponse.json({
      inpaintedImage: imageUrls[0],
      images: imageUrls,
      prompt: finalPrompt,
      style: style,
    });
  } catch (error) {
    console.error("Error during image inpainting API call:", error);

    if (error.name === "TypeError" && error.message.includes("fetch")) {
      return NextResponse.json(
        {
          error:
            "Network error: Could not connect to the image inpainting service.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error:
          error.message ||
          "An internal server error occurred while inpainting the image.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method Not Allowed. Please use POST with form data." },
    { status: 405 }
  );
}
