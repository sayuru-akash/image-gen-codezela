import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { FaGoogle } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

export default function SignUp() {
  return (
    <div>
      <div className="relative bg-dark-blue grid grid-cols-1 md:grid-cols-3 gap-4 px-8 py-20 md:p-20">
        <div className="absolute inset-0 opacity-50 md:hidden">
          <Image
            alt="Decorative signup background"
            src="/images/signup-bg.png"
            fill
            className="object-contain object-center"
            quality={70}
            sizes="100vw"
            priority
          />
        </div>

        <div className="hidden md:block col-span-2 px-10 relative z-10">
          <div className="relative w-full h-full flex justify-center items-center">
            <Image
              alt="Signup background illustration"
              src="/images/signup-bg.png"
              fill
              className="object-contain"
              quality={70}
              sizes="(min-width: 1024px) 60vw, 100vw"
              priority
            />
            <Image
              alt="kAIro awards icon"
              src="/images/awards-icon.svg"
              width={200}
              height={200}
              className="relative z-10"
            />
          </div>
        </div>

        <div className="relative z-10">
          <h3 className="text-3xl text-white font-semibold text-center mb-8">
            Create your own masterpiece with AI
          </h3>
          <p className="text-white text-sm text-center mb-14">
            Transform your creative ideas into stunning AI-powered paintings in
            just seconds, bringing your vision to life with advanced technology.
          </p>

          <div className="flex flex-col gap-4 mb-14">
            <button
              type="button"
              className="flex mx-auto items-center gap-2 justify-center bg-gradient-to-r from-gold from-10% to-white to-70% text-dark-blue text-sm font-semibold px-8 py-4 rounded-full hover:text-white hover:from-white/20 hover:from-5% hover:to-gold hover:to-40% transition-all duration-300 ease-in-out w-full md:w-96"
            >
              <FaGoogle className="w-5 h-5" /> Sign in with Google
            </button>
            <Link
              href="/signup/form"
              className="flex mx-auto items-center gap-2 justify-center bg-gradient-to-r from-gold from-10% to-white to-70% text-dark-blue text-sm font-semibold px-8 py-4 rounded-full hover:text-white hover:from-white/20 hover:from-5% hover:to-gold hover:to-40% transition-all duration-300 ease-in-out w-full md:w-96 text-center"
            >
              <MdEmail className="w-5 h-5" /> Continue with Email
            </Link>
          </div>

          <p className="text-white text-sm text-center md:mb-14">
            By continuing, you agree to kAIro&apos;s{" "}
            <Link
              href="#"
              className="hover:text-gold transition-colors duration-200"
            >
              Terms of Use
            </Link>
            . Read our{" "}
            <Link
              href="/privacy-policy"
              className="hover:text-gold transition-colors duration-200"
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
