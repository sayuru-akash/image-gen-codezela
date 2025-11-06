"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FaqCard({ faq }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.04] shadow-[0_32px_90px_rgba(6,8,20,0.4)] transition-all duration-500 hover:-translate-y-1 hover:border-gold/60 hover:bg-white/[0.08]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold/15 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex w-full items-start justify-between gap-6 px-6 py-6 text-left sm:px-10 sm:py-8"
        aria-expanded={isOpen}
      >
        <div className="flex items-start gap-5">
          <span className="hidden h-12 w-12 items-center justify-center rounded-2xl border border-gold/40 bg-gradient-to-br from-gold/40 to-white/20 text-lg font-semibold text-dark-blue shadow-[0_12px_35px_rgba(212,175,55,0.35)] sm:flex">
            {faq.id}
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-gold/70">
              Insight
            </p>
            <h3 className="mt-2 text-lg font-semibold text-white sm:text-2xl">
              {faq.question}
            </h3>
          </div>
        </div>
        <span className="flex h-10 w-10 min-w-[2.5rem] items-center justify-center rounded-full border border-white/15 bg-white/[0.08] text-white transition-all duration-300 group-hover:border-gold/70 group-hover:bg-gold/20">
          <ChevronDown
            className={`h-5 w-5 transition-transform duration-300 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </span>
      </button>
      <div
        className={`px-6 pb-6 sm:px-10 sm:pb-8 transition-[max-height,opacity] duration-500 overflow-hidden ${
          isOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-sm leading-relaxed text-white/70 sm:text-base">
          {faq.answer}
        </p>
      </div>
    </article>
  );
}
