import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image");

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Forward to Flask SAM server
    const flaskFormData = new FormData();
    flaskFormData.append("image", imageFile);

    const flaskResponse = await fetch("http://4.194.98.230:8000/segment/", {
      method: "POST",
      body: flaskFormData,
    });

    if (!flaskResponse.ok) {
      const errorText = await flaskResponse.text();
      return NextResponse.json(
        { error: `Background removal failed: ${errorText}` },
        { status: 500 }
      );
    }

    // Convert response to base64
    const imageBuffer = await flaskResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");

    return NextResponse.json({ image: base64Image });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
