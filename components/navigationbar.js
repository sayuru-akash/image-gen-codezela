"use client";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function NavigationBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-transparent text-white px-4 py-4 font-plus-jakarta">
      {/* <div className="max-w-7xl mx-auto"> */}
      <div className="w-11/12 mx-auto">
        {/* Desktop Navigation */}
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center hover:cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-r from-white from-20% to-gold to-80% rounded-full mr-1"></div>
            <span className="text-xl font-semibold tracking-wider">kAIro</span>
          </Link>

          {/* Desktop Menu Items */}
          <div className="hidden md:flex items-center space-x-20">
            <Link
              href="#features"
              className="hover:text-amber-400 transition-colors duration-200"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="hover:text-amber-400 transition-colors duration-200"
            >
              Pricing
            </Link>
            <Link
              href="#examples"
              className="hover:text-amber-400 transition-colors duration-200"
            >
              Examples
            </Link>
            <Link
              href="#contact"
              className="hover:text-amber-400 transition-colors duration-200"
            >
              Contact
            </Link>
          </div>

          {/* Desktop Sign Up Button */}
          <Link
            href="/signup"
            className="hidden md:block bg-gradient-to-r from-gold from-50% to-white/60 to-95% text-white text-xs font-semibold px-8 py-3 rounded-full hover:from-white/20 hover:to-gold cursor-pointer transition-all duration-100000"
          >
            Sign Up →
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md hover:bg-gray-800 transition-colors duration-200"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="#features"
                className="block py-2 px-4 hover:bg-gray-800 rounded-md transition-colors duration-200"
                onClick={toggleMenu}
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="block py-2 px-4 hover:bg-gray-800 rounded-md transition-colors duration-200"
                onClick={toggleMenu}
              >
                Pricing
              </Link>
              <Link
                href="#examples"
                className="block py-2 px-4 hover:bg-gray-800 rounded-md transition-colors duration-200"
                onClick={toggleMenu}
              >
                Examples
              </Link>
              <Link
                href="#contact"
                className="block py-2 px-4 hover:bg-gray-800 rounded-md transition-colors duration-200"
                onClick={toggleMenu}
              >
                Contact
              </Link>
              <Link
                href="/signup"
                className="bg-gradient-to-r from-gold from-50% to-white/60 to-95% text-white text-xs font-semibold px-8 py-3 rounded-full hover:from-white/20 hover:to-gold cursor-pointer transition-all duration-100000 mt-4 w-full"
              >
                Sign Up →
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
