"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home,
  Sparkles,
  ImageIcon,
  PanelsTopLeft,
  Wand2,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/text-to-image", label: "Text to Image", icon: Sparkles },
  { href: "/dashboard/image-update", label: "Image Update", icon: ImageIcon },
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

export default function DashboardWorkspaceNav({ hideOverview = false }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const filteredLinks = hideOverview
    ? NAV_LINKS.filter((link) => link.href !== "/dashboard")
    : NAV_LINKS;

  const renderLinks = (variant = "desktop") =>
    filteredLinks.map((link) => {
      const Icon = link.icon;
      const isActive = pathname === link.href;
      return (
        <Link
          key={link.href}
          href={link.href}
          onClick={() => setIsMobileOpen(false)}
          className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 ${
            isActive
              ? "border-gold/80 bg-gold/10 text-white shadow-[0_10px_30px_rgba(212,175,55,0.25)]"
              : "border-white/15 bg-white/[0.04] text-white/70 hover:border-gold/50 hover:bg-gold/10 hover:text-white"
          } ${variant === "mobile" ? "w-full justify-center" : "justify-center"}`}
        >
          <Icon className="h-4 w-4" />
          <span>{link.label}</span>
        </Link>
      );
    });

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-4 shadow-[0_20px_60px_rgba(6,8,20,0.35)] backdrop-blur">
      <div className="hidden items-center justify-between gap-3 md:flex">
        <div className="flex gap-3">{renderLinks()}</div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/70 transition-all duration-300 hover:border-gold/70 hover:bg-gold/10 hover:text-white"
        >
          Dashboard
        </Link>
      </div>
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className="flex w-full items-center justify-between rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition-all duration-300 hover:border-gold/70 hover:bg-gold/10 hover:text-white"
        >
          Workspace menu
          <span aria-hidden="true">{isMobileOpen ? "−" : "+"}</span>
        </button>
        {isMobileOpen && (
          <div className="mt-3 flex flex-col gap-2">
            {renderLinks("mobile")}
            <Link
              href="/dashboard"
              onClick={() => setIsMobileOpen(false)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/70 transition-all duration-300 hover:border-gold/70 hover:bg-gold/10 hover:text-white"
            >
              Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
