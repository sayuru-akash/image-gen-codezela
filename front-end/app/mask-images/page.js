"use client";
import { useState, useCallback, useRef, useEffect } from "react";

const STYLES = [
  "Realistic",
  "Digital Art",
  "Painting",
  "Sci-Fi",
  "Abstract",
  "Oil Painting",
  "Watercolor",
  "Anime",
  "Photography",
];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function ImageInpaintingEditor() {
  const [originalImage, setOriginalImage] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState(STYLES[0]);
  const [resultUrl, setResultUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Masking states
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [maskCanvas, setMaskCanvas] = useState(null);
  const [showMask, setShowMask] = useState(true);
  const canvasRef = useRef(null);
  const maskCanvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 512, height: 512 });
  const [originalImageDimensions, setOriginalImageDimensions] = useState({
    width: 0,
    height: 0,
  });

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
      const img = new Image();
      img.onload = () => {
        // Store original dimensions
        const originalWidth = img.width;
        const originalHeight = img.height;
        setOriginalImageDimensions({
          width: originalWidth,
          height: originalHeight,
        });

        // Calculate display canvas size maintaining aspect ratio
        const maxSize = 512;
        let displayWidth = originalWidth;
        let displayHeight = originalHeight;

        if (displayWidth > displayHeight) {
          if (displayWidth > maxSize) {
            displayHeight = (displayHeight * maxSize) / displayWidth;
            displayWidth = maxSize;
          }
        } else {
          if (displayHeight > maxSize) {
            displayWidth = (displayWidth * maxSize) / displayHeight;
            displayHeight = maxSize;
          }
        }

        setCanvasSize({
          width: Math.round(displayWidth),
          height: Math.round(displayHeight),
        });

        const imageData = {
          id: Date.now() + Math.random(),
          file: file,
          preview: reader.result,
          name: file.name,
          element: img,
        };
        setOriginalImage(imageData);
        setError("");
        resetResults();
      };
      img.src = reader.result;
    };
    reader.onerror = () => {
      setError(`Failed to read ${file.name}`);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);

  // Initialize canvas when image is loaded
  useEffect(() => {
    if (originalImage && canvasRef.current && maskCanvasRef.current) {
      const canvas = canvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      const ctx = canvas.getContext("2d");
      const maskCtx = maskCanvas.getContext("2d");

      // Set canvas dimensions
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      maskCanvas.width = canvasSize.width;
      maskCanvas.height = canvasSize.height;

      // Draw original image
      ctx.drawImage(
        originalImage.element,
        0,
        0,
        canvasSize.width,
        canvasSize.height
      );

      // Initialize mask with transparent background
      maskCtx.fillStyle = "rgba(0, 0, 0, 0)";
      maskCtx.fillRect(0, 0, canvasSize.width, canvasSize.height);

      setMaskCanvas(maskCanvas);
    }
  }, [originalImage, canvasSize]);

  const getMousePos = (canvas, e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e) => {
    if (!maskCanvas) return;
    setIsDrawing(true);

    const pos = getMousePos(maskCanvasRef.current, e);
    const ctx = maskCanvas.getContext("2d");

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, brushSize / 2, 0, 2 * Math.PI);
    ctx.fill();
  };

  const draw = (e) => {
    if (!isDrawing || !maskCanvas) return;

    const pos = getMousePos(maskCanvasRef.current, e);
    const ctx = maskCanvas.getContext("2d");

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, brushSize / 2, 0, 2 * Math.PI);
    ctx.fill();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearMask = () => {
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext("2d");
    ctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
  };

  const getMaskDataUrl = () => {
    if (
      !maskCanvas ||
      !originalImageDimensions.width ||
      !originalImageDimensions.height
    )
      return null;

    // Create a new canvas with original image dimensions
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = originalImageDimensions.width;
    finalCanvas.height = originalImageDimensions.height;
    const finalCtx = finalCanvas.getContext("2d");

    // Fill with black background
    finalCtx.fillStyle = "black";
    finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

    // Scale the mask from display size to original size
    const maskCtx = maskCanvas.getContext("2d");
    const maskImageData = maskCtx.getImageData(
      0,
      0,
      maskCanvas.width,
      maskCanvas.height
    );

    // Create a temporary canvas to scale the mask
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = maskCanvas.width;
    tempCanvas.height = maskCanvas.height;
    const tempCtx = tempCanvas.getContext("2d");

    // Convert mask to white on transparent
    const tempImageData = tempCtx.createImageData(
      maskCanvas.width,
      maskCanvas.height
    );
    const tempData = tempImageData.data;
    const maskData = maskImageData.data;

    for (let i = 0; i < maskData.length; i += 4) {
      if (maskData[i + 3] > 0) {
        // If alpha > 0 (painted area)
        tempData[i] = 255; // R - white
        tempData[i + 1] = 255; // G - white
        tempData[i + 2] = 255; // B - white
        tempData[i + 3] = 255; // A - opaque
      } else {
        tempData[i] = 0; // R - transparent
        tempData[i + 1] = 0; // G - transparent
        tempData[i + 2] = 0; // B - transparent
        tempData[i + 3] = 0; // A - transparent
      }
    }

    tempCtx.putImageData(tempImageData, 0, 0);

    // Scale and draw the mask to the final canvas at original dimensions
    finalCtx.drawImage(
      tempCanvas,
      0,
      0,
      originalImageDimensions.width,
      originalImageDimensions.height
    );

    return finalCanvas.toDataURL("image/png");
  };

  const hasMask = () => {
    if (!maskCanvas) return false;
    const ctx = maskCanvas.getContext("2d");
    const imageData = ctx.getImageData(
      0,
      0,
      maskCanvas.width,
      maskCanvas.height
    );
    const data = imageData.data;

    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 0) return true;
    }
    return false;
  };

  const canSubmit =
    originalImage && hasMask() && prompt.trim().length > 0 && !isLoading;

  const handleGenerate = async () => {
    if (!canSubmit) {
      if (!originalImage) {
        setError("Please upload an original image.");
      } else if (!hasMask()) {
        setError("Please draw a mask on the areas you want to edit.");
      } else if (!prompt.trim()) {
        setError(
          "Please enter a prompt describing what to generate in the masked area."
        );
      }
      return;
    }

    setError("");
    setIsLoading(true);
    setResultUrl("");

    try {
      // Create mask image blob
      const maskDataUrl = getMaskDataUrl();
      const maskBlob = await fetch(maskDataUrl).then((r) => r.blob());

      // Create form data
      const formData = new FormData();
      formData.append("original_image", originalImage.file);
      formData.append("mask_image", maskBlob, "mask.png");
      formData.append("prompt", prompt);
      formData.append("style", style);

      // Replace this with your actual API endpoint
      const response = await fetch("http://localhost:8000/edit-with-mask", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: "Inpainting failed: " + response.statusText,
        }));
        throw new Error(errorData.error || "Inpainting failed");
      }

      const { image_url } = await response.json();
      setResultUrl(image_url || originalImage.preview);
    } catch (err) {
      console.error("Inpainting failed:", err);
      setError(
        err.message || "An unexpected error occurred during inpainting."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            AI Image Inpainting Editor
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Upload an image and paint the areas you want to edit. Our AI will
            regenerate those areas based on your prompt.
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Upload Section */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                1
              </span>
              Upload Image
            </h3>

            {!originalImage ? (
              <label className="border-2 border-dashed border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/gif"
                  className="hidden"
                  onChange={handleOriginalImageChange}
                />
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
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
                </div>
                <p className="text-lg font-medium text-gray-300 mb-2">
                  Click to upload your image
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG or GIF (max. {MAX_FILE_SIZE_MB}MB)
                </p>
              </label>
            ) : (
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium text-green-400">
                      ✓ Image uploaded
                    </p>
                    <p className="text-sm text-gray-400">
                      {originalImage.name}
                    </p>
                  </div>
                  <button
                    onClick={() => setOriginalImage(null)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Masking Section */}
          {originalImage && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  2
                </span>
                Paint Areas to Edit
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="relative bg-gray-900 rounded-lg p-4">
                    <canvas
                      ref={canvasRef}
                      className="absolute inset-4 rounded border border-gray-600"
                      style={{ maxWidth: "100%", height: "auto" }}
                    />
                    <canvas
                      ref={maskCanvasRef}
                      className="absolute inset-4 rounded border border-gray-600 cursor-crosshair"
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                        opacity: showMask ? 1 : 0,
                      }}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                    <div
                      style={{
                        paddingBottom: `${
                          (canvasSize.height / canvasSize.width) * 100
                        }%`,
                        width: "100%",
                      }}
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
                    <button
                      onClick={() => setShowMask(!showMask)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                    >
                      {showMask ? "Hide Mask" : "Show Mask"}
                    </button>
                    <button
                      onClick={clearMask}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      Clear Mask
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Brush Size: {brushSize}px
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={brushSize}
                      onChange={(e) => setBrushSize(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-300 mb-2">
                      How to use:
                    </h4>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• Paint over areas you want to edit</li>
                      <li>• White areas will be regenerated</li>
                      <li>• Unpainted areas stay unchanged</li>
                      <li>• Adjust brush size as needed</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings and Generate Section */}
          {originalImage && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                    3
                  </span>
                  Choose Style
                </h3>

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

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                    4
                  </span>
                  Describe What to Generate
                </h3>

                <textarea
                  placeholder="e.g., a beautiful garden, a modern building, a sunset sky, remove the person, add a cat..."
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />

                <button
                  className={`w-full py-3 mt-4 rounded-lg font-semibold transition-colors text-white ${
                    canSubmit
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      : "bg-gray-600 cursor-not-allowed"
                  }`}
                  disabled={!canSubmit}
                  onClick={handleGenerate}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : (
                    "Generate Inpainted Image"
                  )}
                </button>

                {error && (
                  <p className="mt-3 text-sm text-red-400 text-center">
                    {error}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Results Section */}
          {(isLoading || resultUrl) && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  5
                </span>
                Result
              </h3>

              <div className="bg-gray-900 rounded-lg min-h-[20rem] flex items-center justify-center">
                {isLoading && (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-3"></div>
                    <p className="text-gray-400">
                      Processing your image with AI inpainting...
                    </p>
                  </div>
                )}

                {!isLoading && resultUrl && (
                  <div className="w-full max-w-2xl text-center">
                    <img
                      src={resultUrl}
                      alt="Inpainted result"
                      className="max-w-full h-auto rounded-lg border border-gray-600 mx-auto"
                    />
                    <button className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                      Download Result
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
