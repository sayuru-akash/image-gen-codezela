"use client";
import { useState, useCallback, useRef, useEffect, useId } from "react";
import Image from "next/image";
import TitleBar from "../titlebar";
import styles from "./slider.module.css";
import { apiCall, API_BASE_URL } from "@/utils/apiUtils";

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

const BRUSH_TYPES = [
  { name: "Round", type: "round", icon: "⚫", cursor: "crosshair" },
  { name: "Square", type: "square", icon: "⬛", cursor: "crosshair" },
  { name: "Soft", type: "soft", icon: "🔵", cursor: "crosshair" },
  { name: "Eraser", type: "eraser", icon: "🗑️", cursor: "grab" },
];

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function ImageInpaintingEditor() {
  const uniqueId = useId();
  const [originalImage, setOriginalImage] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isClient, setIsClient] = useState(false);

  // Enhanced masking states
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [brushType, setBrushType] = useState(BRUSH_TYPES[0]);
  const [brushOpacity, setBrushOpacity] = useState(0.7);
  const [maskCanvas, setMaskCanvas] = useState(null);
  const [showMask, setShowMask] = useState(true);
  const [showOriginal, setShowOriginal] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const maskCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 512, height: 512 });
  const [originalImageDimensions, setOriginalImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

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

  const handleOriginalImageChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!validateAndProcessFile(file, "Original image")) {
        e.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new window.Image(); // Use window.Image to avoid conflicts
        img.onload = () => {
          console.log("Image loaded:", img.width, img.height); // Debug log

          // Store original dimensions
          const originalWidth = img.width;
          const originalHeight = img.height;
          setOriginalImageDimensions({
            width: originalWidth,
            height: originalHeight,
          });

          // Calculate display canvas size maintaining aspect ratio
          const maxSize = 800; // Increased for better viewing
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

          const finalCanvasSize = {
            width: Math.round(displayWidth),
            height: Math.round(displayHeight),
          };

          console.log("Canvas size set to:", finalCanvasSize); // Debug log
          setCanvasSize(finalCanvasSize);

          const imageData = {
            id: uniqueId + "-image",
            file: file,
            preview: reader.result,
            name: file.name,
            element: img,
          };
          setOriginalImage(imageData);
          setError("");
          resetResults();
          // Reset zoom and pan
          setZoomLevel(1);
          setPanOffset({ x: 0, y: 0 });
        };
        img.onerror = () => {
          setError(`Failed to load image: ${file.name}`);
        };
        img.src = reader.result;
      };
      reader.onerror = () => {
        setError(`Failed to read ${file.name}`);
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [uniqueId]
  );

  // Initialize canvas when image is loaded
  useEffect(() => {
    if (originalImage && canvasRef.current && maskCanvasRef.current) {
      console.log("Initializing canvas with image:", originalImage.name); // Debug log

      const canvas = canvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      const ctx = canvas.getContext("2d");
      const maskCtx = maskCanvas.getContext("2d");

      // Set canvas dimensions
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      maskCanvas.width = canvasSize.width;
      maskCanvas.height = canvasSize.height;

      // Set canvas display size
      canvas.style.width = `${canvasSize.width}px`;
      canvas.style.height = `${canvasSize.height}px`;
      maskCanvas.style.width = `${canvasSize.width}px`;
      maskCanvas.style.height = `${canvasSize.height}px`;

      // Clear canvases
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

      // Draw original image
      try {
        ctx.drawImage(
          originalImage.element,
          0,
          0,
          canvasSize.width,
          canvasSize.height
        );
        console.log("Image drawn to canvas successfully"); // Debug log
      } catch (error) {
        console.error("Error drawing image to canvas:", error);
        setError("Failed to display image on canvas");
      }

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

  const drawBrush = (ctx, x, y, isErasing = false) => {
    ctx.save();

    if (isErasing) {
      ctx.globalCompositeOperation = "destination-out";
    } else {
      ctx.globalCompositeOperation = "source-over";
    }

    const radius = brushSize / 2;

    switch (brushType.type) {
      case "round":
        ctx.fillStyle = `rgba(255, 255, 255, ${brushOpacity})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
        break;

      case "square":
        ctx.fillStyle = `rgba(255, 255, 255, ${brushOpacity})`;
        ctx.fillRect(x - radius, y - radius, brushSize, brushSize);
        break;

      case "soft":
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${brushOpacity})`);
        gradient.addColorStop(
          0.5,
          `rgba(255, 255, 255, ${brushOpacity * 0.5})`
        );
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
        break;

      case "eraser":
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "rgba(0, 0, 0, 1)";
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
        break;
    }

    ctx.restore();
  };

  const startDrawing = (e) => {
    if (!maskCanvas) return;

    // Check if it's a right click for panning
    if (e.button === 2) {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    setIsDrawing(true);
    const pos = getMousePos(maskCanvasRef.current, e);
    const ctx = maskCanvas.getContext("2d");
    drawBrush(ctx, pos.x, pos.y, brushType.type === "eraser");
  };

  const draw = (e) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      setPanOffset((prev) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    if (!isDrawing || !maskCanvas) return;

    const pos = getMousePos(maskCanvasRef.current, e);
    const ctx = maskCanvas.getContext("2d");
    drawBrush(ctx, pos.x, pos.y, brushType.type === "eraser");
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setIsPanning(false);
  };

  const clearMask = () => {
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext("2d");
    ctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
  };

  const handleZoom = (delta) => {
    const newZoom = Math.max(0.1, Math.min(3, zoomLevel + delta));
    setZoomLevel(newZoom);
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
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

      // Replace this with your actual API endpoint
      const response = await apiCall("/edit-with-mask", {
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

  if (!isClient) {
    return <div className="h-screen bg-foundation-blue">Loading...</div>;
  }

  return (
    <div className="grid grid-cols-12 gap-4 h-screen bg-foundation-blue">
      <div className="col-span-1 p-4">
        <div className="relative px-4 py-8 flex flex-col bg-dark-blue border border-white/50 rounded-2xl h-full w-20">
          <div className="absolute -right-4 top-18 flex justify-center items-center w-8 h-8 bg-gradient-to-r from-gold from-50% to-white/60 to-95% text-white rounded-full hover:from-white/20 hover:to-gold cursor-pointer transition-all duration-500">
            <svg
              className="w-3 h-3 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <div className="grid justify-items-center w-fit mx-auto">
            <div className="bg-white rounded w-6 h-6 flex items-center mb-8">
              <svg
                className="w-6 h-6 text-dark-blue"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <button
              onClick={() => document.getElementById("imageInput").click()}
            >
              <div className="rounded w-10 h-10 p-2 border-2 border-dashed border-gold mt-8 cursor-pointer">
                <input
                  id="imageInput"
                  type="file"
                  onChange={handleOriginalImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <svg
                  className="w-6 h-6 text-gold"
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
            </button>

            {/* Brush Tools */}
            {originalImage && (
              <div className="mt-6 space-y-3 w-full">
                <div className="text-white text-xs text-center">Tools</div>
                {BRUSH_TYPES.map((brush, index) => (
                  <div
                    key={brush.type}
                    className={`rounded-lg w-12 h-12 cursor-pointer border-2 transition-all duration-200 flex items-center justify-center ${
                      brushType.type === brush.type
                        ? "border-yellow-500 bg-yellow-500/20"
                        : "border-white/30 hover:border-yellow-500/60"
                    }`}
                    onClick={() => setBrushType(brush)}
                    title={brush.name}
                  >
                    <span className="text-lg">{brush.icon}</span>
                  </div>
                ))}

                {/* Brush Size Control */}
                <div className="mt-4">
                  <div className="text-white text-xs text-center mb-2">
                    Size
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className={`w-full h-1 bg-gray-700 rounded-lg cursor-pointer ${styles.rangeSlider}`}
                  />
                  <div className="text-white text-xs text-center mt-1">
                    {brushSize}px
                  </div>
                </div>

                {/* Brush Opacity Control */}
                <div className="mt-3">
                  <div className="text-white text-xs text-center mb-2">
                    Opacity
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={brushOpacity}
                    onChange={(e) =>
                      setBrushOpacity(parseFloat(e.target.value))
                    }
                    className={`w-full h-1 bg-gray-700 rounded-lg cursor-pointer ${styles.rangeSlider}`}
                  />
                  <div className="text-white text-xs text-center mt-1">
                    {Math.round(brushOpacity * 100)}%
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative col-span-11 py-5 px-14">
        <TitleBar />

        {/* Main Canvas Area */}
        <div className="flex-grow h-9/12 bg-gray-800 mt-6 rounded-lg relative overflow-hidden">
          {!originalImage ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-white/60 text-center">
                <div className="text-xl mb-2">
                  Upload an image to start editing
                </div>
                <div className="text-sm">
                  Click the image icon on the left to begin
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Canvas Container */}
              <div
                className="absolute inset-4 flex items-center justify-center"
                style={{
                  transform: `scale(${zoomLevel}) translate(${
                    panOffset.x / zoomLevel
                  }px, ${panOffset.y / zoomLevel}px)`,
                  transformOrigin: "center center",
                }}
              >
                <div className="relative">
                  {/* Original Image Canvas */}
                  {showOriginal && (
                    <canvas
                      ref={canvasRef}
                      className="block rounded border border-gray-500"
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                        display: "block",
                      }}
                    />
                  )}
                  {/* Mask Canvas */}
                  <canvas
                    ref={maskCanvasRef}
                    className="absolute top-0 left-0 rounded border border-gray-500"
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                      opacity: showMask ? 1 : 0,
                      cursor: brushType.cursor,
                      display: "block",
                      pointerEvents: "auto",
                    }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </div>
              </div>

              {/* Zoom Controls */}
              <div className="absolute top-3 right-3 flex flex-col gap-1 bg-black/50 rounded p-1">
                <button
                  onClick={() => handleZoom(0.1)}
                  className="p-1 text-white hover:bg-gray-600 rounded text-xs"
                  title="Zoom In"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleZoom(-0.1)}
                  className="p-1 text-white hover:bg-gray-600 rounded text-xs"
                  title="Zoom Out"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={resetView}
                  className="p-1 text-white hover:bg-gray-600 rounded text-xs"
                  title="Reset View"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {/* Canvas Controls */}
              <div className="absolute top-3 left-3 flex gap-2">
                <button
                  onClick={() => setShowOriginal(!showOriginal)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    showOriginal
                      ? "bg-blue-600 text-white"
                      : "bg-black/50 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Original
                </button>
                <button
                  onClick={() => setShowMask(!showMask)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    showMask
                      ? "bg-green-600 text-white"
                      : "bg-black/50 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Mask
                </button>
                <button
                  onClick={clearMask}
                  className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
                >
                  Clear
                </button>
              </div>

              {/* Zoom Level Display */}
              <div className="absolute bottom-3 right-3 bg-black/50 text-white px-2 py-1 rounded text-xs">
                {Math.round(zoomLevel * 100)}%
              </div>

              {/* Generated Result Overlay */}
              {resultUrl && (
                <div className="absolute inset-4 bg-gray-900/95 flex items-center justify-center rounded">
                  <div className="text-center">
                    <Image
                      src={resultUrl}
                      alt="Generated result"
                      width={400}
                      height={400}
                      className="max-w-full max-h-full object-contain rounded border border-gray-600"
                      unoptimized={true}
                    />
                    <button
                      onClick={() => setResultUrl("")}
                      className="mt-3 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm mr-2"
                    >
                      Back to Edit
                    </button>
                    <button className="mt-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded text-sm">
                      Download
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="absolute flex justify-between p-2 bottom-5 left-14 right-14 bg-dark-blue border border-white/50 rounded-full h-fit">
          <div className="flex gap-4 items-center">
            <button
              onClick={() => document.getElementById("imageInput").click()}
              className="w-fit bg-gradient-to-r from-gold from-50% to-white/60 to-95% text-white text-sm font-medium px-8 py-2 rounded-full hover:from-white/20 hover:to-gold cursor-pointer transition-all duration-500"
            >
              {originalImage ? "Change Image" : "Add Image"}
            </button>

            <div className="bg-white w-0.5 h-full"></div>

            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what to generate in the masked area..."
              className="text-white outline-none transition-all bg-transparent flex-1"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!canSubmit}
            className="w-fit bg-gradient-to-r from-gold from-50% to-white/60 to-95% text-white text-sm font-medium px-8 py-2 rounded-full hover:from-white/20 hover:to-gold cursor-pointer transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                Processing...
              </div>
            ) : (
              "Generate"
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="absolute bottom-20 left-14 right-14 bg-red-600/90 text-white px-4 py-2 rounded text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
