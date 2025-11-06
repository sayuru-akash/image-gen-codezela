import FaqCard from "@/components/FaqCard";
import Footer from "@/components/Footer";
import NavigationBar from "@/components/navigationbar";
import Signup from "@/components/Signup";
import Faqs from "@/data/faqs.json";
import Image from "next/image";

export const metadata = {
  title: "FAQ | kAIro AI Support by Codezela Technologies",
  description:
    "Get answers to common questions about kAIro AI, the creative automation platform engineered by Codezela Technologies for marketing and product teams.",
  keywords: [
    "kAIro AI FAQ",
    "Codezela Technologies support",
    "AI creative automation questions",
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
        <div className="rounded-4xl border border-white/20 bg-white/5 p-3 backdrop-blur">
          <div className="relative overflow-hidden rounded-[2.5rem]">
            <Image
              alt="kAIro AI knowledge base background"
              src="/images/image-24.jpg"
              fill
              className="object-cover"
              quality={60}
              priority
            />
            <div className="relative grid h-full grid-cols-1 gap-6 bg-gradient-to-r from-dark-blue/95 via-dark-blue/90 to-dark-blue/70 p-10 lg:grid-cols-5">
              <div className="lg:col-span-3 flex flex-col justify-center">
                <p className="text-xs uppercase tracking-[0.35em] text-gold/70">
                  Help centre
                </p>
                <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
                  Everything you need to launch with kAIro AI.
                </h1>
                <p className="mt-4 text-sm text-white/70">
                  Answers curated by Codezela Technologies so your team can deploy AI-assisted
                  creative workflows with clarity and confidence.
                </p>
              </div>
              <div className="hidden lg:block lg:col-span-2">
                <div className="relative h-full">
                  <div className="absolute top-10 right-16 h-32 w-32 overflow-hidden rounded-3xl border border-white/20 bg-white/5">
                    <Image
                      alt="AI strategy icon"
                      src="/images/image-25.jpg"
                      fill
                      className="object-cover"
                      quality={60}
                    />
                  </div>
                  <div className="absolute bottom-8 left-10 h-40 w-40 overflow-hidden rounded-3xl border border-white/20 bg-white/5">
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

      <section className="grid gap-4 px-4 pb-20 md:px-20 lg:px-40">
        {Faqs.map((faq) => (
          <FaqCard key={faq.id} faq={faq} />
        ))}
      </section>

      <div id="contact" className="scroll-mt-24">
        <Signup />
      </div>
      <Footer />
    </>
  );
}
