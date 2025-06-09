// app/api/generate-image/route.js
import { NextResponse } from "next/server";

// Environment variables required for this API route
const REQUIRED_ENV_VARS = [
  "AZURE_OPENAI_API_KEY",
  "AZURE_OPENAI_DEPLOYMENT",
  "NEXT_PUBLIC_AZURE_ENDPOINT",
];

// Supported DALL-E sizes
const DALL_E_VALID_SIZES = {
  SQUARE: "1024x1024",
  WIDE: "1792x1024",
  TALL: "1024x1792",
};

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
 * Determines the best DALL-E valid size based on the requested dimensions.
 * @param {string} requestedSize
 * @returns {string}
 */
function mapToDallEValidSize(requestedSize = "1024x1024") {
  const parts = requestedSize.split("x");
  if (parts.length !== 2) {
    console.warn(
      `Invalid requested size format: "${requestedSize}". Defaulting to square.`
    );
    return DALL_E_VALID_SIZES.SQUARE;
  }

  const requestedWidth = parseInt(parts[0], 10);
  const requestedHeight = parseInt(parts[1], 10);

  if (
    isNaN(requestedWidth) ||
    isNaN(requestedHeight) ||
    requestedWidth <= 0 ||
    requestedHeight <= 0
  ) {
    console.warn(
      `Invalid dimensions in requested size: "${requestedSize}". Defaulting to square.`
    );
    return DALL_E_VALID_SIZES.SQUARE;
  }

  const requestedAspectRatio = requestedWidth / requestedHeight;

  // Aspect ratios of DALL-E standard sizes
  const AR_SQUARE = 1024 / 1024;
  const AR_WIDE = 1792 / 1024;
  const AR_TALL = 1024 / 1792;

  // Calculate differences from DALL-E aspect ratios
  const diffSquare = Math.abs(requestedAspectRatio - AR_SQUARE);
  const diffWide = Math.abs(requestedAspectRatio - AR_WIDE);
  const diffTall = Math.abs(requestedAspectRatio - AR_TALL);

  // Choose the DALL-E size with the closest aspect ratio
  if (diffSquare <= diffWide && diffSquare <= diffTall) {
    return DALL_E_VALID_SIZES.SQUARE;
  } else if (diffWide < diffSquare && diffWide < diffTall) {
    return DALL_E_VALID_SIZES.WIDE;
  } else {
    return DALL_E_VALID_SIZES.TALL;
  }
}

export async function POST(request) {
  const envCheck = checkEnvironmentVariables();
  if (!envCheck.isValid) {
    return envCheck.errorResponse;
  }

  let requestBody;
  try {
    requestBody = await request.json();
  } catch (e) {
    console.error("Invalid JSON in request body:", e);
    return NextResponse.json(
      { error: "Invalid request body: Expected JSON." },
      { status: 400 }
    );
  }

  const {
    prompt: userPrompt,
    style,
    size: requestedSizeFromClient = "1024x1024",
    n = 1,
  } = requestBody;

  // Validate required fields from the request body
  if (!userPrompt) {
    return NextResponse.json(
      { error: "Prompt is required to generate an image." },
      { status: 400 }
    );
  }
  if (!style) {
    return NextResponse.json(
      { error: "Style is required to generate an image." },
      { status: 400 }
    );
  }

  // Determine the appropriate DALL-E size based on the client's request
  const DALL_E_size_to_use = mapToDallEValidSize(requestedSizeFromClient);
  console.log(
    `Requested size: ${requestedSizeFromClient}, Mapped DALL-E size: ${DALL_E_size_to_use}`
  );

  const finalAzurePrompt = `${userPrompt}, in a ${style.toLowerCase()} style, as a background scene.`;

  try {
    const azureApiUrl = `${process.env.NEXT_PUBLIC_AZURE_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/images/generations?api-version=2025-04-01-preview`;

    const azureResponse = await fetch(azureApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.AZURE_OPENAI_API_KEY,
      },
      body: JSON.stringify({
        prompt: finalAzurePrompt,
        size: DALL_E_size_to_use,
        n: Math.min(Math.max(n, 1), 4),
        quality: "high",
      }),
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
            "Failed to generate image due to an Azure API error.",
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
            "Image generation succeeded but no image data was returned from Azure.",
        },
        { status: 500 }
      );
    }

    const imageUrls = responseData.data
      .map((item) => item.url)
      .filter((url) => url);

    return NextResponse.json({ images: imageUrls });
  } catch (error) {
    console.error("Error during image generation API call:", error);
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      return NextResponse.json(
        {
          error:
            "Network error: Could not connect to the image generation service.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      {
        error:
          error.message ||
          "An internal server error occurred while generating the image.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method Not Allowed. Please use POST." },
    { status: 405 }
  );
}
