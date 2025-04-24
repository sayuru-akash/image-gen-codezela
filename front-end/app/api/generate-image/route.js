// app/api/generate-image/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  // Verify environment variables
  const requiredEnvVars = [
    "AZURE_OPENAI_API_KEY",
    "AZURE_OPENAI_DEPLOYMENT",
    "NEXT_PUBLIC_AZURE_ENDPOINT",
  ];

  const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
  if (missingVars.length > 0) {
    return NextResponse.json(
      { error: `Missing environment variables: ${missingVars.join(", ")}` },
      { status: 500 }
    );
  }

  try {
    const { prompt, style, size = "1024x1024", n = 1 } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AZURE_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/images/generations?api-version=2024-02-01`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.AZURE_OPENAI_API_KEY,
        },
        body: JSON.stringify({
          prompt: `${prompt} (${style} style)`,
          size,
          n: Math.min(n, 4),
          quality: "standard",
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error?.message || "Azure API error" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ images: data.data.map((item) => item.url) });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
