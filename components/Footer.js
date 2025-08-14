import Link from "next/link";
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <div className="px-10 md:px-20 py-10 bg-black">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Column 1 */}
        <div className="col-span-2 md:pr-20 mb-14 md:mb-0">
          <div className="flex items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-white from-20% to-gold to-80% rounded-full mr-3"></div>
            <span className="text-3xl font-semibold text-white tracking-wider">
              kAIro
            </span>
          </div>
          <p className="text-off-white text-sm ">
            Lorem ipsum dolor sit amet consectetur. Tortor accumsan non eget
            orci. Faucibus sed sed libero amet ac eu. Pulvinar integer feugiat
            erat maecenas. Aliquet in consectetur.
          </p>

          <div className="mt-10 md:mt-20">
            <h3 className="text-xl text-white font-semibold mb-4">
              Stay Tuned
            </h3>
            <div className="flex gap-4 items-center">
              <FaFacebook className="w-6 h-6 text-off-white hover:text-white cursor-pointer transition-all" />
              <FaInstagram className="w-6 h-6 text-off-white hover:text-white cursor-pointer transition-all" />
              <FaLinkedin className="w-6 h-6 text-off-white hover:text-white cursor-pointer transition-all" />
              <FaYoutube className="w-6 h-6 text-off-white hover:text-white cursor-pointer transition-all" />
              <FaXTwitter className="w-6 h-6 text-off-white hover:text-white cursor-pointer transition-all" />
            </div>
          </div>
        </div>

        {/* Column 2 */}
        <div>
          <h3 className="text-2xl text-white font-medium mb-8">Solutions</h3>

          <div className="flex flex-col gap-8">
            <Link href="/" className="text-white text-sm underline">
              Text to Image
            </Link>
            <Link href="/" className="text-white text-sm underline">
              Image Update
            </Link>
            <Link href="/" className="text-white text-sm underline">
              Edit with Mask
            </Link>
            <Link href="/" className="text-white text-sm underline">
              AI Dual Image Editor
            </Link>
          </div>
        </div>

        {/* Column 3 */}
        <div>
          <h3 className="text-2xl text-white font-medium mb-8">About</h3>

          <div className="flex flex-col gap-8">
            <Link href="/" className="text-white text-sm">
              FAQ
            </Link>
            <Link href="/" className="text-white text-sm">
              Blog
            </Link>
            <Link href="/" className="text-white text-sm">
              Contact Us
            </Link>
            <Link href="/" className="text-white text-sm">
              Privacy Policy
            </Link>
            <Link href="/" className="text-white text-sm">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      <hr className="border-white my-8" />

      <p className="text-white text-center text-sm">© {year} All Rights Reserved. Codezela Technologies</p>
    </div>
  );
}
