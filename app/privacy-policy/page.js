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
      "kAIro AI is the creative automation platform developed and operated by Codezela Technologies. This policy explains how we handle information when you visit our marketing site, create a workspace, or interact with any kAIro AI product.",
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

      <section className="px-4 pb-12 pt-14 md:px-10 lg:px-20">
        <div className="rounded-4xl border border-white/20 bg-white/5 p-3 backdrop-blur">
          <div className="relative overflow-hidden rounded-[2.5rem]">
            <Image
              alt="Privacy policy cover imagery"
              src="/images/image-21.jpg"
              fill
              className="object-cover"
              quality={60}
              priority
            />
            <div className="relative grid h-full grid-cols-1 gap-6 bg-gradient-to-r from-dark-blue/95 via-dark-blue/90 to-dark-blue/70 p-10 lg:grid-cols-5">
              <div className="lg:col-span-3 flex flex-col justify-center">
                <p className="text-xs uppercase tracking-[0.35em] text-gold/70">
                  Privacy policy
                </p>
                <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
                  How Codezela Technologies protects your data.
                </h1>
                <p className="mt-4 text-sm text-white/70">
                  Effective March 2025 — this document explains the safeguards behind the kAIro AI platform and your options as a customer or user.
                </p>
              </div>
              <div className="hidden lg:block lg:col-span-2">
                <div className="relative h-full">
                  <div className="absolute top-12 right-16 h-32 w-32 overflow-hidden rounded-3xl border border-white/20 bg-white/5">
                    <Image
                      alt="Secure infrastructure visual"
                      src="/images/image-22.jpg"
                      fill
                      className="object-cover"
                      quality={60}
                    />
                  </div>
                  <div className="absolute bottom-10 left-10 h-40 w-40 overflow-hidden rounded-3xl border border-white/20 bg-white/5">
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
        <div className="rounded-4xl border border-white/20 bg-dark-blue p-8 text-white">
          {policySections.map((section) => (
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
