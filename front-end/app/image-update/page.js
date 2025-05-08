//app/image-update/page.js
"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const STYLES = ["Realistic", "Digital Art", "Painting", "Sci-Fi", "Abstract"];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const dataURLtoFile = (dataurl, filename) => {
  if (!dataurl) return null;
  try {
    const arr = dataurl.split(",");
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Cannot find MIME type");
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  } catch (error) {
    console.error("Error converting data URL to file:", error);
    return null;
  }
};

const loadImageDimensions = (src) => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    if (!src.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }

    img.onload = () =>
      resolve({ width: img.width, height: img.height, element: img });
    img.onerror = (errorEvent) => {
      let detailedError = `Failed to load image from: ${src.substring(0, 100)}${
        src.length > 100 ? "..." : ""
      }.`;
      if (!src.startsWith("data:") && img.crossOrigin === "anonymous") {
        detailedError +=
          " This may be a CORS issue if the remote server does not send 'Access-Control-Allow-Origin' headers.";
      }
      console.error(detailedError, errorEvent);
      reject(new Error(detailedError));
    };
    img.src = src;
  });
};

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
      setError(`File is too large. Max size: ${MAX_FILE_SIZE_MB}MB`);
      resetStateForNewUpload();
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImageFile(file);
      setUploadedImagePreview(reader.result);
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
      const removeBgFormData = new FormData();
      removeBgFormData.append("image", uploadedImageFile);

      const removeBgRes = await fetch("/api/remove-background", {
        method: "POST",
        body: removeBgFormData,
      });

      if (!removeBgRes.ok) {
        const errorData = await removeBgRes.json().catch(() => ({
          error: "Background removal request failed: " + removeBgRes.statusText,
        }));
        throw new Error(errorData.error || "Background removal failed");
      }

      const { image: fgBase64 } = await removeBgRes.json();
      const foregroundImageUrl = `data:image/png;base64,${fgBase64}`;

      // Load foreground (data URL, no CORS issue expected)
      const {
        width: fgWidth,
        height: fgHeight,
        element: fgImageElement,
      } = await loadImageDimensions(foregroundImageUrl);

      const generateBgRes = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          style: style,
          size: `${fgWidth}x${fgHeight}`,
          n: 1,
        }),
      });

      if (!generateBgRes.ok) {
        const errorData = await generateBgRes.json().catch(() => ({
          error:
            "Background generation request failed: " + generateBgRes.statusText,
        }));
        throw new Error(errorData.error || "Background generation failed");
      }

      const { images: bgImageUrls } = await generateBgRes.json();
      if (!bgImageUrls || bgImageUrls.length === 0) {
        throw new Error("No background images were generated.");
      }

      // Load background (external URL, CORS handling via crossOrigin="anonymous" in loadImageDimensions)
      const { element: bgImageElement } = await loadImageDimensions(
        bgImageUrls[0]
      );

      const canvas = document.createElement("canvas");
      canvas.width = fgWidth;
      canvas.height = fgHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not get canvas context for image compositing.");
      }

      // Draw background first
      ctx.drawImage(bgImageElement, 0, 0, fgWidth, fgHeight);
      // Draw foreground on top
      ctx.drawImage(fgImageElement, 0, 0, fgWidth, fgHeight);

      // This is where the "Tainted canvases" error would occur if CORS isn't handled
      const mergedImageUrl = canvas.toDataURL("image/png");
      setResultUrls([mergedImageUrl]);
    } catch (err) {
      console.error("Generation process failed:", err);
      setError(
        err.message || "An unexpected error occurred during generation."
      );
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
              <h3 className="text-xl font-medium mb-4">1. Upload & Describe</h3>
              {!uploadedImagePreview ? (
                <label className="border-2 border-dashed border-gray-700 rounded-lg h-64 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/gif"
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
                    PNG, JPG or GIF (max. {MAX_FILE_SIZE_MB}MB)
                  </p>
                </label>
              ) : (
                <div className="relative h-64 rounded-lg overflow-hidden border border-gray-700">
                  <Image
                    src={uploadedImagePreview}
                    alt="Uploaded preview"
                    fill
                    style={{ objectFit: "contain" }}
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
                <label
                  htmlFor="style-selector"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Background Style
                </label>
                <div id="style-selector" className="flex flex-wrap gap-2 mb-4">
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

                <label
                  htmlFor="prompt-input"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Describe the new background
                </label>
                <textarea
                  id="prompt-input"
                  placeholder="e.g., a futuristic cityscape at sunset, a serene forest path, an abstract swirl of colors"
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
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
                        <Image
                          src={url}
                          alt={`Generated result ${idx + 1}`}
                          fill
                          style={{ objectFit: "contain" }}
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
