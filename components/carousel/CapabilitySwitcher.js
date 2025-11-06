"use client";

import {
  Eraser,
  Image as ImageIcon,
  PanelsTopLeft,
  Sparkles,
} from "lucide-react";

const OPTIONS = [
  {
    id: 1,
    title: "Text to Image",
    tagline: "Prompt led renders",
    Icon: Sparkles,
  },
  {
    id: 2,
    title: "Image Update",
    tagline: "Lighting & backdrop",
    Icon: ImageIcon,
  },
  {
    id: 3,
    title: "Edit with Mask",
    tagline: "Granular control",
    Icon: Eraser,
  },
  {
    id: 4,
    title: "AI Dual Image Editor",
    tagline: "Side-by-side vision",
    Icon: PanelsTopLeft,
  },
];

export default function CapabilitySwitcher({ active, onChange }) {
  return (
    <div className="mb-10 grid gap-4 sm:grid-cols-2">
      {OPTIONS.map(({ id, title, tagline, Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange?.(id)}
            className={`group relative overflow-hidden rounded-3xl border px-5 py-4 text-left transition-all duration-300 ${
              isActive
                ? "border-gold/80 bg-gradient-to-r from-gold/30 via-white/10 to-white/[0.02] shadow-[0_22px_65px_rgba(212,175,55,0.25)]"
                : "border-white/12 bg-white/[0.05] hover:border-gold/40 hover:bg-white/[0.08]"
            }`}
          >
            <span
              className={`pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-gold/40 via-transparent to-white/0 opacity-0 transition-opacity duration-300 ${
                isActive ? "opacity-100" : "group-hover:opacity-80"
              }`}
              aria-hidden="true"
            />
            <div className="relative flex items-center justify-between gap-4">
              <div>
                <p
                  className={`text-[11px] uppercase tracking-[0.32em] ${
                    isActive
                      ? "text-gold/80"
                      : "text-white/40 group-hover:text-gold/70"
                  }`}
                >
                  {tagline}
                </p>
                <p
                  className={`mt-2 text-base font-semibold ${
                    isActive
                      ? "text-white"
                      : "text-white/75 group-hover:text-white"
                  }`}
                >
                  {title}
                </p>
              </div>
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-2xl border text-white transition-colors duration-300 ${
                  isActive
                    ? "border-white/40 bg-white/20 text-dark-blue"
                    : "border-white/12 bg-white/[0.04] text-white/75 group-hover:border-gold/40 group-hover:bg-gold/15 group-hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
