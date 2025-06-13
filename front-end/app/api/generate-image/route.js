//app/api/generate-image/route.js
import { NextResponse } from "next/server";

// Constants
const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || "http://localhost:8000";
const FASTAPI_ENDPOINT = `${FASTAPI_BASE_URL}/im-gen`;

// Helper Functions
function checkEnvironmentVariables() {
  if (!process.env.FASTAPI_BASE_URL) {
    console.warn("FASTAPI_BASE_URL not set, using default: http://localhost:8000");
  }
  return { isValid: true };
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
      { error: "The 'prompt' field is required to generate an image." },
      { status: 400 }
    );
  }

  // Create enhanced prompt with style if provided
  const enhancedPrompt = style 
    ? `A high-quality, detailed image of: ${userPrompt}, in the style of ${style.toLowerCase()}.`
    : userPrompt;

  try {
    // Prepare request payload for FastAPI
    const fastApiPayload = {
      prompt: enhancedPrompt,
      number_of_images: n
    };

    // Call FastAPI endpoint
    const fastApiResponse = await fetch(FASTAPI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fastApiPayload),
    });

    if (!fastApiResponse.ok) {
      const errorData = await fastApiResponse.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.detail || "Failed to generate image";
      console.error("FastAPI Error:", {
        status: fastApiResponse.status,
        error: errorMessage,
        details: errorData,
      });
      return NextResponse.json(
        { error: errorMessage },
        { status: fastApiResponse.status }
      );
    }

    const responseData = await fastApiResponse.json();

    // Check if the FastAPI response indicates failure
    if (!responseData.success) {
      console.error("FastAPI returned failure:", responseData);
      return NextResponse.json(
        { error: responseData.error || responseData.message || "Image generation failed" },
        { status: 400 }
      );
    }

    // Convert FastAPI response format to match expected frontend format
    const imageUrls = [];
    
    if (responseData.images && Array.isArray(responseData.images)) {
      for (const image of responseData.images) {
        if (image.format === "base64" && image.data) {
          // Convert base64 to data URL format expected by frontend
          const dataUrl = `data:image/png;base64,${image.data}`;
          imageUrls.push(dataUrl);
        }
      }
    }

    if (imageUrls.length === 0) {
      console.error("No valid images returned from FastAPI:", responseData);
      return NextResponse.json(
        { error: "Image generation succeeded but no valid images were returned" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      images: imageUrls,
      message: responseData.message 
    });

  } catch (error) {
    console.error("Unexpected error calling FastAPI:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method Not Allowed. Please use POST to generate an image." },
    { status: 405, headers: { Allow: "POST" } }
  );
}