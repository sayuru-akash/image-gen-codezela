"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const STYLES = ["Realistic", "Digital Art", "Painting", "Sci-Fi", "Abstract", "Oil Painting", "Watercolor", "Anime", "Photography"];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

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

export default function ImageInpaintingEditor() {
  const [originalImage, setOriginalImage] = useState(null);
  const [maskImage, setMaskImage] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState(STYLES[0]);
  const [resultUrl, setResultUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const resetResults = () => {
    setResultUrl("");
    setError("");
  };

  const validateAndProcessFile = (file, type) => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`${type} file is too large. Max size: ${MAX_FILE_SIZE_MB}MB`);
      return false;
    }
    return true;
  };

  const handleOriginalImageChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateAndProcessFile(file, "Original image")) {
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const imageData = {
        id: Date.now() + Math.random(),
        file: file,
        preview: reader.result,
        name: file.name
      };
      setOriginalImage(imageData);
      setError("");
      resetResults();
    };
    reader.onerror = () => {
      setError(`Failed to read ${file.name}`);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);

  const handleMaskImageChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateAndProcessFile(file, "Mask image")) {
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const imageData = {
        id: Date.now() + Math.random(),
        file: file,
        preview: reader.result,
        name: file.name
      };
      setMaskImage(imageData);
      setError("");
      resetResults();
    };
    reader.onerror = () => {
      setError(`Failed to read ${file.name}`);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);

  const handleRemoveOriginalImage = () => {
    setOriginalImage(null);
    resetResults();
  };

  const handleRemoveMaskImage = () => {
    setMaskImage(null);
    resetResults();
  };

  const handleRemoveAllImages = () => {
    setOriginalImage(null);
    setMaskImage(null);
    resetResults();
  };

  const canSubmit = originalImage && maskImage && prompt.trim().length > 0 && !isLoading;

  const handleGenerate = async () => {
    if (!canSubmit) {
      if (!originalImage) {
        setError("Please upload an original image.");
      } else if (!maskImage) {
        setError("Please upload a mask image.");
      } else if (!prompt.trim()) {
        setError("Please enter a prompt describing what to generate in the masked area.");
      }
      return;
    }

    setError("");
    setIsLoading(true);
    setResultUrl("");

    try {
      // Simulate API call for image inpainting
      const formData = new FormData();
      formData.append("original_image", originalImage.file);
      formData.append("mask_image", maskImage.file);
      formData.append("prompt", prompt);
      formData.append("style", style);

      // Replace this with your actual API endpoint
      const response = await fetch("/api/inpaint-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: "Inpainting failed: " + response.statusText,
        }));
        throw new Error(errorData.error || "Inpainting failed");
      }

      const { inpaintedImage } = await response.json();
      
      // For demo purposes, we'll use the original image
      // In real implementation, this would be the inpainted image URL
      setResultUrl(inpaintedImage || originalImage.preview);
    } catch (err) {
      console.error("Inpainting failed:", err);
      setError(err.message || "An unexpected error occurred during inpainting.");
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
            AI Image Inpainting Editor
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Upload an image and a mask to edit specific areas with AI. The mask defines which parts to modify.
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Upload Section */}
          <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-medium">1. Upload Images</h3>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">
                  {(originalImage ? 1 : 0) + (maskImage ? 1 : 0)}/2 images
                </span>
                {(originalImage || maskImage) && (
                  <button
                    onClick={handleRemoveAllImages}
                    className="text-red-400 hover:text-red-300 text-sm font-medium"
                  >
                    Remove All
                  </button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original Image Upload */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-blue-400">Original Image</h4>
                {!originalImage ? (
                  <label className="border-2 border-dashed border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors aspect-square">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/gif"
                      className="hidden"
                      onChange={handleOriginalImageChange}
                      aria-label="Upload original image"
                    />
                    <svg
                      className="w-10 h-10 text-gray-400 mb-2"
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
                    <p className="text-gray-400 mb-1 text-center">Click to upload original image</p>
                    <p className="text-gray-500 text-sm text-center">
                      PNG, JPG or GIF (max. {MAX_FILE_SIZE_MB}MB)
                    </p>
                  </label>
                ) : (
                  <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-700">
                    <Image
                      src={originalImage.preview}
                      alt={`Original image: ${originalImage.name}`}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                    <button
                      className="absolute top-2 right-2 p-1.5 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                      onClick={handleRemoveOriginalImage}
                      aria-label={`Remove ${originalImage.name}`}
                    >
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-sm p-2">
                      <p className="truncate font-medium">Original Image</p>
                      <p className="truncate text-xs text-gray-300">{originalImage.name}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Mask Image Upload */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-green-400">Mask Image</h4>
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-300 mb-2">
                    <strong>Mask Guidelines:</strong>
                  </p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• White areas = parts to edit/inpaint</li>
                    <li>• Black areas = parts to keep unchanged</li>
                    <li>• Should match original image dimensions</li>
                  </ul>
                </div>
                {!maskImage ? (
                  <label className="border-2 border-dashed border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 transition-colors aspect-square">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/gif"
                      className="hidden"
                      onChange={handleMaskImageChange}
                      aria-label="Upload mask image"
                    />
                    <svg
                      className="w-10 h-10 text-gray-400 mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    <p className="text-gray-400 mb-1 text-center">Click to upload mask image</p>
                    <p className="text-gray-500 text-sm text-center">
                      PNG, JPG or GIF (max. {MAX_FILE_SIZE_MB}MB)
                    </p>
                  </label>
                ) : (
                  <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-700">
                    <Image
                      src={maskImage.preview}
                      alt={`Mask image: ${maskImage.name}`}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                    <button
                      className="absolute top-2 right-2 p-1.5 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                      onClick={handleRemoveMaskImage}
                      aria-label={`Remove ${maskImage.name}`}
                    >
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-sm p-2">
                      <p className="truncate font-medium">Mask Image</p>
                      <p className="truncate text-xs text-gray-300">{maskImage.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Settings and Prompt Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-medium mb-4">2. Choose Style</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      style === s
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 hover:bg-gray-600 text-gray-200"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-medium mb-4">3. Describe What to Generate</h3>
              
              <label
                htmlFor="prompt-input"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Inpainting prompt *
              </label>
              <textarea
                id="prompt-input"
                placeholder="e.g., a beautiful garden, a modern building, a sunset sky, remove the person, add a cat, change the background to a forest..."
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                required
              />

              <button
                className={`w-full py-3 mt-4 rounded-lg font-semibold transition-colors text-white ${
                  canSubmit
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-700 cursor-not-allowed"
                }`}
                disabled={!canSubmit}
                onClick={handleGenerate}
              >
                {isLoading
                  ? "Processing Image..."
                  : "Generate Inpainted Image"}
              </button>
              
              {error && (
                <p className="mt-3 text-sm text-red-400 text-center">
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-medium mb-4">4. Inpainted Result</h3>
            
            <div className="bg-gray-800 rounded-lg min-h-[20rem] flex items-center justify-center border border-gray-700">
              {isLoading && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-3"></div>
                  <p className="text-gray-400">
                    Processing your image with AI inpainting...
                  </p>
                </div>
              )}
              
              {!isLoading && resultUrl && (
                <div className="w-full max-w-2xl">
                  <div className="bg-gray-700 rounded-lg overflow-hidden">
                    <div className="aspect-square relative">
                      <Image
                        src={resultUrl}
                        alt="Inpainted result"
                        fill
                        style={{ objectFit: "cover" }}
                      />
                      <a
                        href={resultUrl}
                        download="inpainted-image.png"
                        className="absolute top-2 right-2 p-2 bg-black/60 rounded-lg hover:bg-black/80 transition-colors"
                        aria-label="Download inpainted image"
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
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                      </a>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-300 font-medium">
                        Inpainted Image
                      </p>
                      <p className="text-xs text-gray-400">
                        Style: {style} | Prompt: {prompt.substring(0, 50)}...
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                      Download Image
                    </button>
                  </div>
                </div>
              )}
              
              {!isLoading && !resultUrl && (
                <div className="text-center p-8">
                  <svg
                    className="w-16 h-16 text-gray-500 mx-auto mb-4"
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
                  <p className="text-gray-400">
                    Your inpainted image will appear here once processing is complete.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}