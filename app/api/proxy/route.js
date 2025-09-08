// API Proxy to handle HTTP requests and avoid mixed content issues
import { NextResponse } from "next/server";

const BACKEND_BASE_URL = "http://4.194.251.51:8000";

export async function POST(request) {
  try {
    // Get the endpoint from query params or headers
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get("endpoint");

    if (!endpoint) {
      return NextResponse.json(
        { error: "Endpoint parameter is required" },
        { status: 400 }
      );
    }

    // Get the request body
    const body = await request.formData();

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_BASE_URL}${endpoint}`, {
      method: "POST",
      body: body,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Failed to proxy request", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get("endpoint");

    if (!endpoint) {
      return NextResponse.json(
        { error: "Endpoint parameter is required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_BASE_URL}${endpoint}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Failed to proxy request", details: error.message },
      { status: 500 }
    );
  }
}
