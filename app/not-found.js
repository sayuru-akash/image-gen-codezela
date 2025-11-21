import Footer from "@/components/Footer";
import Navigationbar from "@/components/navigationbar";
import Image from "next/image";
import Link from "next/link";

const quickLinks = [
  {
    title: "See kAIro features",
    description: "Jump to the platform capabilities and workflow demos.",
    href: "/#features",
  },
  {
    title: "Visit the blog",
    description: "Read the latest AI imaging insights from Codezela.",
    href: "/blog",
  },
  {
    title: "Browse FAQs",
    description: "Get quick answers on pricing, access, and governance.",
    href: "/faq",
  },
  {
    title: "Talk to us",
    description: "Request a guided tour or enterprise onboarding session.",
    href: "https://codezela.com/contact",
    external: true,
  },
];

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#05070D] via-[#0A0F1C] to-[#05070D] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-12 top-6 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute right-12 top-24 h-80 w-80 rounded-full bg-secondary-accent/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
      </div>

      <Navigationbar />

      <main className="relative mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-8 lg:px-12">
        <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/70">
              404 · Off-route
            </span>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              This page is missing, but your creative flow does not have to be.
            </h1>
            <p className="text-sm text-white/70 sm:text-base">
              The link you followed is no longer available or the content moved. Jump back
              into the platform, explore our capabilities, or talk with the Codezela team
              to get where you need to go.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-gold via-white/80 to-gold px-6 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-dark-blue shadow-[0_25px_60px_rgba(212,175,55,0.35)] transition-transform duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
              >
                Back to home
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/[0.04] px-6 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-white/85 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:text-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
              >
                Open dashboard
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {quickLinks.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noreferrer" : undefined}
                  className="group rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/70 hover:bg-gold/10"
                >
                  <p className="text-xs uppercase tracking-[0.24em] text-white/60">
                    {item.external ? "External" : "Site link"}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-white/65">{item.description}</p>
                  <span className="mt-3 inline-flex items-center text-xs font-semibold uppercase tracking-[0.3em] text-gold opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Explore →
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.05] p-3 shadow-[0_40px_120px_rgba(5,7,13,0.65)] backdrop-blur">
              <div className="absolute inset-3 -z-10 rounded-[1.8rem] bg-gradient-to-br from-white/5 via-transparent to-gold/15" />
              <div className="relative h-[360px] overflow-hidden rounded-[1.5rem]">
                <Image
                  alt="AI-driven creative workspace illustration"
                  src="/images/image-24.jpg"
                  fill
                  className="object-cover"
                  priority
                  sizes="(min-width: 1024px) 28rem, 90vw"
                />
              </div>
              <div className="mt-4 flex items-center justify-between rounded-[1.2rem] border border-white/12 bg-white/[0.03] px-4 py-3 text-sm text-white/75">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-gold/80">
                    Quick routes
                  </p>
                  <p className="font-medium text-white">
                    Dashboard · Blog · FAQ · Contact
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-gold/20 text-xs font-semibold uppercase tracking-[0.22em] text-dark-blue shadow-[0_12px_35px_rgba(212,175,55,0.35)]">
                  kAIro
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
