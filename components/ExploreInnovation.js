"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { MdOutlineArrowLeft, MdOutlineArrowRight } from "react-icons/md";
import BlogCard from "./BlogCard";

export default function ExploreInnovation() {
  const [blogViewportRef, blogEmbla] = useEmblaCarousel({
    loop: true,
    align: "start",
  });
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchArticles() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/articles?limit=6");
        if (!response.ok) {
          throw new Error("Failed to load articles");
        }
        const data = await response.json();
        if (isMounted) {
          setArticles(Array.isArray(data.articles) ? data.articles : []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to fetch articles:", err);
          setError("Unable to load latest articles right now.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchArticles();
    return () => {
      isMounted = false;
    };
  }, []);

  const featuredArticles = useMemo(() => {
    const picks = articles.slice(0, 6);
    return picks.length > 0 ? [...picks, ...picks] : picks;
  }, [articles]);
  const hasArticles = featuredArticles.length > 0;
  const autoplayRef = useRef(null);
  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      window.clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);
  const startAutoplay = useCallback(() => {
    if (!hasArticles) return;
    if (autoplayRef.current) return;
    autoplayRef.current = window.setInterval(() => {
      blogEmbla?.scrollNext();
    }, 6000);
  }, [blogEmbla, hasArticles]);
  useEffect(() => {
    if (!blogEmbla || !hasArticles) return undefined;
    startAutoplay();
    blogEmbla.on("pointerDown", stopAutoplay);
    blogEmbla.on("pointerUp", startAutoplay);
    blogEmbla.on("pointerLeave", startAutoplay);
    return () => {
      stopAutoplay();
      blogEmbla.off("pointerDown", stopAutoplay);
      blogEmbla.off("pointerUp", startAutoplay);
      blogEmbla.off("pointerLeave", startAutoplay);
    };
  }, [blogEmbla, hasArticles, startAutoplay, stopAutoplay]);
  const blogPrev = useCallback(() => {
    if (!hasArticles) return;
    stopAutoplay();
    blogEmbla?.scrollPrev();
    startAutoplay();
  }, [blogEmbla, hasArticles, startAutoplay, stopAutoplay]);
  const blogNext = useCallback(() => {
    if (!hasArticles) return;
    stopAutoplay();
    blogEmbla?.scrollNext();
    startAutoplay();
  }, [blogEmbla, hasArticles, startAutoplay, stopAutoplay]);

  return (
    <div>
      <div className="flex justify-between">
        <h3 className="text-2xl md:text-5xl font-semibold text-left w-full lg:w-8/12 bg-gradient-to-r from-gold from-10% to-white to-90% bg-clip-text text-transparent">
          Fresh ideas from the kAIro AI team
        </h3>
        <div className="hidden lg:flex justify-end mt-auto">
          <div className="md:flex gap-2">
            <button
              type="button"
              onClick={blogPrev}
              disabled={!hasArticles}
              className="flex justify-center items-center w-12 h-12 bg-gradient-to-r from-gold from-20% to-white/50 to-80% rounded-full border border-gold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 disabled:cursor-not-allowed disabled:opacity-40 hover:from-dark-blue hover:to-gold"
              aria-label="View previous blog insight"
            >
              <MdOutlineArrowLeft className="w-10 h-10 text-white transition-all duration-300" />
            </button>
            <button
              type="button"
              onClick={blogNext}
              disabled={!hasArticles}
              className="flex justify-center items-center w-12 h-12 bg-gradient-to-r from-gold from-20% to-white/50 to-80% rounded-full border border-gold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 disabled:cursor-not-allowed disabled:opacity-40 hover:from-dark-blue hover:to-gold"
              aria-label="View next blog insight"
            >
              <MdOutlineArrowRight className="w-10 h-10 text-white transition-all duration-300" />
            </button>
          </div>
        </div>
      </div>

      <div
        className="overflow-hidden py-4 lg:py-12"
        ref={blogViewportRef}
        aria-label="Latest blog posts slider"
      >
        {isLoading ? (
          <div className="flex gap-6 px-3 sm:px-4">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex-[0_0_90%] animate-pulse rounded-3xl border border-white/10 bg-white/5 sm:flex-[0_0_55%] lg:flex-[0_0_26%]"
              >
                <div className="h-40 rounded-t-3xl bg-white/10" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-24 rounded-full bg-white/10" />
                  <div className="h-4 w-3/4 rounded-full bg-white/15" />
                  <div className="h-4 w-2/3 rounded-full bg-white/13" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-100">
            {error}
          </div>
        ) : (
          <div className="flex">
            {featuredArticles.map((article, index) => (
              <div
                key={`${article.id}-${index}`}
                className="flex-[0_0_90%] px-3 sm:flex-[0_0_55%] sm:px-4 lg:flex-[0_0_26%] lg:px-4"
              >
                <BlogCard
                  href={`/blog/${article.id}`}
                  image1={article.image1}
                  image2={article.image2}
                  title={article.title}
                  excerpt={article.excerpt}
                  date={article.date}
                  author={
                    article.readTime
                      ? `${article.author} · ${article.readTime}`
                      : article.author
                  }
                  variant="compact"
                  maxTitleLength={70}
                  hideExcerpt
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
