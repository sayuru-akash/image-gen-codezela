import Footer from "@/components/Footer";
import NavigationBar from "@/components/navigationbar";
import Image from "next/image";
import Link from "next/link";
import { MdEmail } from "react-icons/md";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

export const metadata = {
  title: "Join kAIro AI | AI Image Studio by Codezela Technologies",
  description:
    "Launch your kAIro AI workspace and collaborate with Codezela Technologies on AI-driven visuals, localisation, and campaign delivery built for Sri Lankan brands.",
  keywords: [
    "kAIro AI signup",
    "Codezela Technologies",
    "AI image studio Sri Lanka",
    "AI design platform",
    "Sri Lanka marketing tech",
  ],
};

const HIGHLIGHTS = [
  {
    title: "Brand-safe templates",
    body: "Bring your palettes, tone, and prompt guardrails so every render ships on-brand.",
  },
  {
    title: "Sri Lanka-first localisation",
    body: "Adapt visuals for Sinhala, Tamil, and English campaigns in a single workspace.",
  },
  {
    title: "Collaborative reviews",
    body: "Share boards, collect annotations, and approve final assets with stakeholders.",
  },
];

export default function SignUp() {
  return (
    <>
      <div className="bg-black">
        <NavigationBar />
      </div>

      <main className="bg-[#05070d]">
        <section className="px-4 pb-14 pt-14 md:px-10 lg:px-20">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 overflow-hidden rounded-[2.5rem] border border-white/15 bg-white/[0.05] p-6 shadow-[0_40px_120px_rgba(6,8,20,0.55)] backdrop-blur md:grid-cols-2 md:p-10">
            <div className="flex flex-col justify-between gap-8">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-gold/70">
                  Get started
                </p>
                <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
                  Create your kAIro AI workspace with Codezela Technologies.
                </h1>
                <p className="mt-4 max-w-xl text-sm text-white/70 sm:text-base">
                  Build campaign visuals, product renders, and localisation flows in one studio engineered in Sri Lanka. Choose how you onboard your team below.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <GoogleAuthButton
                  label="Continue with Google"
                  className="w-full rounded-full bg-gradient-to-r from-gold/90 via-gold to-white/70 px-6 py-4 text-sm font-semibold text-dark-blue transition-all duration-300 hover:from-white/30 hover:via-gold hover:to-gold/80 hover:text-white focus-visible:ring-2 focus-visible:ring-gold/70 md:w-96"
                />
                <Link
                  href="/signup/form"
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-6 py-4 text-sm font-semibold text-white transition-all duration-300 hover:border-gold hover:bg-gold/15 focus-visible:ring-2 focus-visible:ring-gold/70 md:w-96"
                >
                  <MdEmail className="h-5 w-5" />
                  Continue with Email
                </Link>
                <p className="text-xs text-white/60">
                  By continuing, you agree to the{" "}
                  <Link
                    href="https://codezela.com/privacy-policy"
                    target="_blank"
                    rel="noreferrer"
                    className="text-gold transition-colors duration-200 hover:text-white"
                  >
                    Codezela Technologies terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy-policy"
                    className="text-gold transition-colors duration-200 hover:text-white"
                  >
                    privacy policy
                  </Link>
                  .
                </p>
              </div>
            </div>

            <div className="relative flex min-h-[26rem] items-center justify-center rounded-[2rem] border border-white/15 bg-gradient-to-br from-white/10 via-white/0 to-gold/10 p-6">
              <Image
                src="/images/signup-bg.png"
                alt="kAIro AI collaborative workspace preview"
                width={680}
                height={520}
                className="w-full max-w-xl object-contain"
                priority
              />
              <Image
                src="/images/awards-icon.svg"
                alt="Codezela accolade"
                width={160}
                height={160}
                className="absolute -bottom-10 right-6 hidden rounded-3xl border border-white/20 bg-white/10 p-4 shadow-[0_20px_60px_rgba(6,8,20,0.45)] sm:block"
              />
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 md:px-10 lg:px-20">
          <div className="mx-auto grid max-w-6xl gap-6 rounded-3xl border border-white/15 bg-white/[0.04] p-8 shadow-[0_30px_100px_rgba(6,8,20,0.45)] sm:grid-cols-3 sm:p-10">
            {HIGHLIGHTS.map((item) => (
              <div key={item.title} className="space-y-3">
                <p className="text-xs uppercase tracking-[0.32em] text-gold/70">
                  {item.title}
                </p>
                <p className="text-sm text-white/70">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
