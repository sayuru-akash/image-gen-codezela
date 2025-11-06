import LoginForm from "@/components/auth/LoginForm";
import { Suspense } from "react";

export const metadata = {
  title: "Login | kAIro AI by Codezela Technologies",
  description:
    "Securely access the kAIro AI creative suite delivered by Codezela Technologies to manage AI generated imagery and collaborate with your team.",
  keywords: [
    "kAIro AI login",
    "Codezela Technologies",
    "AI design platform access",
    "creative automation login",
  ],
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-dark-blue text-white">
          Loading workspace…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
