import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image");
    const prompt = formData.get("prompt") || "A futuristic city skyline"; // Optional default prompt

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Prepare FormData to send to FastAPI backend
    const backendFormData = new FormData();
    backendFormData.append("image", imageFile);
    backendFormData.append("prompt", prompt);

    const response = await fetch("http://localhost:8000/generate/", {
      method: "POST",
      body: backendFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Image generation failed: ${errorText}` },
        { status: response.status }
      );
    }

    const result = await response.json(); // { generated_images: [...] }
    return NextResponse.json(result); // Send back to frontend

  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
