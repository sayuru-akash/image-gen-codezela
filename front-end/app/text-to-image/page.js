import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function TextToImage() {
  return (
    <main className="min-h-screen flex flex-col gradient-bg text-white">
      <Navbar />

      <div className="flex-grow container mx-auto px-4 py-12">
        <div className="mb-6">
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Text to Image Generator
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Describe what you want to create, and our AI will bring your vision
            to life
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-gray-900 rounded-xl p-6 shadow-lg">
          <div className="mb-6">
            <label
              htmlFor="prompt"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Enter your prompt
            </label>
            <textarea
              id="prompt"
              rows="4"
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the image you want to generate..."
            ></textarea>
          </div>

          <div className="mb-6">
            <div className="flex flex-wrap gap-4">
              <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full text-sm">
                Realistic
              </button>
              <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full text-sm">
                Digital Art
              </button>
              <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full text-sm">
                Painting
              </button>
              <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full text-sm">
                Sci-Fi
              </button>
              <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full text-sm">
                Abstract
              </button>
            </div>
          </div>

          <div className="mb-8">
            <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors">
              Generate Image
            </button>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-center min-h-64">
            <div className="text-center text-gray-400">
              <div className="mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </div>
              <p>Your generated image will appear here</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
