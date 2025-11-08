"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function DashboardTopNav() {
  const { data: session } = useSession();
  const initials =
    session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || "U";

  return (
    <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition-all duration-300 hover:border-gold/70 hover:bg-gold/10 hover:text-white"
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
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-left text-xs text-white/70 sm:text-sm md:w-auto md:justify-start">
          <span>
            Signed in as{" "}
            <span className="font-medium text-white">
              {session?.user?.name || session?.user?.email}
            </span>
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-gold to-white/70 text-sm font-semibold text-dark-blue">
            {initials.toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  );
}
