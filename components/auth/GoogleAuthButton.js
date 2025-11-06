"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { FaGoogle } from "react-icons/fa";

export default function GoogleAuthButton({
  label = "Continue with Google",
  className = "",
  iconClassName = "",
  disabled = false,
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (isLoading || disabled) return;
    setIsLoading(true);
    try {
      await signIn("google", {
        callbackUrl: "/dashboard",
      });
    } catch (error) {
      console.error("Google sign-in failed", error);
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={isLoading || disabled}
      className={`group flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <FaGoogle className={`h-5 w-5 transition-transform duration-300 group-hover:scale-105 ${iconClassName}`} />
      {isLoading ? "Redirecting…" : label}
    </button>
  );
}
