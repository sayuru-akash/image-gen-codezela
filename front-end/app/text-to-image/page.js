// app/text-to-image/page.js
"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Constants for styles, sizes, and counts
const STYLES = ["Realistic", "Digital Art", "Painting", "Sci-Fi", "Abstract"];
const SIZES = ["1024x1024", "1792x1024", "1024x1792"];
const IMAGE_COUNTS = [1, 2, 3, 4];

export default function TextToImage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState(STYLES[0]);
  // --- NEW: State for size and number of images ---
  const [size, setSize] = useState(SIZES[0]);
  const [n, setN] = useState(IMAGE_COUNTS[0]);

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
      // --- UPDATED: Send size and n to the API ---
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style, size, n }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to generate image");
      }

      const { images } = await res.json();
      setImages(images);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // --- UPDATED: Correct download handler ---
  const handleDownload = async (url, index) => {
    try {
      // 1. Fetch the image data as a blob
      const response = await fetch(url);
      const blob = await response.blob();
      // 2. Create a local URL for the blob
      const objectUrl = URL.createObjectURL(blob);

      // 3. Use the local URL to trigger the download
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `generated-${style.toLowerCase()}-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 4. Clean up the local URL
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Download failed:", error);
      setError("Failed to download image. Please try right-clicking to save.");
    }
  };

  return (
    <main className="min-h-screen flex flex-col gradient-bg text-white">
            <Navbar />     {" "}
      <div className="flex-grow container mx-auto px-4 py-12">
               {" "}
        <Link
          href="/"
          className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-6"
        >
                    {/* ... Back arrow SVG ... */}          Back to Home        {" "}
        </Link>
               {" "}
        <div className="text-center mb-12">
                   {" "}
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        Text to Image Generator          {" "}
          </h1>
                   {" "}
          <p className="text-gray-300 max-w-2xl mx-auto">
                        Describe what you want to create, and our AI will bring
            your vision to life.          {" "}
          </p>
                 {" "}
        </div>
               {" "}
        <div className="max-w-4xl mx-auto bg-gray-900 rounded-xl p-6 shadow-lg">
                   {" "}
          <textarea
            id="prompt"
            rows={4}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white mb-4"
            placeholder="Describe the image you want to generate..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          {/* --- NEW: UI for options (Style, Size, Count) --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg"
              >
                {STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Aspect Ratio
              </label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg"
              >
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Number of Images
              </label>
              <select
                value={n}
                onChange={(e) => setN(Number(e.target.value))}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg"
              >
                {IMAGE_COUNTS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
                    {error && <p className="text-red-400 mb-4">{error}</p>}     
             {" "}
          <button
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors mb-8"
            onClick={handleGenerate}
            disabled={loading}
          >
                        {loading ? "Generating…" : "Generate Image"}         {" "}
          </button>
                    {/* Image display grid (no changes needed here) */}         {" "}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {" "}
            {images.length > 0 ? (
              images.map((url, i) => (
                <div key={i} className="relative group">
                                   {" "}
                  <img
                    src={url}
                    alt={`Generated #${i + 1}`}
                    className="rounded-lg border border-gray-700 object-cover w-full"
                  />
                                   {" "}
                  <button
                    onClick={() => handleDownload(url, i)}
                    className="absolute bottom-3 right-3 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg opacity-90 transition-opacity"
                    title="Download image"
                  >
                                        {/* ... download icon SVG ... */}       
                             {" "}
                  </button>
                                 {" "}
                </div>
              ))
            ) : (
              <div className="col-span-full bg-gray-800 rounded-lg p-4 flex items-center justify-center min-h-64">
                               {" "}
                <p className="text-gray-400">
                                    Your generated images will appear here      
                           {" "}
                </p>
                             {" "}
              </div>
            )}
                     {" "}
          </div>
                 {" "}
        </div>
             {" "}
      </div>
            <Footer />   {" "}
    </main>
  );
}
