"use client";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { signIn, getSession, useSession } from "next-auth/react";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

const ERROR_MESSAGES = {
  NO_USER:
    "We couldn’t find an account with that email. Check the spelling or create a new workspace.",
  INVALID_CREDENTIALS:
    "That password didn’t match our records. Try again or request access support.",
  GOOGLE_ACCOUNT:
    "This workspace is linked to Google. Choose “Sign in with Google” to continue.",
  PASSWORD_SIGNIN_REQUIRED:
    "This workspace was created with email and password. Use your password to sign in.",
  default: "Unable to sign you in right now. Please try again in a moment.",
};

export default function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.replace("/dashboard");
    }
  }, [session, status, router]);

  useEffect(() => {
    const emailParam = searchParams?.get("email");
    if (!emailParam) return;
    try {
      const decoded = decodeURIComponent(emailParam);
      setFormData((prev) => ({ ...prev, email: decoded }));
    } catch (error) {
      console.warn("Unable to decode email query param", error);
    }
  }, [searchParams]);

  useEffect(() => {
    const errorCode = searchParams?.get("error");
    if (!errorCode) return;
    setMessage({
      type: "error",
      text: ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.default,
    });
  }, [searchParams]);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateForm = () => {
    const validationErrors = {};
    if (!formData.email.trim()) {
      validationErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      validationErrors.email = "Enter a valid email address";
    }
    if (!formData.password) {
      validationErrors.password = "Password is required";
    }
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  async function submitHandler(event) {
    event.preventDefault();
    setMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        setMessage({
          type: "error",
          text: ERROR_MESSAGES[result.error] ?? ERROR_MESSAGES.default,
        });
        return;
      }

      if (result?.ok) {
        const activeSession = await getSession();
        if (activeSession) {
          router.push("/dashboard");
        }
        return;
      }

      setMessage({
        type: "error",
        text: ERROR_MESSAGES.default,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Unexpected error. Please try again in a moment.",
      });
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-dark-blue">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.35),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(41,76,152,0.4),_transparent_60%)]" />
      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        <div className="relative hidden flex-1 flex-col justify-between overflow-hidden border-r border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-white/10 px-12 py-16 lg:flex">
          <div className="flex items-center gap-3 text-white/80">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-gold to-white/60 text-xs font-semibold text-dark-blue">
              k
            </span>
            <span className="text-xs uppercase tracking-[0.35em] text-white/60">
              Access Studio
            </span>
          </div>
          <div>
            <h2 className="text-4xl font-semibold text-white lg:text-5xl">
              Welcome back to <span className="text-gold">kAIro AI</span>
            </h2>
            <p className="mt-6 max-w-sm text-base text-white/70">
              Pick up where you left off with drafts, collaboration notes, and
              the latest AI experiments curated by the Codezela Technologies
              team.
            </p>
          </div>
          <div className="relative mt-16 aspect-[4/5] w-full max-w-sm self-end overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl">
            <Image
              alt="Generative artwork created with kAIro AI"
              src="/images/image-11.jpg"
              fill
              className="object-cover"
              quality={70}
              sizes="(min-width: 1024px) 22rem, 50vw"
            />
          </div>
        </div>

        <div className="flex-1 px-6 py-10 sm:px-8 md:px-12 lg:px-16">
          <div className="mx-auto flex w-full max-w-lg flex-col justify-center rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md sm:p-10">
            <div className="mb-8 text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-gold/80">
                Sign in
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                Join your creative workspace
              </h1>
              <p className="mt-3 text-sm text-white/70">
                Access the complete suite of kAIro AI tools delivered by Codezela
                Technologies.
              </p>
            </div>

            <div className="space-y-4">
              <GoogleAuthButton
                label="Sign in with Google"
                className="border border-white/15 bg-white/[0.08] text-white hover:bg-white/[0.12]"
                iconClassName="text-white"
              />
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-white/15" />
                <span className="text-[11px] uppercase tracking-[0.4em] text-white/40">
                  or use email
                </span>
                <span className="h-px flex-1 bg-white/15" />
              </div>
            </div>

            <form onSubmit={submitHandler} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/80">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={handleChange("email")}
                  autoComplete="email"
                  className={`w-full rounded-2xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-gold ${
                    errors.email ? "border-red-400/80" : "border-white/10"
                  }`}
                  placeholder="you@company.com"
                />
                {errors.email && (
                  <p className="text-xs text-red-300">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/80">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={handleChange("password")}
                  autoComplete="current-password"
                  className={`w-full rounded-2xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-gold ${
                    errors.password ? "border-red-400/80" : "border-white/10"
                  }`}
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="text-xs text-red-300">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-white/60">
                <span>
                  Need an account?{" "}
                  <Link
                    href="/signup/form"
                    className="font-medium text-gold hover:text-white"
                  >
                    Create one
                  </Link>
                </span>
                <Link
                  href="https://codezela.com/contact"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-white/70 hover:text-gold"
                >
                  Forgot access?
                </Link>
              </div>

              {message && (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    message.type === "error"
                      ? "border-red-400/40 bg-red-500/10 text-red-100"
                      : "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center rounded-full bg-gradient-to-r from-gold to-white/70 px-6 py-3 text-sm font-semibold text-dark-blue shadow-lg transition-all duration-300 hover:from-white/80 hover:to-gold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Signing you in..." : "Sign in to kAIro AI"}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-white/50">
              By continuing you agree to the{" "}
              <Link
                href="https://codezela.com/privacy-policy"
                target="_blank"
                rel="noreferrer"
                className="text-gold hover:text-white"
              >
                Codezela terms
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
        </div>
      </div>

      <Footer />
    </div>
  );
}
