const WORDS_PER_MINUTE = 200;

function extractTextChunks(article = {}) {
  const chunks = [];

  if (article.title) chunks.push(article.title);
  if (article.excerpt) chunks.push(article.excerpt);

  if (Array.isArray(article.sections)) {
    article.sections.forEach((section) => {
      if (section?.heading) chunks.push(section.heading);
      if (Array.isArray(section?.paragraphs)) {
        chunks.push(section.paragraphs.filter(Boolean).join(" "));
      }
    });
  }

  return chunks
    .map((chunk) =>
      typeof chunk === "string" ? chunk.trim() : String(chunk ?? "").trim()
    )
    .filter(Boolean);
}

export function countWords(article) {
  const text = extractTextChunks(article).join(" ");
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

export function calculateReadTime(article) {
  const totalWords = countWords(article);
  if (totalWords === 0) {
    return {
      minutes: 0,
      label: "0 min read",
    };
  }

  const minutes = Math.max(1, Math.round(totalWords / WORDS_PER_MINUTE));
  return {
    minutes,
    label: `${minutes} min read`,
  };
}
