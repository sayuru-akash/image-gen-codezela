//app/api/proxy-image/route.js
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Missing image URL parameter" },
        { status: 400 }
      );
    }

    const response = await fetch(imageUrl, {
      headers: {
        "api-key": process.env.AZURE_OPENAI_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const imageBuffer = await response.arrayBuffer();

    return new Response(imageBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'attachment; filename="generated-image.png"',
      },
    });
  } catch (error) {
    console.error("Proxy image error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to proxy image" },
      { status: 500 }
    );
  }
}
