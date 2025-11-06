import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { MdEmail } from "react-icons/md";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

export const metadata = {
  title: "Join kAIro AI | Creative Suite by Codezela Technologies",
  description:
    "Create a kAIro AI workspace to collaborate with Codezela Technologies on AI powered storytelling, governed workflows, and enterprise-ready imagery.",
  keywords: [
    "kAIro AI signup",
    "Codezela Technologies",
    "AI creative suite",
    "enterprise ai imagery",
  ],
};

export default function SignUp() {
  return (
    <div>
      <section className="relative grid grid-cols-1 gap-6 bg-dark-blue px-8 py-20 md:grid-cols-3 md:p-20">
        <div className="absolute inset-0 opacity-40 md:hidden">
          <Image
            alt="Abstract signup background"
            src="/images/signup-bg.png"
            fill
            className="object-contain object-center"
            quality={70}
            sizes="100vw"
            priority
          />
        </div>

        <div className="relative hidden h-full items-center justify-center px-10 md:col-span-2 md:flex">
          <div className="relative h-full w-full">
            <Image
              alt="kAIro AI brand illustration"
              src="/images/signup-bg.png"
              fill
              className="object-contain"
              quality={70}
              sizes="(min-width: 1024px) 60vw, 100vw"
              priority
            />
            <Image
              alt="Codezela Technologies awards icon"
              src="/images/awards-icon.svg"
              width={220}
              height={220}
              className="relative z-10 mx-auto"
            />
          </div>
        </div>

        <div className="relative z-10">
          <h3 className="text-center text-3xl font-semibold text-white">
            Create your kAIro AI workspace
          </h3>
          <p className="mt-4 text-center text-sm text-white/80">
            Bring your marketing, product, and creative stakeholders together with an AI platform engineered by Codezela Technologies.
          </p>

          <div className="mt-12 flex flex-col gap-4">
            <GoogleAuthButton
              label="Continue with Google"
              className="md:w-96 md:self-center bg-gradient-to-r from-gold from-10% to-white to-70% text-dark-blue hover:text-white hover:from-white/30 hover:to-gold"
            />
            <Link
              href="/signup/form"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold from-10% to-white to-70% px-8 py-4 text-sm font-semibold text-dark-blue transition-all duration-300 hover:text-white hover:from-white/30 hover:to-gold md:w-96 md:self-center"
            >
              <MdEmail className="h-5 w-5" />
              Continue with Email
            </Link>
          </div>

          <p className="mt-10 text-center text-xs text-white/70">
            By continuing, you agree to the{" "}
            <Link
              href="https://codezela.com/privacy-policy"
              target="_blank"
              rel="noreferrer"
              className="text-gold hover:text-white"
            >
              Codezela Technologies terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy-policy"
              className="text-gold hover:text-white"
            >
              privacy policy
            </Link>
            .
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
