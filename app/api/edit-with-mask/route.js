// API Proxy for edit with mask
import { NextResponse } from "next/server";

const BACKEND_BASE_URL = "http://4.194.251.51:8000";

export async function POST(request) {
  try {
    console.log("Edit-with-mask API route called");

    // Get the request body as FormData
    const formData = await request.formData();

    // Log form data details (without logging the actual images)
    const originalImage = formData.get("original_image");
    const maskImage = formData.get("mask_image");
    const prompt = formData.get("prompt");

    console.log("Form data received:", {
      hasOriginalImage: !!originalImage,
      originalImageType: originalImage?.type || "unknown",
      originalImageSize: originalImage?.size || "unknown",
      hasMaskImage: !!maskImage,
      maskImageType: maskImage?.type || "unknown",
      maskImageSize: maskImage?.size || "unknown",
      prompt: prompt || "no prompt",
    });

    // Validate required fields
    if (!originalImage) {
      return NextResponse.json(
        { error: "No original image provided" },
        { status: 400 }
      );
    }

    if (!maskImage) {
      return NextResponse.json(
        { error: "No mask image provided" },
        { status: 400 }
      );
    }

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "No prompt provided" },
        { status: 400 }
      );
    }

    // Validate image types
    if (!originalImage.type || !originalImage.type.startsWith("image/")) {
      return NextResponse.json(
        {
          error:
            "Invalid original image type. Please upload a valid image file.",
        },
        { status: 400 }
      );
    }

    // Validate image sizes (max 10MB each)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (originalImage.size > maxSize) {
      return NextResponse.json(
        { error: "Original image too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    if (maskImage.size > maxSize) {
      return NextResponse.json(
        { error: "Mask image too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    console.log(
      "Forwarding request to backend:",
      `${BACKEND_BASE_URL}/edit-with-mask`
    );

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_BASE_URL}/edit-with-mask`, {
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
    console.error("Edit with mask proxy error:", error);
    return NextResponse.json(
      {
        error: "Failed to edit with mask",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
