import Footer from "@/components/Footer";
import NavigationBar from "@/components/navigationbar";
import Signup from "@/components/Signup";
import Image from "next/image";

export const metadata = {
  title: "Terms of Service | kAIro AI by Codezela Technologies",
  description:
    "Review the terms of service governing access to kAIro AI, the AI image studio delivered by Codezela Technologies.",
};

const termsSections = [
  {
    heading: "1. Acceptance of terms",
    paragraphs: [
      "By accessing kAIro AI you agree to this agreement between your organisation (“Customer”) and Codezela Technologies (“Provider”). These terms apply to the marketing site, application, APIs, and related services.",
    ],
  },
  {
    heading: "2. Account responsibilities",
    paragraphs: [
      "Customers are responsible for safeguarding login credentials, ensuring their team complies with usage guidelines, and notifying Codezela Technologies immediately of any suspected unauthorised access.",
    ],
  },
  {
    heading: "3. Permitted usage",
    paragraphs: [
      "kAIro AI may be used to generate, edit, and distribute imagery for lawful business purposes. Customers must not submit content that is illegal, infringes intellectual property, or violates privacy rights.",
      "Codezela Technologies reserves the right to suspend access that threatens platform stability, security, or compliance obligations.",
    ],
  },
  {
    heading: "4. Intellectual property",
    paragraphs: [
      "Customer retains ownership of prompts, uploads, and generated assets subject to the rights of underlying models and third-party providers. Codezela Technologies retains ownership of the kAIro AI platform, documentation, and associated IP.",
    ],
  },
  {
    heading: "5. Confidentiality and data protection",
    paragraphs: [
      "Both parties agree to safeguard confidential information. Codezela Technologies will process personal data in line with the Privacy Policy and applicable laws. Optional private inference deployments are available for sensitive workloads.",
    ],
  },
  {
    heading: "6. Service commitments",
    paragraphs: [
      "Codezela Technologies provides uptime, support response times, and feature updates according to the service level agreement outlined in your order form.",
    ],
  },
  {
    heading: "7. Limitation of liability",
    paragraphs: [
      "To the fullest extent permitted by law, Codezela Technologies’ aggregate liability arising out of these terms will not exceed the fees paid in the twelve months preceding the incident.",
    ],
  },
  {
    heading: "8. Termination",
    paragraphs: [
      "Either party may terminate for material breach with 30 days’ notice if the breach remains uncured. Upon termination, customers may export assets for 30 days before access is removed.",
    ],
  },
  {
    heading: "9. Changes to these terms",
    paragraphs: [
      "Codezela Technologies may update these terms to reflect product or legal changes. We will notify administrators in advance and note the effective date below.",
    ],
  },
  {
    heading: "10. Contact",
    paragraphs: [
      "For legal inquiries, contract questions, or compliance reviews, contact legal@codezela.com or visit codezela.com/contact.",
      "Effective date: March 2025.",
    ],
  },
];

export default function TermsOfService() {
  return (
    <>
      <div className="bg-black">
        <NavigationBar />
      </div>

      <section className="px-4 pb-14 pt-14 md:px-10 lg:px-20">
        <div className="mx-auto max-w-6xl rounded-[2.5rem] border border-white/15 bg-white/[0.05] p-3 shadow-[0_40px_120px_rgba(6,8,20,0.55)] backdrop-blur">
          <div className="relative overflow-hidden rounded-[2.3rem]">
            <Image
              alt="Terms of service cover imagery"
              src="/images/image-18.jpg"
              fill
              className="object-cover"
              sizes="(min-width: 1536px) 1152px, (min-width: 1280px) 1024px, 90vw"
              quality={65}
              priority
            />
            <div className="relative grid h-full grid-cols-1 gap-6 bg-gradient-to-r from-[#05070D]/95 via-[#05070D]/90 to-[#05070D]/70 px-8 py-12 lg:grid-cols-5 lg:px-12">
              <div className="flex flex-col justify-center lg:col-span-3">
                <p className="text-xs uppercase tracking-[0.35em] text-gold/70">
                  Terms of service
                </p>
                <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
                  Your agreement with Codezela Technologies.
                </h1>
                <p className="mt-4 max-w-2xl text-sm text-white/70 sm:text-base">
                  These terms outline your organisation’s rights and
                  responsibilities when using kAIro AI. Please read them
                  carefully before accessing the platform.
                </p>
              </div>
              <div className="relative hidden h-full lg:col-span-2 lg:block">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative h-52 w-52 overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 backdrop-blur">
                    <Image
                      alt="Legal compliance illustration"
                      src="/images/image-5.png"
                      fill
                      className="object-cover"
                      quality={70}
                    />
                  </div>
                  <div className="absolute -bottom-8 right-10 h-44 w-44 overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 backdrop-blur">
                    <Image
                      alt="Contract collaboration illustration"
                      src="/images/image-14.jpg"
                      fill
                      className="object-cover"
                      quality={70}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 md:px-10 lg:px-20">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
          <div className="rounded-4xl border border-white/15 bg-dark-blue/95 p-8 text-white shadow-[0_30px_90px_rgba(6,8,20,0.45)] sm:p-10">
            {termsSections.map((section) => (
              <div key={section.heading} className="mb-10 last:mb-0">
                <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                  {section.heading}
                </h2>
                {section.paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className="mt-4 text-sm leading-relaxed text-white/75 sm:text-base"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </div>
          <aside className="flex flex-col gap-6 rounded-4xl border border-white/15 bg-white/[0.04] p-6 text-white shadow-[0_30px_90px_rgba(6,8,20,0.35)] sm:p-8">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-gold/70">
                Legal support
              </p>
              <h3 className="mt-3 text-xl font-semibold text-white">
                Custom agreements for enterprise teams.
              </h3>
              <p className="mt-2 text-sm text-white/70">
                Codezela Technologies partners with legal, procurement, and
                security stakeholders to configure kAIro AI contracts that match
                your governance model.
              </p>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/[0.05] px-5 py-4 text-sm text-white/70">
              <p className="font-semibold text-white">Questions about usage?</p>
              <p className="mt-1">
                Email{" "}
                <a
                  href="mailto:legal@codezela.com"
                  className="text-gold transition-colors duration-200 hover:text-white"
                >
                  legal@codezela.com
                </a>{" "}
                for contract changes, DPAs, or compliance requests.
              </p>
            </div>
            <a
              href="https://codezela.com/contact"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-gold/70 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-gold transition-all duration-300 hover:border-gold hover:bg-gold/10"
            >
              Speak with legal
            </a>
          </aside>
        </div>
      </section>

      <div id="contact" className="scroll-mt-24">
        <Signup />
      </div>
      <Footer />
    </>
  );
}
