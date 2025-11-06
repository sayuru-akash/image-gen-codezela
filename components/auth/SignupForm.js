"use client";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

async function signupUser(name, email, password, confirmPassword) {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password, confirmPassword }),
    headers: { "Content-Type": "application/json" },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Something went wrong!");
  return data;
}

export default function SignupForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const validationErrors = {};
    if (!formData.name.trim()) validationErrors.name = "Name is required";
    if (!formData.email.trim()) {
      validationErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      validationErrors.email = "Enter a valid email address";
    }
    if (!formData.password) {
      validationErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      validationErrors.password = "Use at least 6 characters";
    }
    if (!formData.confirmPassword) {
      validationErrors.confirmPassword = "Confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      validationErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setMessage(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result = await signupUser(
        formData.name,
        formData.email,
        formData.password,
        formData.confirmPassword
      );

      setMessage({
        type: "success",
        text: result.message || "Account created. Redirecting to sign in…",
      });
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });

      setTimeout(() => {
        router.push(
          `/login?email=${encodeURIComponent(result.email || formData.email)}`
        );
      }, 1000);
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Signup failed" });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-dark-blue">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.35),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(41,76,152,0.4),_transparent_60%)]" />
      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        <div className="relative hidden flex-1 flex-col justify-between overflow-hidden border-r border-white/10 bg-gradient-to-b from-white/5 via-transparent to-white/10 px-12 py-16 lg:flex">
          <div className="flex items-center gap-3 text-white/70">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-gold to-white/60 text-xs font-semibold text-dark-blue">
              New
            </span>
            <span className="text-xs uppercase tracking-[0.4em] text-white/50">
              Create account
            </span>
          </div>
          <div>
            <h2 className="text-4xl font-semibold text-white lg:text-5xl">
              Start shaping intelligent visuals with{" "}
              <span className="text-gold">kAIro AI</span>
            </h2>
            <p className="mt-6 max-w-sm text-base text-white/70">
              Provision secure access for your team and collaborate on Codezela
              Technologies’ suite of AI artistry tools built for production-grade launches.
            </p>
          </div>
          <div className="relative mt-16 aspect-square w-full max-w-sm self-end overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl">
            <Image
              alt="Creative team signing up for kAIro AI"
              src="/images/image-16.jpg"
              fill
              className="object-cover"
              quality={70}
              sizes="(min-width: 1024px) 22rem, 50vw"
            />
          </div>
        </div>

        <div className="flex-1 px-6 py-10 sm:px-8 md:px-12 lg:px-16">
          <div className="mx-auto flex w-full max-w-xl flex-col justify-center rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md sm:p-10">
            <div className="mb-8 text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-gold/80">
                Create account
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                Unlock the full kAIro AI studio
              </h1>
              <p className="mt-3 text-sm text-white/70">
                Build a profile to store prompts, manage assets, and collaborate with the Codezela Technologies AI team.
              </p>
            </div>

            <form onSubmit={submitHandler} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/85">
                  Full name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleChange("name")}
                  autoComplete="name"
                  className={`w-full rounded-2xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-gold ${
                    errors.name ? "border-red-400/80" : "border-white/10"
                  }`}
                  placeholder="Alex Morgan"
                />
                {errors.name && (
                  <p className="text-xs text-red-300">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/85">
                  Work email
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

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/85">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={handleChange("password")}
                    autoComplete="new-password"
                    className={`w-full rounded-2xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-gold ${
                      errors.password ? "border-red-400/80" : "border-white/10"
                    }`}
                    placeholder="Minimum 6 characters"
                  />
                  {errors.password && (
                    <p className="text-xs text-red-300">{errors.password}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/85">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange("confirmPassword")}
                    autoComplete="new-password"
                    className={`w-full rounded-2xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-gold ${
                      errors.confirmPassword
                        ? "border-red-400/80"
                        : "border-white/10"
                    }`}
                    placeholder="Re-type password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-300">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
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
                {isSubmitting ? "Creating your account..." : "Create account"}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-white/55">
              Already have an account?{" "}
              <Link href="/login" className="text-gold hover:text-white">
                Sign in
              </Link>
            </p>
            <p className="mt-3 text-center text-xs text-white/45">
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
