"use client";

import { BadgeCheck } from "lucide-react";

export default function WorkspaceHeader({
  eyebrow = "kAIro AI Studio",
  title,
  description,
  badges = [],
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-white/5 p-6 shadow-[0_30px_90px_rgba(6,8,20,0.45)] backdrop-blur sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-gold/70">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-white/70 sm:text-base">
            {description}
          </p>
        </div>
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {badges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70"
              >
                <BadgeCheck className="h-4 w-4 text-gold" />
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
