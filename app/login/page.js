"use client";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { signIn, getSession } from "next-auth/react";

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    try {
      const emailParam = searchParams?.get("email");
      if (emailParam) {
        const decoded = decodeURIComponent(emailParam);
        setFormData((prev) => ({ ...prev, email: decoded }));
      }
    } catch (e) {}
  }, [searchParams]);

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);

  async function submitHandler(event) {
    event.preventDefault();
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      redirect: false,
      email: formData.email,
      password: formData.password,
    });

    if (result && result.ok) {
      const session = await getSession();

      if (session) {
        router.push("/dual-image-editor");
        setIsSubmitting(false);
      }
    } else {
      alert("Login failed. Please check your email and password.");
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
                placeholder="Enter Password"
              />
              {errors.password && (
                <p className="text-xs text-red-400">{errors.password}</p>
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
                {isSubmitting ? "Login..." : "Login"}
              </button>
            </div>

            <p className="text-sm text-white/90 text-center mt-5">
              Don&apos;t have an account?
            </p>

            <div className="w-full md:w-96 mx-auto">
              <Link
                href="/signup/form"
                className="w-full inline-flex items-center justify-center bg-gradient-to-r from-gold from-10% to-white to-70% text-dark-blue text-sm font-semibold px-8 py-3 rounded-full hover:opacity-95 transition"
              >
                Create Account
              </Link>
            </div>
          </form>

          {/* <div className="flex flex-col gap-4 mb-14">
            <button className="flex mx-auto items-center gap-2 justify-center bg-gradient-to-r from-gold from-10% to-white to-70% text-dark-blue text-sm font-semibold px-8 py-4 rounded-full hover:text-white cursor-pointer transition-all duration-300 ease-in-out w-full md:w-96">
              <FaGoogle className="w-5 h-5" /> Sign in with Google
            </button>
            <button className="flex mx-auto items-center gap-2 justify-center bg-gradient-to-r from-gold from-10% to-white to-70% text-dark-blue text-sm font-semibold px-8 py-4 rounded-full hover:text-white cursor-pointer transition-all duration-300 ease-in-out w-full md:w-96">
              <FaApple className="w-5 h-5" /> Sign in with Apple
            </button>
            <button className="flex mx-auto items-center gap-2 justify-center bg-gradient-to-r from-gold from-10% to-white to-70% text-dark-blue text-sm font-semibold px-8 py-4 rounded-full hover:text-white cursor-pointer transition-all duration-300 ease-in-out w-full md:w-96">
              <MdEmail className="w-5 h-5" /> Continue with Email
            </button>
          </div> */}

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
