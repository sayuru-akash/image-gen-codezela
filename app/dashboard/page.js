"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Wand2,
  Edit3,
  Palette,
  ImageIcon,
  Sparkles,
  ShieldCheck,
  Gauge,
  ArrowRight,
} from "lucide-react";

const TOOL_CARDS = [
  {
    title: "Text to Image Studio",
    description:
      "Generate concept art, hero imagery, and marketing-ready visuals with governed prompt templates and negative prompt controls.",
    href: "/dashboard/text-to-image",
    icon: <Wand2 className="h-7 w-7" />,
    gradient: "from-purple-500/20 via-purple-500/10 to-transparent",
  },
  {
    title: "Image Update Pipeline",
    description:
      "Refresh lighting, backgrounds, and campaign-specific elements without rerendering entire scenes or rebooking photo shoots.",
    href: "/dashboard/image-update",
    icon: <ImageIcon className="h-7 w-7" />,
    gradient: "from-sky-500/20 via-sky-500/10 to-transparent",
  },
  {
    title: "Mask & Brush Editor",
    description:
      "Paint directly on assets to isolate interface elements, packaging, or wardrobe, then regenerate only the masked regions with AI precision.",
    href: "/dashboard/edit-with-mask",
    icon: <Palette className="h-7 w-7" />,
    gradient: "from-emerald-500/20 via-emerald-500/10 to-transparent",
  },
  {
    title: "Dual Image Composer",
    description:
      "Blend styles, textures, and lighting between two references to craft mood boards, lookbooks, and cinematic key art in minutes.",
    href: "/dashboard/dual-image-editor",
    icon: <Edit3 className="h-7 w-7" />,
    gradient: "from-amber-500/20 via-amber-500/10 to-transparent",
  },
];

const QUICK_STATS = [
  {
    title: "Prompt Library",
    description:
      "Reuse governed prompt recipes curated by Codezela Technologies and your brand leads.",
    icon: <Sparkles className="h-6 w-6" />,
  },
  {
    title: "Governance & Audit",
    description:
      "Track asset lineage, approvals, and export history with enterprise-ready logging.",
    icon: <ShieldCheck className="h-6 w-6" />,
  },
  {
    title: "Performance Insights",
    description:
      "Measure which assets drive the strongest engagement and feed learnings into the next campaign.",
    icon: <Gauge className="h-6 w-6" />,
  },
];

export default function DashboardHome() {
  return (
    <ProtectedRoute>
      <DashboardHomeContent />
    </ProtectedRoute>
  );
}

function DashboardHomeContent() {
  const { data: session } = useSession();

  const initials =
    session?.user?.name?.[0] || session?.user?.email?.[0] || "U";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1622] via-[#141D2A] to-[#0C121B] text-white">
      <header className="border-b border-white/10 bg-black/30 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition-all duration-300 hover:border-gold/70 hover:bg-gold/10 hover:text-white"
            >
              <span aria-hidden="true">←</span> Home
            </Link>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-gold/70">
                kAIro AI workspace
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-white">
                Welcome back, {session?.user?.name || session?.user?.email}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2">
            <span className="text-xs text-white/70">
              Signed in as{" "}
              <span className="font-medium text-white">
                {session?.user?.name || session?.user?.email}
              </span>
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-gold to-white/70 text-sm font-semibold text-dark-blue">
              {initials.toUpperCase()}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-lg">
          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-gold/70">
                Creative mission control
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                Align every campaign with AI that understands your brand.
              </h2>
              <p className="mt-4 text-sm text-white/75">
                Launch new visuals, iterate on existing assets, and collaborate
                with Codezela Technologies inside a single governed workspace.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/dashboard/text-to-image"
                  className="inline-flex items-center rounded-full bg-gradient-to-r from-gold to-white/70 px-5 py-3 text-sm font-semibold text-dark-blue transition-all duration-300 hover:from-white/80 hover:to-gold"
                >
                  Start with Text to Image
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="https://codezela.com/contact"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:border-gold hover:text-gold"
                >
                  Request tailored onboarding
                </Link>
              </div>
            </div>
            <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/75">
              {QUICK_STATS.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-3"
                >
                  <span className="mt-1 text-gold">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-white/70">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-14">
          <h3 className="text-center text-xs uppercase tracking-[0.35em] text-gold/70">
            Creative suite
          </h3>
          <p className="mt-3 text-center text-2xl font-semibold text-white sm:text-3xl">
            Choose the workflow you want to activate.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {TOOL_CARDS.map((tool) => (
              <Link
                key={tool.title}
                href={tool.href}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold/60"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                />
                <div className="relative z-10 flex flex-col gap-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white">
                    {tool.icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white">
                      {tool.title}
                    </h4>
                    <p className="mt-2 text-sm text-white/75">
                      {tool.description}
                    </p>
                  </div>
                  <span className="mt-auto inline-flex items-center text-sm font-semibold text-gold transition-colors duration-300 group-hover:text-white">
                    Open tool
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
          <h3 className="text-2xl font-semibold text-white">
            Need a bespoke workflow?
          </h3>
          <p className="mt-4 text-sm text-white/75">
            Codezela Technologies designs custom integrations, private inference deployments, and
            white-label solutions tailored to your client or enterprise needs.
          </p>
          <Link
            href="https://codezela.com/contact"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:border-gold hover:text-gold"
          >
            Schedule a strategy session
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </section>
      </main>
    </div>
  );
}
