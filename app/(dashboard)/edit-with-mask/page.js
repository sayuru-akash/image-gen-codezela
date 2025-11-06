"use client";
import { useState, useCallback, useRef, useEffect, useId } from "react";
import Image from "next/image";
import { BiSolidRightArrow, BiDownload, BiRefresh } from "react-icons/bi";
import {
  HiOutlinePhotograph,
  HiOutlineAdjustments,
  HiMenu,
  HiX,
} from "react-icons/hi";
import { MdCompareArrows } from "react-icons/md";
import { FiUpload, FiEdit3, FiCheck } from "react-icons/fi";
import { RiExpandDiagonalLine, RiBrushLine } from "react-icons/ri";
import { TbMask } from "react-icons/tb";
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Start collapsed by default
  const [selectedForEdit, setSelectedForEdit] = useState("original");
  const [showMessage, setShowMessage] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [imageHistory, setImageHistory] = useState([]);
  const [maskEnabled, setMaskEnabled] = useState(false);
  const [showMobileTools, setShowMobileTools] = useState(false);
  const [showMobileComparison, setShowMobileComparison] = useState(false);

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
  const [lastDrawPoint, setLastDrawPoint] = useState({ x: 0, y: 0 });
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0, visible: false });

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

  // Set initial sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      // On mobile (md breakpoint and below), keep sidebar collapsed
      // On desktop, expand sidebar
      if (window.innerWidth >= 768) {
        setSidebarCollapsed(false);
      } else {
        setSidebarCollapsed(true);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Show message notification
  const displayMessage = (message) => {
    setShowMessage(message);
    setTimeout(() => setShowMessage(null), 3000);
  };

  const downloadImage = (imageUrl, filename = "image") => {
    if (imageUrl) {
      try {
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = `${filename}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        displayMessage("Image downloaded successfully!");
      } catch (error) {
        displayMessage("Failed to download image");
      }
    }
  };

  const handleResize = () => {
    displayMessage("Resize feature coming soon!");
  };

  const handleRegenerate = () => {
    if (originalImage && prompt.trim()) {
      handleGenerate();
    } else {
      displayMessage("Please select an image and enter a prompt");
    }
  };

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
          console.log("Image loaded:", img.width, img.height);

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

          console.log("Canvas size set to:", finalCanvasSize);
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

    // Handle both mouse and touch events
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const drawBrush = (ctx, x, y, isErasing = false) => {
    ctx.save();

    if (isErasing || brushType.type === "eraser") {
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

  // Smooth line drawing between two points
  const drawLine = (ctx, x1, y1, x2, y2, isErasing = false) => {
    const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const steps = Math.ceil(distance / (brushSize * 0.1)); // Interpolate based on brush size

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;
      drawBrush(ctx, x, y, isErasing);
    }
  };

  const updateCursor = (e) => {
    if (!maskCanvasRef.current || !maskEnabled) return;

    const pos = getMousePos(maskCanvasRef.current, e);
    setCursorPos({
      x: pos.x,
      y: pos.y,
      visible: true,
    });
  };

  const hideCursor = () => {
    setCursorPos((prev) => ({ ...prev, visible: false }));
  };

  const startDrawing = (e) => {
    if (!maskCanvas || !maskEnabled) return;

    // Prevent default to avoid scrolling on touch devices
    e.preventDefault();

    // Check if it's a right click for panning
    if (e.button === 2) {
      setIsPanning(true);
      const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;
      setLastPanPoint({ x: clientX, y: clientY });
      return;
    }

    setIsDrawing(true);
    const pos = getMousePos(maskCanvasRef.current, e);
    setLastDrawPoint({ x: pos.x, y: pos.y });

    const ctx = maskCanvas.getContext("2d");
    drawBrush(ctx, pos.x, pos.y, brushType.type === "eraser");
  };

  const draw = (e) => {
    if (!maskCanvas || !maskEnabled) return;

    // Prevent default to avoid scrolling on touch devices
    e.preventDefault();

    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;

    if (isPanning) {
      const deltaX = clientX - lastPanPoint.x;
      const deltaY = clientY - lastPanPoint.y;
      setPanOffset((prev) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
      setLastPanPoint({ x: clientX, y: clientY });
      return;
    }

    // Update cursor position
    updateCursor(e);

    if (!isDrawing) return;

    const pos = getMousePos(maskCanvasRef.current, e);
    const ctx = maskCanvas.getContext("2d");

    // Draw smooth line from last point to current point
    drawLine(
      ctx,
      lastDrawPoint.x,
      lastDrawPoint.y,
      pos.x,
      pos.y,
      brushType.type === "eraser"
    );

    setLastDrawPoint({ x: pos.x, y: pos.y });
  };

  const stopDrawing = (e) => {
    if (e) {
      e.preventDefault();
    }
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
        displayMessage("Please upload an image first");
      } else if (!hasMask()) {
        setError("Please draw a mask on the areas you want to edit.");
        displayMessage("Please draw a mask on the image");
      } else if (!prompt.trim()) {
        setError(
          "Please enter a prompt describing what to generate in the masked area."
        );
        displayMessage("Please enter a prompt");
      }
      return;
    }

    setError("");
    setIsLoading(true);
    setResultUrl("");

    try {
      // Create mask image blob
      const maskDataUrl = getMaskDataUrl();
      if (!maskDataUrl) {
        throw new Error("Failed to create mask data");
      }

      const maskBlob = await fetch(maskDataUrl).then((r) => r.blob());

      // Validate image file
      if (
        !originalImage.file ||
        !originalImage.file.type.startsWith("image/")
      ) {
        throw new Error("Invalid image file");
      }

      // Create form data
      const formData = new FormData();
      formData.append("original_image", originalImage.file);
      formData.append("mask_image", maskBlob, "mask.png");
      formData.append("prompt", prompt);

      console.log("Sending mask edit request:", {
        hasOriginalImage: !!originalImage.file,
        imageType: originalImage.file.type,
        imageSize: originalImage.file.size,
        hasMask: !!maskBlob,
        prompt: prompt,
      });

      // Replace this with your actual API endpoint
      const response = await apiCall("/edit-with-mask", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: "Inpainting failed: " + response.statusText,
        }));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      let imageUrl = null;

      // Handle different response formats
      if (data.image_url) {
        imageUrl = data.image_url;
      } else if (data.image) {
        if (data.image.startsWith("data:image/")) {
          imageUrl = data.image;
        } else if (data.image.length > 1000) {
          imageUrl = `data:image/png;base64,${data.image}`;
        } else {
          imageUrl = data.image;
        }
      } else if (data.base64_image) {
        imageUrl = `data:image/png;base64,${data.base64_image}`;
      } else if (data.generated_images && data.generated_images.length > 0) {
        const firstImage = data.generated_images[0];
        if (firstImage.startsWith("data:image/")) {
          imageUrl = firstImage;
        } else {
          imageUrl = `data:image/png;base64,${firstImage}`;
        }
      } else {
        throw new Error("No image data received from server");
      }

      setResultUrl(imageUrl || originalImage.preview);
      setGeneratedImage(imageUrl);
      displayMessage("Image generated successfully!");
    } catch (err) {
      console.error("Inpainting failed:", err);

      // Provide more specific error messages
      if (err.message.includes("400")) {
        setError("Invalid request. Please check your image and mask.");
        displayMessage("Invalid request. Please check your image and mask.");
      } else if (err.message.includes("413")) {
        setError("Image file too large. Please use a smaller image.");
        displayMessage("Image file too large. Please use a smaller image.");
      } else if (err.message.includes("429")) {
        setError("Too many requests. Please wait a moment and try again.");
        displayMessage(
          "Too many requests. Please wait a moment and try again."
        );
      } else if (err.message.includes("500")) {
        setError("Server error. Please try again later.");
        displayMessage("Server error. Please try again later.");
      } else {
        setError(
          err.message || "An unexpected error occurred during inpainting."
        );
        displayMessage("Failed to generate image. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Mobile Tools Modal Component
  const MobileToolsModal = () => (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            <TbMask className="w-5 h-5 text-gold" />
            Mask Tools
          </h3>
          <button
            onClick={() => setShowMobileTools(false)}
            className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-all duration-200"
          >
            <HiX className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex-1 p-4 space-y-6">
          {/* Upload Section */}
          <div>
            <h4 className="text-white font-medium mb-3">Upload Image</h4>
            <button
              onClick={() => {
                document.getElementById("imageInput").click();
                setShowMobileTools(false);
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-gold/20 to-yellow-600/20 hover:from-gold/30 hover:to-yellow-600/30 border-2 border-dashed border-gold/50 hover:border-gold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              <FiUpload className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
              <span className="text-gold font-medium">Upload New Image</span>
            </button>
          </div>

          {/* Mask Toggle */}
          {originalImage && (
            <div>
              <h4 className="text-white font-medium mb-3">Mask Tool</h4>
              <button
                onClick={() => setMaskEnabled(!maskEnabled)}
                className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  maskEnabled
                    ? "bg-gold text-gray-900"
                    : "bg-gray-600/50 text-gray-300 hover:bg-gray-600"
                }`}
              >
                <RiBrushLine className="w-5 h-5" />
                {maskEnabled ? "Mask Tool Active" : "Enable Mask Tool"}
              </button>
            </div>
          )}

          {/* Brush Size */}
          {originalImage && (
            <div>
              <h4 className="text-white font-medium mb-3">Brush Size</h4>
              <input
                type="range"
                min="5"
                max="50"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg cursor-pointer slider-thumb"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>5px</span>
                <span className="text-gold font-medium">{brushSize}px</span>
                <span>50px</span>
              </div>
            </div>
          )}

          {/* Opacity */}
          {originalImage && (
            <div>
              <h4 className="text-white font-medium mb-3">Opacity</h4>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={brushOpacity}
                onChange={(e) => setBrushOpacity(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg cursor-pointer slider-thumb"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>10%</span>
                <span className="text-gold font-medium">
                  {Math.round(brushOpacity * 100)}%
                </span>
                <span>100%</span>
              </div>
            </div>
          )}

          {/* Clear Mask */}
          {originalImage && (
            <div>
              <button
                onClick={() => {
                  clearMask();
                  displayMessage("Mask cleared");
                }}
                className="w-full py-3 px-4 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg font-medium transition-all duration-200"
              >
                Clear Mask
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Mobile Comparison Modal Component
  const MobileComparisonModal = () => (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            <MdCompareArrows className="w-5 h-5 text-gold" />
            Compare Images
          </h3>
          <button
            onClick={() => setShowMobileComparison(false)}
            className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-all duration-200"
          >
            <HiX className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Image Selection Tabs */}
        <div className="p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedForEdit("original")}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedForEdit === "original"
                  ? "bg-gold text-gray-900"
                  : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
              }`}
            >
              Original
            </button>
            <button
              onClick={() => setSelectedForEdit("generated")}
              disabled={!generatedImage}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedForEdit === "generated"
                  ? "bg-gold text-gray-900"
                  : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 disabled:bg-gray-800/50 disabled:text-gray-600"
              }`}
            >
              Generated
            </button>
          </div>
        </div>

        {/* Image Display */}
        <div className="flex-1 p-4 space-y-4">
          {/* Original Image */}
          <div
            className={`bg-gray-700/30 rounded-xl p-4 border transition-all duration-200 ${
              selectedForEdit === "original"
                ? "border-gold shadow-lg shadow-gold/20"
                : "border-white/10"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-medium">Original Image</h4>
              {selectedForEdit === "original" && (
                <FiCheck className="w-4 h-4 text-gold" />
              )}
            </div>
            <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
              {originalImage ? (
                <Image
                  src={originalImage.preview}
                  alt="Original"
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <HiOutlinePhotograph className="w-12 h-12" />
                </div>
              )}
            </div>
          </div>

          {/* Generated Image */}
          <div
            className={`bg-gray-700/30 rounded-xl p-4 border transition-all duration-200 ${
              selectedForEdit === "generated"
                ? "border-gold shadow-lg shadow-gold/20"
                : "border-white/10"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-medium">Generated Image</h4>
              {selectedForEdit === "generated" && (
                <FiCheck className="w-4 h-4 text-gold" />
              )}
            </div>
            <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
              {generatedImage ? (
                <Image
                  src={generatedImage}
                  alt="Generated"
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <HiOutlineAdjustments className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">Generated image will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-white/10">
          <div className="space-y-2">
            <button
              onClick={() =>
                downloadImage(
                  selectedForEdit === "generated"
                    ? generatedImage
                    : originalImage?.preview,
                  selectedForEdit === "generated"
                    ? "generated"
                    : originalImage?.name
                )
              }
              disabled={!originalImage}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-700/50 hover:bg-gray-600/50 disabled:bg-gray-800/50 text-white disabled:text-gray-500 font-medium rounded-lg transition-all duration-200"
            >
              <BiDownload className="w-5 h-5" />
              <span>Download Selected</span>
            </button>
            <button
              onClick={handleRegenerate}
              disabled={isLoading || !prompt.trim()}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gold/20 hover:bg-gold/30 disabled:bg-gray-700/30 rounded-lg transition-all duration-200 text-gold hover:text-yellow-300 disabled:text-gray-500 font-medium"
            >
              <BiRefresh
                className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
              />
              <span>Re-generate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isClient) {
    return (
      <div className="h-screen" style={{ backgroundColor: "#181D28" }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: "#181D28" }}>
      {/* Collapsible Left Sidebar */}
      <div
        className={`${sidebarCollapsed ? "w-16 md:w-16" : "w-80 md:w-80"} ${
          !sidebarCollapsed
            ? "fixed md:relative inset-0 z-50 md:z-auto"
            : "hidden md:block"
        } transition-all duration-300 ease-in-out bg-gray-800/50 backdrop-blur-sm border-r border-white/10`}
      >
        <div className="h-full flex flex-col p-4">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-6">
            <div
              className={`${
                sidebarCollapsed ? "hidden" : "block"
              } transition-all duration-300`}
            >
              <h2 className="text-white font-semibold text-lg">Mask Editor</h2>
              <p className="text-gray-400 text-sm">Tools & History</p>
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg bg-gray-700/50 hover:bg-gold/20 transition-all duration-200 border border-white/10 hover:border-gold/50"
            >
              <BiSolidRightArrow
                className={`w-4 h-4 text-gold transition-transform duration-300 ${
                  sidebarCollapsed ? "" : "rotate-180"
                }`}
              />
            </button>
          </div>

          {/* Mobile Overlay */}
          {!sidebarCollapsed && (
            <div
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarCollapsed(true)}
            />
          )}

          {/* Upload Button */}
          <button
            onClick={() => document.getElementById("imageInput").click()}
            className={`${
              sidebarCollapsed ? "w-8 h-8 p-1" : "w-full py-3 px-4"
            } mb-6 bg-gradient-to-r from-gold/20 to-yellow-600/20 hover:from-gold/30 hover:to-yellow-600/30 border-2 border-dashed border-gold/50 hover:border-gold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group`}
          >
            <FiUpload className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
            {!sidebarCollapsed && (
              <span className="text-gold font-medium">Upload Image</span>
            )}
            <input
              id="imageInput"
              type="file"
              onChange={handleOriginalImageChange}
              accept="image/*"
              className="hidden"
            />
          </button>

          {/* Masking Tools */}
          {!sidebarCollapsed && originalImage && (
            <div className="mb-6 p-4 bg-gray-700/30 rounded-xl border border-white/10">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <TbMask className="w-4 h-4 text-gold" />
                Masking Tools
              </h3>

              {/* Mask Toggle */}
              <div className="mb-4">
                <button
                  onClick={() => setMaskEnabled(!maskEnabled)}
                  className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    maskEnabled
                      ? "bg-gold text-gray-900"
                      : "bg-gray-600/50 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  <RiBrushLine className="w-4 h-4" />
                  {maskEnabled ? "Mask Tool Active" : "Enable Mask Tool"}
                </button>
              </div>

              {/* Brush Size Slider */}
              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-2">
                  Brush Size
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg cursor-pointer slider-thumb"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>5px</span>
                  <span className="text-gold font-medium">{brushSize}px</span>
                  <span>50px</span>
                </div>
              </div>

              {/* Opacity Slider */}
              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-2">
                  Opacity
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={brushOpacity}
                  onChange={(e) => setBrushOpacity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg cursor-pointer slider-thumb"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>10%</span>
                  <span className="text-gold font-medium">
                    {Math.round(brushOpacity * 100)}%
                  </span>
                  <span>100%</span>
                </div>
              </div>

              {/* Clear Mask Button */}
              <button
                onClick={clearMask}
                className="w-full py-2 px-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg text-sm font-medium transition-all duration-200"
              >
                Clear Mask
              </button>
            </div>
          )}

          {/* Image Thumbnails */}
          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
            {originalImage && !sidebarCollapsed && (
              <div className="relative group cursor-pointer">
                <div className="w-full h-20 rounded-lg overflow-hidden ring-1 ring-white/20 hover:ring-gold/50 transition-all duration-200">
                  <Image
                    src={originalImage.preview}
                    alt="Original"
                    width={320}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-1 left-1 right-1">
                  <div className="bg-black/70 backdrop-blur-sm rounded px-2 py-1">
                    <p className="text-white text-xs truncate">
                      {originalImage.name}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Generated Image Thumbnail */}
            {generatedImage && !sidebarCollapsed && (
              <div className="border-t border-white/10 pt-3 mt-6">
                <p className="text-gray-400 text-sm mb-3 font-medium">
                  Generated Result
                </p>
                <div className="relative group cursor-pointer">
                  <div className="w-full h-20 rounded-lg overflow-hidden ring-1 ring-green-500/50 hover:ring-green-400 transition-all duration-200">
                    <Image
                      src={generatedImage}
                      alt="Generated"
                      width={320}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute top-2 right-2">
                    <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      NEW
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Widgets */}
          {!sidebarCollapsed && originalImage && (
            <div className="border-t border-white/10 pt-4 mt-4 space-y-2">
              <p className="text-gray-400 text-sm font-medium mb-3">
                Quick Actions
              </p>

              <button
                onClick={() =>
                  downloadImage(
                    generatedImage || originalImage.preview,
                    generatedImage ? "generated" : originalImage.name
                  )
                }
                className="w-full flex items-center gap-3 px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-all duration-200 text-gray-300 hover:text-white"
              >
                <BiDownload className="w-4 h-4" />
                <span className="text-sm">Download</span>
              </button>

              <button
                onClick={handleResize}
                className="w-full flex items-center gap-3 px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-all duration-200 text-gray-300 hover:text-white"
              >
                <RiExpandDiagonalLine className="w-4 h-4" />
                {/* <span className="text-sm">Resize</span> */}
              </button>

              <button
                onClick={handleRegenerate}
                disabled={isLoading || !prompt.trim()}
                className="w-full flex items-center gap-3 px-3 py-2 bg-gold/20 hover:bg-gold/30 disabled:bg-gray-700/30 rounded-lg transition-all duration-200 text-gold hover:text-yellow-300 disabled:text-gray-500"
              >
                <BiRefresh
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
                <span className="text-sm">Re-generate</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile menu button */}
        <div className="md:hidden fixed top-4 left-4 z-30">
          {sidebarCollapsed ? (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="p-2 rounded-lg bg-gray-700/50 hover:bg-gold/20 transition-all duration-200 border border-white/10 hover:border-gold/50 backdrop-blur-sm"
            >
              <HiMenu className="w-5 h-5 text-gold" />
            </button>
          ) : (
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="p-2 rounded-lg bg-gold/20 hover:bg-gold/30 transition-all duration-200 border border-gold/50 hover:border-gold backdrop-blur-sm"
            >
              <HiX className="w-5 h-5 text-gold" />
            </button>
          )}
        </div>

        {/* Title Bar */}
        <div className="p-3 md:p-6 border-b border-white/10 pt-16 md:pt-3">
          <TitleBar />
        </div>

        {/* Mobile Quick Actions - Only visible on mobile */}
        <div className="md:hidden p-3 border-b border-white/10">
          <div className="flex gap-2">
            <button
              onClick={() => setShowMobileTools(true)}
              className="flex-1 py-2 px-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-white text-sm font-medium"
            >
              <TbMask className="w-4 h-4" />
              Tools
            </button>
            <button
              onClick={() => setShowMobileComparison(true)}
              disabled={!originalImage}
              className="flex-1 py-2 px-3 bg-gray-700/50 hover:bg-gray-600/50 disabled:bg-gray-800/50 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-white disabled:text-gray-500 text-sm font-medium"
            >
              <MdCompareArrows className="w-4 h-4" />
              Compare
            </button>
          </div>
        </div>

        {/* Mobile Upload Section - Only visible on mobile when no image */}
        {!originalImage && (
          <div className="md:hidden p-3">
            <div className="text-center">
              <button
                onClick={() => document.getElementById("imageInput").click()}
                className="w-full py-4 px-6 bg-gradient-to-r from-gold/20 to-yellow-600/20 hover:from-gold/30 hover:to-yellow-600/30 border-2 border-dashed border-gold/50 hover:border-gold rounded-xl transition-all duration-200 flex items-center justify-center gap-3 group"
              >
                <FiUpload className="w-6 h-6 text-gold group-hover:scale-110 transition-transform" />
                <span className="text-gold font-medium text-lg">
                  Upload Image to Start
                </span>
              </button>
              <p className="text-gray-400 text-sm mt-2">
                Upload an image and draw a mask to edit specific areas
              </p>
            </div>
          </div>
        )}

        {/* Mobile Mask Status - Only visible on mobile when image exists */}
        {originalImage && (
          <div className="md:hidden p-3 border-b border-white/10">
            <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <TbMask className="w-4 h-4 text-gold" />
                <span className="text-white text-sm font-medium">
                  Mask Tool: {maskEnabled ? "Active" : "Inactive"}
                </span>
              </div>
              <button
                onClick={() => setMaskEnabled(!maskEnabled)}
                className={`px-3 py-1 rounded text-xs font-medium transition-all duration-200 ${
                  maskEnabled
                    ? "bg-gold text-gray-900"
                    : "bg-gray-700/50 text-gray-300"
                }`}
              >
                {maskEnabled ? "ON" : "OFF"}
              </button>
            </div>
          </div>
        )}

        {/* Central Canvas Workspace */}
        <div className="flex-1 p-3 md:p-6">
          <div className="h-full bg-gray-800/50 rounded-xl border border-white/10 relative overflow-hidden">
            {!originalImage ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-white/60 text-center">
                  <HiOutlinePhotograph className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                  <div className="text-xl mb-2">
                    Upload an image to start editing
                  </div>
                  <div className="text-sm">
                    Click the upload button to begin masking and editing
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
                        className="block rounded-lg border border-gray-500 shadow-lg"
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
                      className="absolute top-0 left-0 rounded-lg border border-gray-500"
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                        opacity: showMask ? 1 : 0,
                        cursor: maskEnabled ? brushType.cursor : "default",
                        display: "block",
                        pointerEvents: maskEnabled ? "auto" : "none",
                      }}
                      onMouseDown={maskEnabled ? startDrawing : undefined}
                      onMouseMove={maskEnabled ? draw : undefined}
                      onMouseUp={maskEnabled ? stopDrawing : undefined}
                      onMouseLeave={maskEnabled ? stopDrawing : undefined}
                      onTouchStart={maskEnabled ? startDrawing : undefined}
                      onTouchMove={maskEnabled ? draw : undefined}
                      onTouchEnd={maskEnabled ? stopDrawing : undefined}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </div>
                </div>

                {/* Zoom Controls */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 bg-gray-800/70 backdrop-blur-sm rounded-lg p-2 border border-white/10">
                  <button
                    onClick={() => handleZoom(0.1)}
                    className="p-2 text-white hover:bg-gray-600/50 rounded text-sm transition-all duration-200"
                    title="Zoom In"
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleZoom(-0.1)}
                    className="p-2 text-white hover:bg-gray-600/50 rounded text-sm transition-all duration-200"
                    title="Zoom Out"
                  >
                    −
                  </button>
                  <button
                    onClick={resetView}
                    className="p-2 text-white hover:bg-gray-600/50 rounded text-sm transition-all duration-200"
                    title="Reset View"
                  >
                    ⌂
                  </button>
                </div>

                {/* Zoom Level Display */}
                <div className="absolute bottom-4 right-4 bg-gray-800/70 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm border border-white/10">
                  {Math.round(zoomLevel * 100)}%
                </div>

                {/* Generated Result Overlay */}
                {resultUrl && (
                  <div className="absolute inset-0 bg-gray-900/95 backdrop-blur-sm flex items-center justify-center rounded-xl">
                    <div className="text-center max-w-2xl p-6">
                      <div className="mb-4">
                        <Image
                          src={resultUrl}
                          alt="Generated result"
                          width={600}
                          height={600}
                          className="max-w-full max-h-96 object-contain rounded-lg border border-gray-600 shadow-2xl"
                          unoptimized={true}
                        />
                      </div>
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => setResultUrl("")}
                          className="px-6 py-2 bg-gray-600/50 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-all duration-200"
                        >
                          Back to Edit
                        </button>
                        <button
                          onClick={() =>
                            downloadImage(resultUrl, "generated-mask-edit")
                          }
                          className="px-6 py-2 bg-gradient-to-r from-gold to-yellow-600 hover:from-yellow-600 hover:to-gold text-white rounded-lg text-sm font-medium transition-all duration-200"
                        >
                          Download Result
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bottom Prompt Input */}
        <div className="p-3 md:p-6 border-t border-white/10">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what to generate in the masked area... (e.g., 'Add a sunset sky', 'Replace with a garden', 'Change to winter scene')"
                className="w-full h-20 md:h-24 px-3 md:px-4 py-2 md:py-3 pr-28 md:pr-32 bg-gray-800/50 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200 resize-none backdrop-blur-sm text-sm md:text-base"
                disabled={isLoading}
              />
              <div className="absolute bottom-2 md:bottom-3 right-2 md:right-3">
                <FiEdit3 className="w-3 md:w-4 h-3 md:h-4 text-gray-400" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 md:gap-4 justify-center mt-4 md:mt-6">
              <button
                onClick={handleGenerate}
                disabled={!canSubmit}
                className="flex items-center gap-1 md:gap-2 px-4 md:px-8 py-2 md:py-3 bg-gradient-to-r from-gold to-yellow-600 hover:from-yellow-600 hover:to-gold disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:scale-100 text-sm md:text-base"
              >
                {isLoading ? (
                  <>
                    <div className="w-3 md:w-4 h-3 md:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="hidden sm:inline">Generating...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <HiOutlineAdjustments className="w-4 md:w-5 h-4 md:h-5" />
                    <span className="hidden sm:inline">Generate</span>
                    <span className="sm:hidden">Go</span>
                  </>
                )}
              </button>

              {/* Mobile Upload Button */}
              <button
                onClick={() => document.getElementById("imageInput").click()}
                className="md:hidden flex items-center gap-1 px-3 py-2 bg-gold/20 hover:bg-gold/30 text-gold font-medium rounded-xl transition-all duration-200 border border-gold/50 hover:border-gold text-sm"
              >
                <FiUpload className="w-4 h-4" />
                <span>Upload</span>
              </button>

              <button
                onClick={() =>
                  downloadImage(
                    generatedImage || originalImage?.preview,
                    generatedImage ? "generated" : originalImage?.name
                  )
                }
                disabled={!originalImage}
                className="flex items-center gap-1 md:gap-2 px-3 md:px-6 py-2 md:py-3 bg-gray-700/50 hover:bg-gray-600/50 disabled:bg-gray-800/50 text-white disabled:text-gray-500 font-medium rounded-xl transition-all duration-200 border border-white/10 hover:border-white/20 text-sm md:text-base"
              >
                <BiDownload className="w-4 md:w-5 h-4 md:h-5" />
                <span className="hidden sm:inline">Download</span>
              </button>
            </div>

            {/* Mobile Action Grid - Additional mobile actions */}
            {originalImage && (
              <div className="md:hidden mt-6">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleRegenerate}
                    disabled={isLoading || !prompt.trim()}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gold/20 hover:bg-gold/30 disabled:bg-gray-700/30 rounded-lg transition-all duration-200 text-gold hover:text-yellow-300 disabled:text-gray-500 font-medium text-sm"
                  >
                    <BiRefresh
                      className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                    />
                    <span>Re-generate</span>
                  </button>
                  <button
                    onClick={() => {
                      clearMask();
                      displayMessage("Mask cleared");
                    }}
                    disabled={!hasMask()}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600/20 hover:bg-red-600/30 disabled:bg-gray-700/30 rounded-lg transition-all duration-200 text-red-400 hover:text-red-300 disabled:text-gray-500 font-medium text-sm"
                  >
                    <TbMask className="w-4 h-4" />
                    <span>Clear Mask</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Image Comparison */}
      <div className="hidden lg:block w-96 bg-gray-800/30 backdrop-blur-sm border-l border-white/10 p-6">
        <div className="h-full flex flex-col">
          <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <MdCompareArrows className="w-5 h-5 text-gold" />
            Image Comparison
          </h3>

          {/* Image Selection Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSelectedForEdit("original")}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedForEdit === "original"
                  ? "bg-gold text-gray-900"
                  : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
              }`}
            >
              Original
            </button>
            <button
              onClick={() => setSelectedForEdit("generated")}
              disabled={!generatedImage}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedForEdit === "generated"
                  ? "bg-gold text-gray-900"
                  : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 disabled:bg-gray-800/50 disabled:text-gray-600"
              }`}
            >
              Generated
            </button>
          </div>

          {/* Image Display Cards */}
          <div className="flex-1 space-y-4">
            {/* Original Image Card */}
            <div
              className={`bg-gray-700/30 rounded-xl p-4 border transition-all duration-200 ${
                selectedForEdit === "original"
                  ? "border-gold shadow-lg shadow-gold/20"
                  : "border-white/10"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium">Original Image</h4>
                {selectedForEdit === "original" && (
                  <FiCheck className="w-4 h-4 text-gold" />
                )}
              </div>
              <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                {originalImage ? (
                  <Image
                    src={originalImage.preview}
                    alt="Original"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <HiOutlinePhotograph className="w-12 h-12" />
                  </div>
                )}
              </div>
            </div>

            {/* Generated Image Card */}
            <div
              className={`bg-gray-700/30 rounded-xl p-4 border transition-all duration-200 ${
                selectedForEdit === "generated"
                  ? "border-gold shadow-lg shadow-gold/20"
                  : "border-white/10"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium">Generated Image</h4>
                {selectedForEdit === "generated" && (
                  <FiCheck className="w-4 h-4 text-gold" />
                )}
              </div>
              <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                {generatedImage ? (
                  <Image
                    src={generatedImage}
                    alt="Generated"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <HiOutlineAdjustments className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">
                        Generated image will appear here
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comparison Info */}
          {originalImage && generatedImage && (
            <div className="mt-4 p-3 bg-gray-700/30 rounded-lg border border-white/10">
              <p className="text-gray-300 text-sm">
                <span className="text-gold font-medium">
                  Selected for editing:
                </span>{" "}
                {selectedForEdit === "original"
                  ? "Original Image"
                  : "Generated Image"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Tools Modal */}
      {showMobileTools && <MobileToolsModal />}

      {/* Mobile Comparison Modal */}
      {showMobileComparison && <MobileComparisonModal />}

      {/* Message Notification */}
      {showMessage && (
        <div className="fixed top-6 right-6 bg-gray-800 border border-gold/50 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
          {showMessage}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-red-600/90 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}

      {/* Custom Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(
            180deg,
            #d4af37 0%,
            rgba(212, 175, 55, 0.7) 100%
          );
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #d4af37 0%, #b8941f 100%);
        }
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          background: linear-gradient(45deg, #d4af37, #f4d03f);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(212, 175, 55, 0.4);
        }
        .slider-thumb::-moz-range-thumb {
          height: 16px;
          width: 16px;
          background: linear-gradient(45deg, #d4af37, #f4d03f);
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(212, 175, 55, 0.4);
        }
      `}</style>
    </div>
  );
}
