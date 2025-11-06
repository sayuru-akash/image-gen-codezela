import FaqCard from "@/components/FaqCard";
import Footer from "@/components/Footer";
import NavigationBar from "@/components/navigationbar";
import Signup from "@/components/Signup";
import Faqs from "@/data/faqs.json";
import Image from "next/image";

export const metadata = {
  title: "FAQ | kAIro AI Support by Codezela Technologies",
  description:
    "Get answers to common questions about kAIro AI, the Sri Lankan-built AI image studio from Codezela Technologies for marketing, product, and agency teams.",
  keywords: [
    "kAIro AI FAQ",
    "Codezela Technologies support",
    "AI image generator help",
    "kAIro AI help centre",
  ],
};

export default function Faq() {
  return (
    <>
      <div className="bg-black">
        <NavigationBar />
      </div>

      <section className="relative px-4 pb-16 pt-14 md:px-10 lg:px-20">
        <div className="mx-auto max-w-6xl rounded-[2.5rem] border border-white/15 bg-white/[0.05] p-3 shadow-[0_40px_120px_rgba(6,8,20,0.55)] backdrop-blur">
          <div className="relative overflow-hidden rounded-[2.3rem]">
            <Image
              alt="kAIro AI knowledge base background"
              src="/images/image-24.jpg"
              fill
              className="object-cover"
              quality={60}
              priority
            />
            <div className="relative grid h-full grid-cols-1 gap-6 bg-gradient-to-r from-[#05070D]/95 via-[#05070D]/90 to-[#05070D]/70 px-8 py-12 lg:grid-cols-5 lg:px-12">
              <div className="flex flex-col justify-center lg:col-span-3">
                <p className="text-xs uppercase tracking-[0.35em] text-gold/70">
                  Help centre
                </p>
                <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
                  Everything you need to launch with kAIro AI.
                </h1>
                <p className="mt-4 max-w-2xl text-sm text-white/70 sm:text-base">
                  Answers curated by Codezela Technologies so your team can deploy AI-assisted
                  creative workflows with clarity and confidence.
                </p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/15 bg-white/[0.08] px-5 py-4 text-sm text-white/70">
                    <p className="font-semibold text-white">Enterprise onboarding</p>
                    <p className="mt-1 text-white/60">
                      Dedicated success teams connecting legal, creative, and engineering stakeholders.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/[0.08] px-5 py-4 text-sm text-white/70">
                    <p className="font-semibold text-white">24/5 global support</p>
                    <p className="mt-1 text-white/60">
                      Priority responses for high-impact launches and managed governance setups.
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative hidden h-full lg:col-span-2 lg:block">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative h-52 w-52 overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 backdrop-blur">
                    <Image
                      alt="AI strategy icon"
                      src="/images/image-25.jpg"
                      fill
                      className="object-cover"
                      quality={60}
                    />
                  </div>
                  <div className="absolute -bottom-8 right-10 h-44 w-44 overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 backdrop-blur">
                    <Image
                      alt="Creative collaboration icon"
                      src="/images/image-23.jpg"
                      fill
                      className="object-cover"
                      quality={60}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 md:px-10 lg:px-24">
        <div className="mx-auto grid max-w-6xl gap-6">
          {Faqs.map((faq) => (
            <FaqCard key={faq.id} faq={faq} />
          ))}
        </div>
      </section>

      <section className="px-4 pb-20 md:px-10 lg:px-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-3xl border border-white/15 bg-white/[0.04] p-8 text-white shadow-[0_30px_90px_rgba(6,8,20,0.45)] md:flex-row md:items-center md:justify-between md:gap-10">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-gold/70">
              Need a specialist?
            </p>
            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
              Talk with Codezela’s customer experience team.
            </h2>
            <p className="mt-2 text-sm text-white/70">
              We’ll walk through governance, localisation, and enterprise deployment options tailored to your organisation.
            </p>
          </div>
          <a
            href="https://codezela.com/contact"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-gold/70 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-gold transition-all duration-300 hover:border-gold hover:bg-gold/10"
          >
            Book a session
          </a>
        </div>
      </section>

      <div id="contact" className="scroll-mt-24">
        <Signup />
      </div>
      <Footer />
    </>
  );
}
