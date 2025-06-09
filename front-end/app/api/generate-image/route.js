//app/api/generate-image/route.js
import { NextResponse } from "next/server";

// Constants
const REQUIRED_ENV_VARS = [
  "AZURE_OPENAI_API_KEY",
  "AZURE_OPENAI_DEPLOYMENT",
  "NEXT_PUBLIC_AZURE_ENDPOINT",
];

const API_VERSION = "2025-04-01-preview";

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

  const { prompt: userPrompt, style, size = "1024x1024", n = 1 } = requestBody;

  if (!userPrompt) {
    return NextResponse.json(
      { error: "The 'prompt' field is required to generate an image." },
      { status: 400 }
    );
  }
  if (!style) {
    return NextResponse.json(
      { error: "The 'style' field is required to generate an image." },
      { status: 400 }
    );
  }

  const finalAzurePrompt = `A high-quality, detailed image of: ${userPrompt}, in the style of ${style.toLowerCase()}.`;

  try {
    const azureApiUrl = `${process.env.NEXT_PUBLIC_AZURE_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/images/generations?api-version=${API_VERSION}`;

    const requestPayload = {
      prompt: finalAzurePrompt,
      size,
      n,
      quality: "auto",
      output_format: "png",
    };

    const azureResponse = await fetch(azureApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.AZURE_OPENAI_API_KEY,
      },
      body: JSON.stringify(requestPayload),
    });

    if (!azureResponse.ok) {
      const errorData = await azureResponse.json();
      const errorMessage =
        errorData.error?.message ||
        "Failed to generate image due to Azure API error";
      console.error("Azure API Error:", {
        status: azureResponse.status,
        error: errorMessage,
        details: errorData.error,
      });
      return NextResponse.json(
        { error: errorMessage },
        { status: azureResponse.status }
      );
    }

    const responseData = await azureResponse.json();

    // Handle content safety filtering
    if (responseData.prompt_filter_results?.[0]?.hate?.filtered) {
      return NextResponse.json(
        {
          error:
            "Prompt rejected by content safety system. Please modify your request.",
        },
        { status: 400 }
      );
    }

    // Extract image URLs
    const imageUrls = (responseData.data || [])
      .map((item) => {
        if (item.url) {
          return item.url;
        }
        if (item.b64_json) {
          return `data:image/png;base64,${item.b64_json}`;
        }
        return null;
      })
      .filter(Boolean);

    if (imageUrls.length === 0) {
      console.error("No images returned from Azure API:", responseData);
      return NextResponse.json(
        { error: "Image generation succeeded but no image URLs were returned" },
        { status: 500 }
      );
    }

    return NextResponse.json({ images: imageUrls });
  } catch (error) {
    console.error("Unexpected error:", error);
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
