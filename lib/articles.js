import { connectToDatabase } from "@/lib/db";
import { calculateReadTime, countWords } from "./articleUtils";

const COLLECTION_NAME = "articles";

function mapArticle(document) {
  if (!document) return null;
  const {
    _id,
    slug,
    dateLabel,
    createdAt,
    updatedAt,
    publishedAt,
    ...rest
  } = document;
  const { readTime: storedReadTime, ...articleContent } = rest;
  const { minutes, label } = calculateReadTime(articleContent);
  const wordCount = countWords(articleContent);
  const readTime = minutes > 0 ? label : storedReadTime ?? null;

  return {
    id: slug,
    date: dateLabel,
    createdAt,
    updatedAt,
    publishedAt,
    ...articleContent,
    readTime,
    readTimeMinutes: minutes,
    wordCount,
  };
}

async function getCollection() {
  const client = await connectToDatabase();
  const db = client.db();
  return { client, collection: db.collection(COLLECTION_NAME) };
}

export async function getAllArticles(limit) {
  const { client, collection } = await getCollection();
  try {
    const cursor = collection.find({}).sort({ publishedAt: -1 });
    if (typeof limit === "number" && limit > 0) {
      cursor.limit(limit);
    }
    const articles = await cursor.toArray();
    return articles.map(mapArticle);
  } finally {
    await client.close();
  }
}

export async function getPaginatedArticles({
  page = 1,
  pageSize = 6,
} = {}) {
  const safePage = Number.isNaN(Number.parseInt(page, 10))
    ? 1
    : Math.max(1, Number.parseInt(page, 10));
  const safePageSize = Number.isNaN(Number.parseInt(pageSize, 10))
    ? 6
    : Math.max(1, Math.min(24, Number.parseInt(pageSize, 10)));
  const skip = (safePage - 1) * safePageSize;

  const { client, collection } = await getCollection();
  try {
    const [items, total] = await Promise.all([
      collection
        .find({})
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(safePageSize)
        .toArray(),
      collection.countDocuments(),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / safePageSize));

    return {
      articles: items.map(mapArticle),
      pagination: {
        page: safePage,
        pageSize: safePageSize,
        total,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPreviousPage: safePage > 1,
      },
    };
  } finally {
    await client.close();
  }
}

export async function getArticleBySlug(slug) {
  const { client, collection } = await getCollection();
  try {
    const article = await collection.findOne({ slug });
    return mapArticle(article);
  } finally {
    await client.close();
  }
}
