// API Proxy for dual image editor
import { NextResponse } from "next/server";

const BACKEND_BASE_URL = "http://4.194.251.51:8000";

export async function POST(request) {
  try {
    // Get the request body as FormData
    const formData = await request.formData();

    // Log request details for debugging
    console.log("Proxy received request:");
    const logData = {};
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        logData[key] = {
          name: value.name,
          size: value.size,
          type: value.type,
        };
      } else {
        logData[key] = value;
      }
    }
    console.log("FormData contents:", logData);

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_BASE_URL}/create-from-references`, {
      method: "POST",
      body: formData,
    });

    console.log("Backend response status:", response.status);

    if (!response.ok) {
      // Get error details from backend
      let errorDetails;
      try {
        errorDetails = await response.json();
        console.error("Backend error response:", errorDetails);
      } catch (parseError) {
        console.error("Could not parse backend error:", parseError);
        errorDetails = {
          message: `Backend returned ${response.status}: ${response.statusText}`,
        };
      }

      // Return the backend error with proper status
      return NextResponse.json(
        {
          error: "Backend validation failed",
          detail:
            errorDetails.detail ||
            errorDetails.message ||
            `HTTP ${response.status}`,
          status: response.status,
          backend_error: errorDetails,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Backend success response keys:", Object.keys(data));
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy internal error:", error);
    return NextResponse.json(
      {
        error: "Internal proxy error",
        detail: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
