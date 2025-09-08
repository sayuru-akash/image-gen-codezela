// API Proxy for dual image editor
import { NextResponse } from "next/server";

const BACKEND_BASE_URL = "http://4.194.251.51:8000";

export async function POST(request) {
  try {
    // Get the request body as FormData
    const formData = await request.formData();

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_BASE_URL}/create-from-references`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Dual image editor proxy error:", error);
    return NextResponse.json(
      { error: "Failed to create from references", details: error.message },
      { status: 500 }
    );
  }
}
