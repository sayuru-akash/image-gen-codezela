"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const STYLES = ["Realistic", "Digital Art", "Painting", "Sci-Fi", "Abstract", "Oil Painting", "Watercolor", "Anime", "Photography"];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_IMAGES = 2;

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

export default function MultiImageEditor() {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState(STYLES[0]);
  const [resultUrls, setResultUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const resetResults = () => {
    setResultUrls([]);
    setError("");
  };

  const handleFilesChange = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (files.length > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed.`);
      e.target.value = "";
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`File ${file.name} is too large. Max size: ${MAX_FILE_SIZE_MB}MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      e.target.value = "";
      return;
    }

    const newImages = [];
    let processedCount = 0;

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = {
          id: Date.now() + Math.random(),
          file: file,
          preview: reader.result,
          name: file.name
        };
        newImages.push(imageData);
        processedCount++;

        if (processedCount === validFiles.length) {
          setUploadedImages(newImages);
          setError("");
          resetResults();
        }
      };
      reader.onerror = () => {
        setError(`Failed to read ${file.name}`);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  }, []);

  const handleRemoveImage = (id) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
    resetResults();
  };

  const handleRemoveAllImages = () => {
    setUploadedImages([]);
    resetResults();
  };

  const canSubmit = uploadedImages.length === 2 && prompt.trim().length > 0 && !isLoading;

  const handleGenerate = async () => {
    if (!canSubmit) {
      if (uploadedImages.length !== 2) {
        setError("Please upload exactly 2 images.");
      } else if (!prompt.trim()) {
        setError("Please enter a prompt describing the transformation.");
      }
      return;
    }

    setError("");
    setIsLoading(true);
    setResultUrls([]);

    try {
      // Simulate API call for image processing
      const formData = new FormData();
      uploadedImages.forEach((image, index) => {
        formData.append(`image${index + 1}`, image.file);
      });
      formData.append("prompt", prompt);
      formData.append("style", style);

      // Replace this with your actual API endpoint
      const response = await fetch("/api/process-dual-images", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: "Processing failed: " + response.statusText,
        }));
        throw new Error(errorData.error || "Processing failed");
      }

      const { processedImages } = await response.json();
      
      // For demo purposes, we'll use the original images
      // In real implementation, this would be the processed image URLs
      const results = uploadedImages.map((image, index) => ({
        id: image.id,
        name: image.name,
        original: image.preview,
        processed: processedImages?.[index] || image.preview, // Replace with actual processed image
      }));

      setResultUrls(results);
    } catch (err) {
      console.error("Processing failed:", err);
      setError(err.message || "An unexpected error occurred during processing.");
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
            AI Dual Image Editor
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Upload 2 images, apply styles with prompts, and transform them with AI.
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Upload Section */}
          <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-medium">1. Upload 2 Images</h3>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">
                  {uploadedImages.length}/2 images
                </span>
                {uploadedImages.length > 0 && (
                  <button
                    onClick={handleRemoveAllImages}
                    className="text-red-400 hover:text-red-300 text-sm font-medium"
                  >
                    Remove All
                  </button>
                )}
              </div>
            </div>
            
            {uploadedImages.length < 2 ? (
              <label className="border-2 border-dashed border-gray-700 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/gif"
                  multiple
                  className="hidden"
                  onChange={handleFilesChange}
                  aria-label="Upload 2 images"
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
                <p className="text-gray-400 mb-1">Click to upload 2 images</p>
                <p className="text-gray-500 text-sm">
                  PNG, JPG or GIF (max. {MAX_FILE_SIZE_MB}MB each)
                </p>
              </label>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {uploadedImages.map((image, index) => (
                  <div
                    key={image.id}
                    className="relative aspect-square rounded-lg overflow-hidden border border-gray-700"
                  >
                    <Image
                      src={image.preview}
                      alt={`Image ${index + 1}: ${image.name}`}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                    <button
                      className="absolute top-2 right-2 p-1.5 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                      onClick={() => handleRemoveImage(image.id)}
                      aria-label={`Remove ${image.name}`}
                    >
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-sm p-2">
                      <p className="truncate font-medium">Image {index + 1}</p>
                      <p className="truncate text-xs text-gray-300">{image.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              <h3 className="text-xl font-medium mb-4">3. Describe Transformation</h3>
              
              <label
                htmlFor="prompt-input"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Transformation prompt *
              </label>
              <textarea
                id="prompt-input"
                placeholder="e.g., blend these images together, apply the style from image 1 to image 2, create a artistic fusion, transfer colors and lighting..."
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
                  ? "Processing Images..."
                  : "Transform Images"}
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
            <h3 className="text-xl font-medium mb-4">4. Transformed Images</h3>
            
            <div className="bg-gray-800 rounded-lg min-h-[20rem] flex items-center justify-center border border-gray-700">
              {isLoading && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-3"></div>
                  <p className="text-gray-400">
                    Processing your images...
                  </p>
                </div>
              )}
              
              {!isLoading && resultUrls.length > 0 && (
                <div className="w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {resultUrls.map((result, index) => (
                      <div key={result.id} className="bg-gray-700 rounded-lg overflow-hidden">
                        <div className="aspect-square relative">
                          <Image
                            src={result.processed}
                            alt={`Transformed ${result.name}`}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                          <a
                            href={result.processed}
                            download={`transformed-${result.name}`}
                            className="absolute top-2 right-2 p-2 bg-black/60 rounded-lg hover:bg-black/80 transition-colors"
                            aria-label={`Download transformed ${result.name}`}
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
                        <div className="p-3">
                          <p className="text-sm text-gray-300 font-medium">
                            Transformed Image {index + 1}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {result.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 text-center">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                      Download Both Images
                    </button>
                  </div>
                </div>
              )}
              
              {!isLoading && resultUrls.length === 0 && (
                <p className="text-gray-400 p-4 text-center">
                  Your transformed images will appear here once processing is complete.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}