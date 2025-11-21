import Image from "next/image";
import Link from "next/link";

export default function Signup() {
  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-dark-blue via-[#1A2334] to-black px-4 py-16 md:px-10 lg:px-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-dark-blue/40 opacity-60" />
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gold/20 blur-3xl opacity-80" />
        <div className="absolute -bottom-20 right-0 h-64 w-64 translate-x-1/3 rounded-full bg-gold/10 blur-3xl opacity-70" />
      </div>
      <div className="relative z-10 grid grid-cols-1 items-center gap-10 md:grid-cols-5">
        <div className="md:col-span-2 lg:col-span-2">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-4xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_40px_120px_-45px_rgba(15,22,34,0.9)]">
            <Image
              alt="Codezela crafts immersive AI experiences for bold brands."
              src="/images/hero-img.jpg"
              fill
              className="object-cover"
              quality={50}
              sizes="(min-width: 1024px) 24rem, 90vw"
              loading="lazy"
            />
          </div>
        </div>

        <div className="md:col-span-3 text-left">
          <p className="text-sm uppercase tracking-[0.35em] text-gold/80">
            Powered by Codezela
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
            Let&apos;s design your next AI breakthrough together.
          </h2>
          <p className="mt-6 text-base text-white/80 sm:text-lg lg:max-w-2xl">
            Codezela Technologies builds production-ready web, mobile, and
            platform experiences that bring machine learning to life. From
            bespoke models to intuitive dashboards like kAIro, we help teams
            launch faster and scale with confidence.
          </p>
          <ul className="mt-8 grid gap-3 text-sm text-white/70 sm:grid-cols-2">
            <li className="flex items-center gap-2">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-gold" />
              Full-stack web & mobile product engineering
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-gold" />
              Applied AI workflows & integrations
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-gold" />
              Secure, compliant data handling
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-gold" />
              Long-term support and co-innovation
            </li>
          </ul>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="https://codezela.com/contact"
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-gold to-white/70 px-8 py-3 text-sm font-semibold text-dark-blue shadow-lg transition-all duration-300 hover:from-white/80 hover:to-gold sm:w-max"
            >
              Talk to Codezela&apos;s AI Team
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex w-full items-center justify-center rounded-full border border-white/20 px-8 py-3 text-sm font-semibold text-white transition-all duration-300 hover:border-gold hover:text-gold sm:w-max"
            >
              Explore kAIro Tools
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
