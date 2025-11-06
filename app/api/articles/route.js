import { NextResponse } from "next/server";
import { getAllArticles, getPaginatedArticles } from "@/lib/articles";

function parsePositiveInt(value) {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed <= 0 ? undefined : parsed;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parsePositiveInt(searchParams.get("limit"));
    const page = parsePositiveInt(searchParams.get("page"));
    const pageSize = parsePositiveInt(searchParams.get("pageSize"));

    if (limit) {
      const articles = await getAllArticles(limit);
      return NextResponse.json({ articles });
    }

    const { articles, pagination } = await getPaginatedArticles({
      page,
      pageSize,
    });

    return NextResponse.json({
      articles,
      pagination,
    });
  } catch (error) {
    console.error("Failed to load articles:", error);
    return NextResponse.json(
      { message: "Unable to load articles at this time." },
      { status: 500 }
    );
  }
}
