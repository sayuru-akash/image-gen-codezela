// app/text-to-image/page.js
"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const STYLES = ["Realistic", "Digital Art", "Painting", "Sci-Fi", "Abstract"];

export default function TextToImage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState(STYLES[0]);
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
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style }),
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

  const handleDownload = (url, index) => {
    // Create a temporary link element
    const link = document.createElement("a");
    link.href = url;
    link.download = `generated-image-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen flex flex-col gradient-bg text-white">
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
            to life
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-gray-900 rounded-xl p-6 shadow-lg">
          <textarea
            id="prompt"
            rows={4}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white mb-4"
            placeholder="Describe the image you want to generate..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <div className="flex flex-wrap gap-4 mb-6">
            {STYLES.map((s) => (
              <button
                key={s}
                className={`px-3 py-1 rounded-full text-sm ${
                  style === s ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
                }`}
                onClick={() => setStyle(s)}
              >
                {s}
              </button>
            ))}
          </div>

          {error && <p className="text-red-400 mb-4">{error}</p>}

          <button
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors mb-8"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "Generating…" : "Generate Image"}
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {images.length > 0 ? (
              images.map((url, i) => (
                <div key={i} className="relative group">
                  <img
                    src={url}
                    alt={`Generated #${i + 1}`}
                    className="rounded-lg border border-gray-700 object-cover w-full"
                  />
                  <button
                    onClick={() => handleDownload(url, i)}
                    className="absolute bottom-3 right-3 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg opacity-90 transition-opacity"
                    title="Download image"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-gray-800 rounded-lg p-4 flex items-center justify-center min-h-64">
                <p className="text-gray-400">
                  Your generated image will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
