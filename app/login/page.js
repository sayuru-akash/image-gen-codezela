import LoginForm from "@/components/auth/LoginForm";
import { Suspense } from "react";

export const metadata = {
  title: "Login | kAIro AI by Codezela Technologies",
  description:
    "Securely access kAIro AI from Codezela Technologies to manage AI-generated imagery, localised campaigns, and collaborative reviews.",
  keywords: [
    "kAIro AI login",
    "Codezela Technologies",
    "AI image generator Sri Lanka",
    "AI design platform access",
    "Colombo tech login",
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
