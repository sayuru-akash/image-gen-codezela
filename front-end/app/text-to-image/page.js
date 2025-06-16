// app/text-to-image/page.js
"use client";

import { useState } from "react";
import Link from "next/link";
// Assuming Navbar and Footer are in this directory, adjust path if needed
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const STYLES = [
  "Realistic",
  "Digital Art",
  "Painting",
  "Sci-Fi",
  "Abstract",
  "Photorealistic",
  "Anime",
];
const SIZES = ["1024x1024", "1024x1792", "1792x1024"];

// Skeleton loader component
const ImageSkeleton = () => (
  <div className="animate-pulse rounded-lg border border-gray-700 bg-gray-800">
    <div className="aspect-square w-full bg-gray-700 rounded-t-lg" />
    <div className="p-4">
      <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-700 rounded w-1/2" />
    </div>
  </div>
);

export default function TextToImage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState(STYLES[0]);
  const [size, setSize] = useState(SIZES[0]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }

    setLoading(true);
    setError("");
    setImages([]);

    try {
      // We combine the user's prompt with the selected style and size
      // to give the AI more specific instructions.
      const fullPrompt = `${prompt}, in the style of ${style}, image size ${size}.`;

      const res = await fetch("http://127.0.0.1:8000/im-gen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send the enhanced prompt to the backend.
        // The backend expects `prompt` and `number_of_images`.
        body: JSON.stringify({ prompt: fullPrompt, number_of_images: 1 }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // Use the error message from the API response if available
        throw new Error(data.error || "An unknown error occurred.");
      }

      setImages(data.images || []);
    } catch (e) {
      console.error("Generation failed:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // The download handler can be simplified to work with base64 data URLs
  const handleDownload = (base64Data, index) => {
    try {
      const link = document.createElement("a");
      // The href is the base64 data URL itself
      link.href = `data:image/png;base64,${base64Data}`;
      link.download = `generated-${style.toLowerCase().replace(" ", "-")}-${
        index + 1
      }.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed:", err);
      setError("Failed to download image. Please try again.");
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-gray-900 text-white">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-12">
        <Link
          href="/"
          className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Home
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Text to Image Generator
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Describe what you want to create, and our AI will bring your vision
            to life.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-gray-800/50 rounded-xl p-6 shadow-lg ring-1 ring-white/10">
          <div className="mb-6">
            <label
              htmlFor="prompt"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Image Description
            </label>
            <textarea
              id="prompt"
              rows={4}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="e.g., A majestic lion wearing a crown, sitting on a throne."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Art Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg"
              >
                {STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Image Size
              </label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg"
              >
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div> */}
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-900/50 border border-red-700 rounded-lg">
              <p className="text-red-400 text-center">{error}</p>
            </div>
          )}

          <button
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-lg transition-colors mb-8 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating...
              </>
            ) : (
              "Generate Image"
            )}
          </button>

          <div className="grid grid-cols-1 gap-6">
            {loading && <ImageSkeleton />}

            {!loading && images.length === 0 && (
              <div className="bg-gray-800 rounded-lg p-8 text-center border-2 border-dashed border-gray-700">
                <div className="text-gray-400 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto opacity-50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-400">
                  Your generated image will appear here
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Describe an image and click &quot;Generate Image&quot;
                </p>
              </div>
            )}

            {/* The API returns an object with a `data` field containing the base64 string.
                We must format this as a proper data URL for the <img> tag. */}
            {images.map((image, i) => (
              <div
                key={i}
                className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700"
              >
                <img
                  src={`data:image/png;base64,${image.data}`}
                  alt={`Generated art for: ${prompt.substring(0, 50)}`}
                  className="w-full h-auto object-contain bg-black"
                />
                <div className="p-4 flex justify-between items-center bg-gray-800">
                  <div>
                    <p className="text-gray-300 text-sm">Style: {style}</p>
                    <p className="text-gray-400 text-xs">Size: {size}</p>
                  </div>
                  <button
                    onClick={() => handleDownload(image.data, i)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
