"use client";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function NavigationBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <nav className="bg-transparent text-white px-4 py-4 font-plus-jakarta">
      {/* <div className="max-w-7xl mx-auto"> */}
      <div className="w-11/12 mx-auto">
        {/* Desktop Navigation */}
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center hover:cursor-pointer">
            <Image
              src="/images/logo1.png"
              alt="kAIro Logo"
              width={32}
              height={32}
              className="rounded-full mr-1"
            />
            <span className="text-xl font-semibold tracking-wider">kAIro</span>
          </Link>

          {/* Desktop Menu Items */}
          <div className="hidden lg:flex items-center space-x-16 xl:space-x-20">
            <Link
              href="/#features"
              className="hover:text-amber-400 transition-colors duration-200"
            >
              Features
            </Link>
            <Link
              href="/#usage"
              className="hover:text-amber-400 transition-colors duration-200"
            >
              Usage
            </Link>
            <Link
              href="/blog"
              className="hover:text-amber-400 transition-colors duration-200"
            >
              Blog
            </Link>
            <Link
              href="/faq"
              className="hover:text-amber-400 transition-colors duration-200"
            >
              FAQ
            </Link>
            <Link
              href="/#contact"
              className="hover:text-amber-400 transition-colors duration-200"
            >
              Contact
            </Link>
          </div>

          {/* Desktop Sign Up/Login Button */}
          {status === "authenticated" ? (
            <div className="hidden lg:flex items-center space-x-4">
              <span className="text-sm text-white/80">
                Welcome, {session?.user?.name || session?.user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold px-6 py-2 rounded-full hover:from-red-600 hover:to-red-700 cursor-pointer transition-all duration-300"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="hidden lg:flex items-center space-x-4">
              <Link
                href="/login"
                className="text-white text-xs font-semibold px-6 py-2 rounded-full border border-white/30 hover:border-gold hover:text-gold cursor-pointer transition-all duration-300"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-gradient-to-r from-gold from-50% to-white/60 to-95% text-white text-xs font-semibold px-8 py-3 rounded-full hover:from-white/20 hover:to-gold cursor-pointer transition-all duration-300"
              >
                Sign Up →
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 rounded-md hover:bg-gray-800 transition-colors duration-200"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/#features"
                className="block py-2 px-4 hover:bg-gray-800 rounded-md transition-colors duration-200"
                onClick={toggleMenu}
              >
                Features
              </Link>
              <Link
                href="/#usage"
                className="block py-2 px-4 hover:bg-gray-800 rounded-md transition-colors duration-200"
                onClick={toggleMenu}
              >
                Usage
              </Link>
              <Link
                href="/blog"
                className="block py-2 px-4 hover:bg-gray-800 rounded-md transition-colors duration-200"
                onClick={toggleMenu}
              >
                Blog
              </Link>
              <Link
                href="/faq"
                className="block py-2 px-4 hover:bg-gray-800 rounded-md transition-colors duration-200"
                onClick={toggleMenu}
              >
                FAQ
              </Link>
              <Link
                href="/#contact"
                className="block py-2 px-4 hover:bg-gray-800 rounded-md transition-colors duration-200"
                onClick={toggleMenu}
              >
                Contact
              </Link>

              {/* Mobile Auth Buttons */}
              {status === "authenticated" ? (
                <div className="flex flex-col space-y-2 pt-2">
                  <span className="text-sm text-white/80 px-4">
                    Welcome, {session?.user?.name || session?.user?.email}
                  </span>
                  <button
                    onClick={() => {
                      handleSignOut();
                      toggleMenu();
                    }}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold px-6 py-2 rounded-full hover:from-red-600 hover:to-red-700 cursor-pointer transition-all duration-300 mx-4"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <Link
                    href="/login"
                    className="text-white text-xs font-semibold px-6 py-2 rounded-full border border-white/30 hover:border-gold hover:text-gold cursor-pointer transition-all duration-300 mx-4 text-center"
                    onClick={toggleMenu}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-gradient-to-r from-gold from-50% to-white/60 to-95% text-white text-xs font-semibold px-8 py-3 rounded-full hover:from-white/20 hover:to-gold cursor-pointer transition-all duration-300 mx-4 text-center"
                    onClick={toggleMenu}
                  >
                    Sign Up →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
