// API Proxy for image editing
import { NextResponse } from "next/server";

const BACKEND_BASE_URL = "http://4.194.251.51:8000";

export async function POST(request) {
  try {
    console.log("Edit-image API route called");

    // Get the request body as FormData
    const formData = await request.formData();

    // Log form data details (without logging the actual image)
    const image = formData.get("image");
    const prompt = formData.get("prompt");

    console.log("Form data received:", {
      hasImage: !!image,
      imageType: image?.type || "unknown",
      imageSize: image?.size || "unknown",
      prompt: prompt || "no prompt",
    });

    // Validate required fields
    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "No prompt provided" },
        { status: 400 }
      );
    }

    // Validate image type
    if (!image.type || !image.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Invalid image type. Please upload a valid image file." },
        { status: 400 }
      );
    }

    // Validate image size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (image.size > maxSize) {
      return NextResponse.json(
        { error: "Image too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    console.log(
      "Forwarding request to backend:",
      `${BACKEND_BASE_URL}/edit-image`
    );

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_BASE_URL}/edit-image`, {
      method: "POST",
      body: formData,
    });

    console.log("Backend response status:", response.status);

    if (!response.ok) {
      let errorText;
      try {
        errorText = await response.text();
        console.error("Backend error response:", errorText);
      } catch (e) {
        errorText = "Unknown backend error";
      }

      return NextResponse.json(
        {
          error: "Backend processing failed",
          details: errorText,
          status: response.status,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Backend response success, returning data");

    return NextResponse.json(data);
  } catch (error) {
    console.error("Image edit proxy error:", error);
    return NextResponse.json(
      {
        error: "Failed to edit image",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
