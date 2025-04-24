"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ImageUpdate() {
  const [imageUploaded, setImageUploaded] = useState(false);

  const handleImageUpload = () => {
    setImageUploaded(true);
  };

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
            Image Update Generator
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Upload an image and provide a text prompt to transform it
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-medium mb-4">Source Image</h3>

              {!imageUploaded ? (
                <div
                  className="border-2 border-dashed border-gray-700 rounded-lg h-64 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                  onClick={handleImageUpload}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mb-3 text-gray-400"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <p className="text-gray-400 mb-1">Click to upload an image</p>
                  <p className="text-gray-500 text-sm">
                    JPG, PNG or GIF (max. 10MB)
                  </p>
                </div>
              ) : (
                <div className="relative h-64 rounded-lg overflow-hidden">
                  <Image
                    src="/api/placeholder/500/500"
                    alt="Uploaded image"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                  <button
                    className="absolute top-2 right-2 bg-black bg-opacity-50 p-1 rounded-full text-white hover:bg-opacity-70"
                    onClick={() => setImageUploaded(false)}
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
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              )}

              <div className="mt-4">
                <label
                  htmlFor="update-prompt"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Describe how to transform the image
                </label>
                <textarea
                  id="update-prompt"
                  rows="4"
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add vibrant colors and make it futuristic..."
                ></textarea>
              </div>

              <div className="mt-4">
                <button
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    imageUploaded
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-700 cursor-not-allowed"
                  }`}
                  disabled={!imageUploaded}
                >
                  Generate Updated Image
                </button>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-medium mb-4">Generated Result</h3>

              <div className="bg-gray-800 rounded-lg h-64 flex items-center justify-center">
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
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                    </svg>
                  </div>
                  <p>Generated result will appear here</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex gap-3">
                  <button className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors flex justify-center items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download
                  </button>
                  <button className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors flex justify-center items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                    </svg>
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
