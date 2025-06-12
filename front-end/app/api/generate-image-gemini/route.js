//app/api/generate-image-gemini/route.js
import { NextResponse } from "next/server";
import { GoogleAuth } from "google-auth-library";

// Constants
const REQUIRED_ENV_VARS = ["GOOGLE_PROJECT_ID", "GOOGLE_CLOUD_LOCATION"];
const MODEL_ID = "imagen-4.0-generate-preview-05-20";

// Helper Functions
function checkEnvironmentVariables() {
  const missingVars = REQUIRED_ENV_VARS.filter((v) => !process.env[v]);
  if (missingVars.length > 0) {
    const errorMessage = `Server configuration error: Missing environment variables: ${missingVars.join(
      ", "
    )}.`;
    console.error(errorMessage);
    return {
      isValid: false,
      errorResponse: NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      ),
    };
  }
  return { isValid: true };
}

// Function to get a Google Cloud access token
async function getAccessToken() {
  const auth = new GoogleAuth({
    scopes: "https://www.googleapis.com/auth/cloud-platform",
  });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  return accessToken.token;
}

// API Route Handlers
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

  const { prompt: userPrompt, style, n = 1 } = requestBody;

  if (!userPrompt) {
    return NextResponse.json(
      { error: "The 'prompt' field is required." },
      { status: 400 }
    );
  }
  if (!style) {
    return NextResponse.json(
      { error: "The 'style' field is required." },
      { status: 400 }
    );
  }

  const finalPrompt = `A high-quality, detailed image of: ${userPrompt}, in the style of ${style.toLowerCase()}.`;

  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error("Failed to authenticate with Google Cloud.");
    }

    const vertexApiUrl = `https://${process.env.GOOGLE_CLOUD_LOCATION}-aiplatform.googleapis.com/v1/projects/${process.env.GOOGLE_PROJECT_ID}/locations/${process.env.GOOGLE_CLOUD_LOCATION}/publishers/google/models/${MODEL_ID}:predict`;

    // The payload structure for Vertex AI is very different.
    const requestPayload = {
      instances: [
        {
          prompt: finalPrompt,
        },
      ],
      parameters: {
        sampleCount: n,
        // other parameters like `aspectRatio`, `seed`, etc., can go here
      },
    };

    const vertexResponse = await fetch(vertexApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`, // Use Bearer Token for auth
      },
      body: JSON.stringify(requestPayload),
    });

    const responseData = await vertexResponse.json();

    if (!vertexResponse.ok) {
      const errorMessage =
        responseData.error?.message ||
        "Failed to generate image due to Vertex AI API error";
      console.error("Vertex AI API Error:", {
        status: vertexResponse.status,
        details: responseData.error,
      });
      return NextResponse.json(
        { error: errorMessage },
        { status: vertexResponse.status }
      );
    }

    // Extract base64 image data from the 'predictions' array
    const imageUrls = (responseData.predictions || [])
      .map((pred) => `data:image/png;base64,${pred.bytesBase64Encoded}`)
      .filter(Boolean);

    if (imageUrls.length === 0) {
      console.error("No images returned from Vertex AI API:", responseData);
      return NextResponse.json(
        { error: "Image generation succeeded but no image data was returned" },
        { status: 500 }
      );
    }

    return NextResponse.json({ images: imageUrls });
  } catch (error) {
    console.error("Unexpected error:", error.message, error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method Not Allowed. Use POST." },
    { status: 405, headers: { Allow: "POST" } }
  );
}
