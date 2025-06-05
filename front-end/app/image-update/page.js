"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const STYLES = ["Realistic", "Digital Art", "Painting", "Sci-Fi", "Abstract"];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function ImageUpdate() {
  const [uploadedImageFile, setUploadedImageFile] = useState(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState("");
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState(STYLES[0]);
  const [resultUrls, setResultUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const resetStateForNewUpload = () => {
    setUploadedImageFile(null);
    setUploadedImagePreview("");
    setResultUrls([]);
    setError("");
  };

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) {
      resetStateForNewUpload();
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File is too large. Max size: ${MAX_FILE_SIZE_MB} MB`);
      resetStateForNewUpload();
      e.target.value = "";
      return;
    }

    // Read file into a data URL so we can show a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImageFile(file);
      setUploadedImagePreview(reader.result); // e.g. "data:image/png;base64,…"
      setError("");
      setResultUrls([]);
    };
    reader.onerror = () => {
      setError("Failed to read the image file.");
      resetStateForNewUpload();
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);

  const handleRemoveUploadedImage = () => {
    resetStateForNewUpload();
  };

  const handleGenerate = async () => {
    if (!uploadedImageFile || !prompt) {
      setError("Please upload an image and enter a prompt.");
      return;
    }

    setError("");
    setIsLoading(true);
    setResultUrls([]);

    try {
      const formData = new FormData();
      formData.append("image", uploadedImageFile);
      formData.append("prompt", prompt);
      formData.append("style", style);

      const response = await fetch("http://localhost:8000/edit-image", {
        method: "POST",
        body: formData,
      });
     

      if (!response.ok) {
        // Attempt to parse the JSON error if possible
        const errorData = await response
          .json()
          .catch(() => ({
            error: "Failed to edit image: " + response.statusText,
          }));
        throw new Error(errorData.error || "Image editing failed.");
      }

      const data = await response.json();
      const { image_url } = data;

      if (!image_url) {
        throw new Error("No image returned from the server.");
      }

      // image_url is already a data URL ("data:image/png;base64,…")
      setResultUrls([image_url]);
    } catch (err) {
      console.error("Image editing failed:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
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
        </div>

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            AI Background Replacement
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Upload an image, describe a new background, and let AI transform it.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-medium mb-4">
                1. Upload &amp; Describe
              </h3>

              {!uploadedImagePreview ? (
                <label className="border-2 border-dashed border-gray-700 rounded-lg h-64 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    className="hidden"
                    onChange={handleFileChange}
                    aria-label="Upload source image"
                  />
                  <svg
                    className="w-12 h-12 text-gray-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-400 mb-1">Click to upload an image</p>
                  <p className="text-gray-500 text-sm">
                    PNG or JPG (max. {MAX_FILE_SIZE_MB} MB)
                  </p>
                </label>
              ) : (
                <div className="relative h-64 rounded-lg overflow-hidden border border-gray-700">
                  {/* Use a plain <img> tag for data URLs */}
                  <img
                    src={uploadedImagePreview}
                    alt="Uploaded preview"
                    className="object-contain w-full h-full"
                  />
                  <button
                    className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
                    onClick={handleRemoveUploadedImage}
                    aria-label="Remove uploaded image"
                  >
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Background Style
                </label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {STYLES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStyle(s)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        style === s
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 hover:bg-gray-600 text-gray-200"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Describe the new background
                </label>
                <textarea
                  placeholder="e.g., a futuristic cityscape at sunset"
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />

                <button
                  className={`w-full py-3 mt-4 rounded-lg font-semibold transition-colors text-white ${
                    uploadedImagePreview && prompt && !isLoading
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-700 cursor-not-allowed"
                  }`}
                  disabled={!uploadedImagePreview || !prompt || isLoading}
                  onClick={handleGenerate}
                >
                  {isLoading
                    ? "Generating Your Image..."
                    : "Transform Background"}
                </button>

                {error && (
                  <p className="mt-3 text-sm text-red-400 text-center">
                    {error}
                  </p>
                )}
              </div>
            </div>

            {/* Result Section */}
            <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-medium mb-4">
                2. Your Transformed Image
              </h3>
              <div className="bg-gray-800 rounded-lg min-h-[16rem] h-full flex items-center justify-center border border-gray-700">
                {isLoading && (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-3"></div>
                    <p className="text-gray-400">Processing, please wait...</p>
                  </div>
                )}

                {!isLoading && resultUrls.length > 0
                  ? resultUrls.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative w-full h-64 md:h-full rounded-lg overflow-hidden"
                      >
                        {/* Use a plain <img> for the data URL */}
                        <img
                          src={url}
                          alt={`Generated result ${idx + 1}`}
                          className="object-contain w-full h-full"
                        />
                        <a
                          href={url}
                          download={`transformed-image-${Date.now()}.png`}
                          className="absolute bottom-3 right-3 p-2.5 bg-black/60 rounded-lg hover:bg-black/80 transition-colors"
                          aria-label="Download transformed image"
                        >
                          <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                        </a>
                      </div>
                    ))
                  : !isLoading && (
                      <p className="text-gray-400 p-4 text-center">
                        Your transformed image will appear here once generated.
                      </p>
                    )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
