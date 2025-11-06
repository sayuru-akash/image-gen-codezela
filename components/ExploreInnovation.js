"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import articles from "@/data/articles";
import { MdOutlineArrowLeft, MdOutlineArrowRight } from "react-icons/md";
import BlogCard from "./BlogCard";

export default function ExploreInnovation() {
  const [blogViewportRef, blogEmbla] = useEmblaCarousel({
    loop: true,
    align: "start",
  });
  const featuredArticles = useMemo(() => {
    const picks = articles.slice(0, 4);
    return picks.length > 0 ? [...picks, ...picks] : picks;
  }, []);
  const autoplayRef = useRef(null);
  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      window.clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);
  const startAutoplay = useCallback(() => {
    if (autoplayRef.current) return;
    autoplayRef.current = window.setInterval(() => {
      blogEmbla?.scrollNext();
    }, 6000);
  }, [blogEmbla]);
  useEffect(() => {
    if (!blogEmbla) return undefined;
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
  }, [blogEmbla, startAutoplay, stopAutoplay]);
  const blogPrev = useCallback(() => {
    stopAutoplay();
    blogEmbla?.scrollPrev();
    startAutoplay();
  }, [blogEmbla, startAutoplay, stopAutoplay]);
  const blogNext = useCallback(() => {
    stopAutoplay();
    blogEmbla?.scrollNext();
    startAutoplay();
  }, [blogEmbla, startAutoplay, stopAutoplay]);

  return (
    <div>
      <div className="flex justify-between">
        <h3 className="text-2xl md:text-5xl font-semibold text-left w-full lg:w-8/12 bg-gradient-to-r from-gold from-10% to-white to-90% bg-clip-text text-transparent">
          Fresh ideas from the kAIro AI and Codezela Technologies teams
        </h3>
        <div className="hidden lg:flex justify-end mt-auto">
          <div className="md:flex gap-2">
            <button
              type="button"
              onClick={blogPrev}
              className="flex justify-center items-center w-12 h-12 bg-gradient-to-r from-gold from-20% to-white/50 to-80% rounded-full hover:from-dark-blue hover:to-gold border border-gold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
              aria-label="View previous blog insight"
            >
              <MdOutlineArrowLeft className="w-10 h-10 text-white transition-all duration-300" />
            </button>
            <button
              type="button"
              onClick={blogNext}
              className="flex justify-center items-center w-12 h-12 bg-gradient-to-r from-gold from-20% to-white/50 to-80% rounded-full hover:from-dark-blue hover:to-gold border border-gold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
              aria-label="View next blog insight"
            >
              <MdOutlineArrowRight className="w-10 h-10 text-white transition-all duration-300" />
            </button>
          </div>
        </div>
      </div>

      <div
        className="overflow-hidden py-6 lg:py-20"
      ref={blogViewportRef}
      aria-label="Latest blog posts slider"
    >
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
                author={article.author}
                hideExcerpt
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
