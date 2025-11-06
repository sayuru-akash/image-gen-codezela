"use client";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaApple, FaGoogle } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);

  function validate() {
    const e = {};
    if (!formData.name.trim()) e.name = "Name is required";
    if (!formData.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "Enter a valid email";
    if (!formData.password) e.password = "Password is required";
    else if (formData.password.length < 6)
      e.password = "Password should be at least 6 characters";
    if (!formData.confirmPassword) e.confirmPassword = "Please confirm";
    else if (formData.password !== formData.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submitHandler(event) {
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
        text: result.message || "Account created",
      });
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });

      // small delay so user sees success then redirect to login
      setTimeout(() => {
        router.push(
          `/login?email=${encodeURIComponent(result.email || formData.email)}`
        );
      }, 900);
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Signup failed" });
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <div className="relative bg-dark-blue grid grid-cols-1 md:grid-cols-3 gap-4 px-8 py-20 md:p-20">
        <div className="absolute inset-0 bg-[url(/images/signup-bg.png)] bg-center bg-size-[auto_500px] bg-no-repeat opacity-50 md:hidden"></div>

        <div className="hidden md:block col-span-2 px-10 relative z-10">
          <div className="bg-[url(/images/signup-bg.png)] bg-center bg-contain bg-no-repeat w-full h-full flex justify-center items-center">
            <Image
              alt="logo"
              src="/images/awards-icon.svg"
              width={200}
              height={200}
            />
          </div>
        </div>

        {/* Right section - Sign up form */}
        <div className="relative z-10">
          <h3 className="text-3xl text-white font-semibold text-center mb-8">
            Create your own masterpiece with AI
          </h3>

          <form onSubmit={submitHandler} className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col gap-2 w-full md:w-96 mx-auto">
              <label className="text-sm text-white/90">Full name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={`px-4 py-3 rounded-lg bg-white/5 border border-transparent focus:border-gold outline-none text-white placeholder-white/60 transition`}
                placeholder="Your name"
              />
              {errors.name && (
                <p className="text-xs text-red-400">{errors.name}</p>
              )}
            </div>

            <div className="flex flex-col gap-2 w-full md:w-96 mx-auto">
              <label className="text-sm text-white/90">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="px-4 py-3 rounded-lg bg-white/5 border border-transparent focus:border-gold outline-none text-white placeholder-white/60 transition"
                placeholder="you@domain.com"
              />
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            <div className="flex flex-col gap-2 w-full md:w-96 mx-auto">
              <label className="text-sm text-white/90">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="px-4 py-3 rounded-lg bg-white/5 border border-transparent focus:border-gold outline-none text-white placeholder-white/60 transition"
                placeholder="At least 6 characters"
              />
              {errors.password && (
                <p className="text-xs text-red-400">{errors.password}</p>
              )}
            </div>

            <div className="flex flex-col gap-2 w-full md:w-96 mx-auto">
              <label className="text-sm text-white/90">Confirm password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="px-4 py-3 rounded-lg bg-white/5 border border-transparent focus:border-gold outline-none text-white placeholder-white/60 transition"
                placeholder="Repeat your password"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            {message && (
              <div
                className={`w-full md:w-96 mx-auto text-sm text-center py-2 rounded ${
                  message.type === "error"
                    ? "bg-red-800 text-red-200"
                    : "bg-green-900 text-green-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="w-full md:w-96 mx-auto">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-gold from-10% to-white to-70% text-dark-blue text-sm font-semibold px-8 py-3 rounded-full hover:opacity-95 transition"
              >
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>
            </div>

            <p className="text-sm text-white/90 text-center mt-5">
              Have an account?
            </p>

            <div className="w-full md:w-96 mx-auto">
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center bg-gradient-to-r from-gold from-10% to-white to-70% text-dark-blue text-sm font-semibold px-8 py-3 rounded-full hover:opacity-95 transition"
              >
                Log in
              </Link>
            </div>
          </form>

          <p className="text-white text-sm text-center md:mb-14">
            By continuing, you agree to kAIro&apos;s{" "}
            <Link
              href="/"
              className="underline hover:text-gold transition-colors duration-200"
            >
              Terms of Use
            </Link>
            . Read our{" "}
            <Link
              href="/"
              className="underline hover:text-gold transition-colors duration-200"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
