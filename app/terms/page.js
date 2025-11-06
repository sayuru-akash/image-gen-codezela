import Footer from "@/components/Footer";
import NavigationBar from "@/components/navigationbar";
import Signup from "@/components/Signup";
import Image from "next/image";

export const metadata = {
  title: "Terms of Service | kAIro AI by Codezela Technologies",
  description:
    "Review the terms of service governing access to kAIro AI, the creative automation platform delivered by Codezela Technologies.",
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

      <section className="px-4 pb-12 pt-14 md:px-10 lg:px-20">
        <div className="rounded-4xl border border-white/20 bg-white/5 p-3 backdrop-blur">
          <div className="relative overflow-hidden rounded-[2.5rem]">
            <Image
              alt="Terms of service cover imagery"
              src="/images/image-18.jpg"
              fill
              className="object-cover"
              quality={60}
              priority
            />
            <div className="relative grid h-full grid-cols-1 gap-6 bg-gradient-to-r from-dark-blue/95 via-dark-blue/90 to-dark-blue/70 p-10 lg:grid-cols-5">
              <div className="lg:col-span-3 flex flex-col justify-center">
                <p className="text-xs uppercase tracking-[0.35em] text-gold/70">
                  Terms of service
                </p>
                <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
                  Your agreement with Codezela Technologies.
                </h1>
                <p className="mt-4 text-sm text-white/70">
                  These terms outline your organisation’s rights and responsibilities when using kAIro AI. Please read them carefully before accessing the platform.
                </p>
              </div>
              <div className="hidden lg:block lg:col-span-2">
                <div className="relative h-full">
                  <div className="absolute top-12 right-16 h-32 w-32 overflow-hidden rounded-3xl border border-white/20 bg-white/5">
                    <Image
                      alt="Legal compliance illustration"
                      src="/images/image-5.png"
                      fill
                      className="object-cover"
                      quality={70}
                    />
                  </div>
                  <div className="absolute bottom-10 left-10 h-40 w-40 overflow-hidden rounded-3xl border border-white/20 bg-white/5">
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
        <div className="rounded-4xl border border-white/20 bg-dark-blue p-8 text-white">
          {termsSections.map((section) => (
            <div key={section.heading} className="mb-10 last:mb-0">
              <h2 className="text-2xl font-semibold">{section.heading}</h2>
              {section.paragraphs.map((paragraph, index) => (
                <p key={index} className="mt-4 text-sm text-white/75">
                  {paragraph}
                </p>
              ))}
            </div>
          ))}
        </div>
      </section>

      <div id="contact" className="scroll-mt-24">
        <Signup />
      </div>
      <Footer />
    </>
  );
}
