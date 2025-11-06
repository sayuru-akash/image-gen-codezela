import { NextResponse } from "next/server";
import { getArticleBySlug } from "@/lib/articles";

export async function GET(_request, { params }) {
  try {
    const article = await getArticleBySlug(params.slug);
    if (!article) {
      return NextResponse.json(
        { message: "Article not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ article });
  } catch (error) {
    console.error("Failed to load article:", error);
    return NextResponse.json(
      { message: "Unable to load the requested article." },
      { status: 500 }
    );
  }
}
