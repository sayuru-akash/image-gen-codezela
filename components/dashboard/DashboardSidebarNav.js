"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Image,
  PanelsTopLeft,
  Sparkles,
  Wand2,
  Home,
} from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/text-to-image", label: "Text to Image", icon: Sparkles },
  { href: "/dashboard/image-update", label: "Image Update", icon: Image },
  {
    href: "/dashboard/edit-with-mask",
    label: "Mask Editor",
    icon: PanelsTopLeft,
  },
  {
    href: "/dashboard/dual-image-editor",
    label: "Dual Image",
    icon: Wand2,
  },
];

export default function DashboardSidebarNav() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const renderLinks = () =>
    NAV_LINKS.map((item) => {
      const Icon = item.icon;
      const isActive = pathname === item.href;
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setIsMobileOpen(false)}
          className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-300 ${
            isActive
              ? "border-gold/80 bg-gold/15 text-white shadow-[0_10px_30px_rgba(212,175,55,0.25)]"
              : "border-white/10 bg-white/[0.02] text-white/70 hover:border-gold/50 hover:bg-gold/10 hover:text-white"
          }`}
        >
          <Icon className="h-4 w-4" />
          <span>{item.label}</span>
        </Link>
      );
    });

  return (
    <>
      <nav className="sticky top-28 hidden min-w-[220px] flex-col gap-3 lg:flex">
        {renderLinks()}
      </nav>

      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition-all duration-300 hover:border-gold/70 hover:bg-gold/10 hover:text-white"
        >
          Menu
        </button>
        {isMobileOpen && (
          <div className="space-y-3 rounded-3xl border border-white/15 bg-black/40 p-4">
            {renderLinks()}
          </div>
        )}
      </div>
    </>
  );
}
