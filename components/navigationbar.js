"use client";
import { ArrowUpRight, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "Usage", href: "/#usage" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/#contact" },
];

export default function NavigationBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const welcomeLabel = session?.user?.name || session?.user?.email;
  const userInitials = useMemo(() => {
    if (!welcomeLabel) return "K";
    const matches = welcomeLabel
      .trim()
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((segment) => segment.charAt(0).toUpperCase());
    return matches.length ? matches.join("") : welcomeLabel.charAt(0).toUpperCase();
  }, [welcomeLabel]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  useEffect(() => {
    if (!isMenuOpen) {
      document.body.style.removeProperty("overflow");
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  return (
    <nav className="relative z-50 bg-transparent px-4 py-4 font-plus-jakarta text-white sm:px-6 lg:px-8">
      {/* <div className="max-w-7xl mx-auto"> */}
      <div className="w-11/12 mx-auto">
        {/* Desktop Navigation */}
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center hover:cursor-pointer">
            <Image
              src="/images/logo1.png"
              alt="kAIro Logo"
              width={32}
              height={32}
              className="rounded-full mr-1"
            />
            <span className="text-xl font-semibold tracking-wider">kAIro</span>
          </Link>

          {/* Desktop Menu Items */}
          <div className="hidden lg:flex items-center space-x-16 xl:space-x-20">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors duration-200 hover:text-amber-400"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Sign Up/Login Button */}
          {isAuthenticated ? (
            <div className="hidden lg:flex items-center gap-5">
              <div className="flex items-center gap-3 rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 pr-5 shadow-inner shadow-white/[0.04]">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 bg-gradient-to-br from-gold/60 to-white/35 text-sm font-semibold uppercase tracking-wide text-dark-blue shadow-[0_10px_30px_rgba(212,175,55,0.35)]">
                  {userInitials}
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] uppercase tracking-[0.32em] text-white/45">
                    Welcome back
                  </span>
                  <span className="text-sm font-medium text-white/90">
                    {welcomeLabel}
                  </span>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="group flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-5 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-white/80 transition-all duration-300 hover:border-red-400/80 hover:bg-red-500/10 hover:text-red-200"
              >
                <LogOut className="h-4 w-4 text-white/50 transition-colors duration-300 group-hover:text-red-300" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="hidden lg:flex items-center space-x-4">
              <Link
                href="/login"
                className="text-white text-xs font-semibold px-6 py-2 rounded-full border border-white/30 hover:border-gold hover:text-gold cursor-pointer transition-all duration-300"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-gradient-to-r from-gold from-50% to-white/60 to-95% text-white text-xs font-semibold px-8 py-3 rounded-full hover:from-white/20 hover:to-gold cursor-pointer transition-all duration-300"
              >
                Sign Up →
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden rounded-full border border-white/10 bg-white/[0.04] p-2 transition-all duration-200 hover:border-white/30 hover:bg-white/[0.08]"
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-[#05070d]/80 backdrop-blur-2xl transition-opacity duration-300"
              onClick={closeMenu}
              aria-hidden="true"
            />
            <div className="relative flex h-full flex-col px-4 pt-6 pb-8 sm:px-6">
              <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-white/[0.08] via-white/[0.02] to-white/[0.01] shadow-[0_40px_120px_rgba(8,10,25,0.65)]">
                <div className="flex items-center justify-between px-5 pb-4 pt-5">
                  <Link
                    href="/"
                    className="flex items-center gap-2 hover:opacity-90"
                    onClick={closeMenu}
                  >
                    <Image
                      src="/images/logo1.png"
                      alt="kAIro Logo"
                      width={36}
                      height={36}
                      className="rounded-full border border-white/20"
                    />
                    <div className="flex flex-col">
                      <span className="text-lg font-semibold tracking-wide">
                        kAIro
                      </span>
                      <span className="text-xs uppercase tracking-[0.3em] text-white/50">
                        Codezela Technologies
                      </span>
                    </div>
                  </Link>
                  <button
                    onClick={closeMenu}
                    className="rounded-full border border-white/10 bg-white/[0.04] p-2 transition-all duration-200 hover:border-white/30 hover:bg-white/[0.08]"
                    aria-label="Close navigation"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 space-y-8 overflow-y-auto px-5 pb-8 pt-2">
                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-white/70 shadow-inner shadow-white/[0.08]">
                    Build production-ready visuals at lightspeed with kAIro AI.
                    Stay in flow with guided prompts, mask editing, and instant brand guardrails.
                  </div>

                  <div className="space-y-3">
                    {NAV_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={closeMenu}
                        className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-base font-medium tracking-wide text-white/90 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/80 hover:bg-gold/15"
                      >
                        <span>{link.label}</span>
                        <ArrowUpRight className="h-5 w-5 text-white/40 transition-colors duration-300 group-hover:text-gold" />
                      </Link>
                    ))}
                  </div>

                  <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] px-5 py-5">
                    {isAuthenticated ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.05] px-4 py-4 shadow-inner shadow-white/[0.05]">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-gradient-to-br from-gold/60 to-white/35 text-sm font-semibold uppercase tracking-wide text-dark-blue shadow-[0_10px_30px_rgba(212,175,55,0.35)]">
                            {userInitials}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] uppercase tracking-[0.32em] text-white/45">
                              Welcome back
                            </span>
                            <span className="text-base font-medium text-white/90">
                              {welcomeLabel}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            handleSignOut();
                            closeMenu();
                          }}
                          className="group flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-6 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-white/80 transition-all duration-300 hover:border-red-400/80 hover:bg-red-500/10 hover:text-red-200"
                        >
                          <LogOut className="h-5 w-5 text-white/50 transition-colors duration-300 group-hover:text-red-300" />
                          Sign Out
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <Link
                          href="/login"
                          onClick={closeMenu}
                          className="w-full rounded-full border border-white/30 px-6 py-3 text-center text-sm font-semibold text-white transition-all duration-300 hover:border-gold hover:text-gold"
                        >
                          Login
                        </Link>
                        <Link
                          href="/signup"
                          onClick={closeMenu}
                          className="w-full rounded-full bg-gradient-to-r from-gold from-50% to-white/60 to-95% px-6 py-3 text-center text-sm font-semibold text-white transition-all duration-300 hover:from-white/20 hover:to-gold"
                        >
                          Sign Up →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-white/10 px-5 pb-5 pt-4">
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 text-sm text-white/60">
                    <div>
                      <p className="font-medium text-white/80">Need a guided tour?</p>
                      <p>Talk with our product specialists.</p>
                    </div>
                    <Link
                      href="/#contact"
                      onClick={closeMenu}
                      className="rounded-full border border-gold/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold transition-colors duration-300 hover:bg-gold/10"
                    >
                      Contact
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
