import Footer from "@/components/Footer";
import NavigationBar from "@/components/navigationbar";
import Signup from "@/components/Signup";
import Image from "next/image";

export const metadata = {
  title: "Privacy Policy | kAIro AI by Codezela Technologies",
  description:
    "Learn how Codezela Technologies protects your data inside kAIro AI, including information we collect, how we store it, and the choices available to your organisation.",
};

const policySections = [
  {
    heading: "1. Who we are",
    paragraphs: [
      "kAIro AI is the AI image design studio developed and operated by Codezela Technologies in Sri Lanka. This policy explains how we handle information when you visit our marketing site, create a workspace, or interact with any kAIro AI product.",
    ],
  },
  {
    heading: "2. Information we collect",
    paragraphs: [
      "Account information such as name, email address, organisation, and authentication metadata so we can provide secure access to the platform.",
      "Usage signals that help us maintain performance— including prompt requests, asset export history, and collaboration events— stored with role-based access controls.",
      "Optional content you upload (images, reference files, comments) to generate AI outputs. You remain the controller of this content and can delete it from within the workspace.",
    ],
  },
  {
    heading: "3. How we use your information",
    paragraphs: [
      "Operate, maintain, and improve kAIro AI features, including prompt governance, localisation tooling, and analytics dashboards.",
      "Provide support, security monitoring, billing, and compliance reporting in line with customer agreements.",
      "Inform you about product updates, training, or Codezela Technologies events. You may opt out of marketing emails at any time.",
    ],
  },
  {
    heading: "4. Storage, security, and retention",
    paragraphs: [
      "Codezela Technologies hosts kAIro AI on encrypted infrastructure with SOC 2-ready controls. We retain personal data while you maintain an active contract or as required by law.",
      "Content you delete is removed from primary systems within 30 days and from back-ups within 90 days. Custom retention policies are available for enterprise deployments.",
    ],
  },
  {
    heading: "5. Your choices",
    paragraphs: [
      "Update or correct account information inside the platform at any time.",
      "Request deletion of your workspace data by contacting privacy@codezela.com. We will confirm once data removal is complete.",
      "If you access kAIro AI through your employer or agency, please work with your administrator to manage permissions or data subject requests.",
    ],
  },
  {
    heading: "6. Contact Codezela Technologies",
    paragraphs: [
      "For privacy questions, security disclosures, or data subject requests, email privacy@codezela.com or write to Codezela Technologies, Colombo, Sri Lanka.",
      "We review this policy regularly. Updates will be posted here with a new effective date.",
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <>
      <div className="bg-black">
        <NavigationBar />
      </div>

      <section className="px-4 pb-14 pt-14 md:px-10 lg:px-20">
        <div className="mx-auto max-w-6xl rounded-[2.5rem] border border-white/15 bg-white/[0.05] p-3 shadow-[0_40px_120px_rgba(6,8,20,0.55)] backdrop-blur">
          <div className="relative overflow-hidden rounded-[2.3rem]">
            <Image
              alt="Privacy policy cover imagery"
              src="/images/image-21.jpg"
              fill
              className="object-cover"
              quality={60}
              priority
            />
            <div className="relative grid h-full grid-cols-1 gap-6 bg-gradient-to-r from-[#05070D]/95 via-[#05070D]/90 to-[#05070D]/70 px-8 py-12 lg:grid-cols-5 lg:px-12">
              <div className="flex flex-col justify-center lg:col-span-3">
                <p className="text-xs uppercase tracking-[0.35em] text-gold/70">
                  Privacy policy
                </p>
                <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
                  How Codezela Technologies protects your data.
                </h1>
                <p className="mt-4 max-w-2xl text-sm text-white/70 sm:text-base">
                  Effective March 2025 — this document explains the safeguards behind the kAIro AI platform and your options as a customer or user.
                </p>
              </div>
              <div className="relative hidden h-full lg:col-span-2 lg:block">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative h-52 w-52 overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 backdrop-blur">
                    <Image
                      alt="Secure infrastructure visual"
                      src="/images/image-22.jpg"
                      fill
                      className="object-cover"
                      quality={60}
                    />
                  </div>
                  <div className="absolute -bottom-8 right-10 h-44 w-44 overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 backdrop-blur">
                    <Image
                      alt="Creative assets protection visual"
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

      <section className="px-4 pb-16 md:px-10 lg:px-20">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
          <div className="rounded-4xl border border-white/15 bg-dark-blue/95 p-8 text-white shadow-[0_30px_90px_rgba(6,8,20,0.45)] sm:p-10">
            {policySections.map((section) => (
              <div key={section.heading} className="mb-10 last:mb-0">
                <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                  {section.heading}
                </h2>
                {section.paragraphs.map((paragraph, index) => (
                  <p key={index} className="mt-4 text-sm leading-relaxed text-white/75 sm:text-base">
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </div>
          <aside className="flex flex-col gap-6 rounded-4xl border border-white/15 bg-white/[0.04] p-6 text-white shadow-[0_30px_90px_rgba(6,8,20,0.35)] sm:p-8">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-gold/70">
                Data governance
              </p>
              <h3 className="mt-3 text-xl font-semibold text-white">
                Compliance-ready from day one.
              </h3>
              <p className="mt-2 text-sm text-white/70">
                kAIro AI supports SOC 2 programs, private deployments, and regional data residency requirements.
              </p>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/[0.05] px-5 py-4 text-sm text-white/70">
              <p className="font-semibold text-white">Security questions?</p>
              <p className="mt-1">
                Email{" "}
                <a
                  href="mailto:privacy@codezela.com"
                  className="text-gold transition-colors duration-200 hover:text-white"
                >
                  privacy@codezela.com
                </a>{" "}
                for audits, disclosures, or impact assessments.
              </p>
            </div>
            <a
              href="https://codezela.com/contact"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-gold/70 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-gold transition-all duration-300 hover:border-gold hover:bg-gold/10"
            >
              Request compliance pack
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
