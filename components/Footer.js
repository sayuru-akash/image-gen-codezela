import Link from "next/link";
import Image from "next/image";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <div className="bg-black px-4 py-12 sm:px-8 lg:px-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Column 1 */}
        <div className="md:col-span-4 lg:col-span-2 lg:pr-20 mb-14 lg:mb-0">
          <div className="flex items-center mb-8">
            <Image
              src="/images/logo1.png"
              alt="kAIro Logo"
              width={64}
              height={64}
              className="rounded-full mr-3"
            />
            <span className="text-3xl font-semibold text-white tracking-wider">
              kAIro
            </span>
          </div>
          <p className="text-off-white text-sm">
            kAIro AI is the AI image studio engineered by Codezela Technologies in Sri Lanka.
            We help ambitious brands generate, edit, and deliver intelligent imagery with governance built in.
          </p>

          <div className="mt-10 lg:mt-20">
            <h3 className="text-xl text-white font-semibold mb-4">
              Stay Tuned
            </h3>
            <div className="flex gap-4 items-center">
              <Link
                href="https://facebook.com/codezelatechnologies"
                target="_blank"
                rel="noreferrer"
                aria-label="Codezela Technologies on Facebook"
                className="text-off-white transition-colors duration-200 hover:text-white"
              >
                <FaFacebook className="h-6 w-6" />
              </Link>
              <Link
                href="https://www.instagram.com/codezela.t"
                target="_blank"
                rel="noreferrer"
                aria-label="Codezela Technologies on Instagram"
                className="text-off-white transition-colors duration-200 hover:text-white"
              >
                <FaInstagram className="h-6 w-6" />
              </Link>
              <Link
                href="http://linkedin.com/company/codezela-technologies"
                target="_blank"
                rel="noreferrer"
                aria-label="Codezela Technologies on LinkedIn"
                className="text-off-white transition-colors duration-200 hover:text-white"
              >
                <FaLinkedin className="h-6 w-6" />
              </Link>
              <Link
                href="http://x.com/codezelat"
                target="_blank"
                rel="noreferrer"
                aria-label="Codezela Technologies on X"
                className="text-off-white transition-colors duration-200 hover:text-white"
              >
                <FaXTwitter className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>

        {/* Column 2 */}
        <div className="md:col-span-2 lg:col-span-1 mb-14 lg:mb-0">
          <h3 className="text-2xl text-white font-medium mb-8">Solutions</h3>

          <div className="flex flex-col gap-8">
            <Link
              href="/dashboard/text-to-image"
              className="text-white text-sm hover:text-gold transition-colors duration-200"
            >
              Text to Image
            </Link>
            <Link
              href="/dashboard/image-update"
              className="text-white text-sm hover:text-gold transition-colors duration-200"
            >
              Image Update
            </Link>
            <Link
              href="/dashboard/edit-with-mask"
              className="text-white text-sm hover:text-gold transition-colors duration-200"
            >
              Edit with Mask
            </Link>
            <Link
              href="/dashboard/dual-image-editor"
              className="text-white text-sm hover:text-gold transition-colors duration-200"
            >
              AI Dual Image Editor
            </Link>
          </div>
        </div>

        {/* Column 3 */}
        <div className="md:col-span-2 lg:col-span-1 mb-14 lg:mb-0">
          <h3 className="text-2xl text-white font-medium mb-8">About</h3>

          <div className="flex flex-col gap-8">
            <Link
              href="/faq"
              className="text-white text-sm hover:text-gold cursor-pointer transition-all"
            >
              FAQ
            </Link>
            <Link
              href="/blog"
              className="text-white text-sm hover:text-gold cursor-pointer transition-all"
            >
              Blog
            </Link>
            <Link
              href="/#contact"
              className="text-white text-sm hover:text-gold cursor-pointer transition-all"
            >
              Contact
            </Link>
            <Link
              href="/privacy-policy"
              className="text-white text-sm hover:text-gold cursor-pointer transition-all"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-white text-sm hover:text-gold cursor-pointer transition-all"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      <hr className="border-white my-8" />

      <p className="text-white text-center text-sm">
        © {year}{" "}
        <Link
          href="https://codezela.com"
          target="_blank"
          rel="noreferrer"
          className="font-medium hover:text-gold transition-colors duration-200"
        >
          Codezela Technologies
        </Link>
        . All rights reserved.
      </p>
    </div>
  );
}
