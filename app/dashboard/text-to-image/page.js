// app/dashboard/text-to-image/page.js
"use client";
import Image from "next/image";
import WorkspaceHeader from "@/components/dashboard/WorkspaceHeader";
import DashboardWorkspaceNav from "@/components/dashboard/DashboardWorkspaceNav";
import WorkspaceSidePanel from "@/components/dashboard/WorkspaceSidePanel";
import { useState, useEffect, useCallback } from "react";
import { apiCall, API_BASE_URL } from "@/utils/apiUtils";
import {
  IconButton,
  Tooltip,
  Card,
  CardMedia,
  CircularProgress,
  Fab,
  Snackbar,
  Alert,
  Box,
  Typography,
  Slide,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Fullscreen as FullscreenIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

export default function TexttoImage() {
  return <TexttoImageContent />;
}

function TexttoImageContent() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);
  const [imageHistory, setImageHistory] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Load image history from localStorage on component mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("imageHistory");
      if (savedHistory) {
        setImageHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Failed to load image history:", error);
      // Clear corrupted data
      localStorage.removeItem("imageHistory");
    }
  }, []);

  const showMessage = useCallback((message) => {
    setSnackbarMessage(message);
    setShowSnackbar(true);
  }, []);

  // Handle localStorage quota exceeded by progressively reducing stored images
  const handleQuotaExceeded = useCallback(() => {
    let currentHistory = imageHistory;
    let maxAttempts = 5;
    let currentLimit = Math.max(1, currentHistory.length - 1);

    while (maxAttempts > 0 && currentLimit > 0) {
      try {
        // Reduce the number of stored images
        const reducedHistory = currentHistory.slice(0, currentLimit);
        localStorage.setItem("imageHistory", JSON.stringify(reducedHistory));

        // Update state if successful
        setImageHistory(reducedHistory);
        showMessage(
          `Storage limit reached. Reduced history to ${currentLimit} images.`
        );
        console.log(`Successfully reduced history to ${currentLimit} images`);
        return;
      } catch (error) {
        console.log(
          `Still over quota with ${currentLimit} images, trying ${
            currentLimit - 1
          }...`
        );
        currentLimit--;
        maxAttempts--;
      }
    }

    // If we still can't save, clear all history
    console.log("Clearing all image history due to persistent quota issues");
    localStorage.removeItem("imageHistory");
    setImageHistory([]);
    showMessage("Storage limit exceeded. Cleared image history.");
  }, [imageHistory, showMessage]);

  // Save image history to localStorage whenever it changes with quota handling
  useEffect(() => {
    if (imageHistory.length === 0) return;

    try {
      const historyData = JSON.stringify(imageHistory);
      localStorage.setItem("imageHistory", historyData);
    } catch (error) {
      console.error("Failed to save image history:", error);

      if (error.name === "QuotaExceededError") {
        // Handle quota exceeded by reducing the number of stored images
        console.log("LocalStorage quota exceeded, reducing stored images...");
        handleQuotaExceeded();
      }
    }
  }, [imageHistory, handleQuotaExceeded]);

  // Check if adding new image would exceed reasonable size limit
  const estimateStorageSize = (imageData) => {
    // Rough estimate: base64 images are about 4/3 the size of original + metadata
    const estimatedSize = imageData.length * 1.33 + 200; // 200 bytes for metadata
    return estimatedSize;
  };

  // Get current localStorage usage
  const getStorageInfo = () => {
    try {
      const historyData = localStorage.getItem("imageHistory");
      if (!historyData) return { used: 0, usedMB: 0 };

      const used = new Blob([historyData]).size;
      const usedMB = used / (1024 * 1024);
      return { used, usedMB };
    } catch (error) {
      return { used: 0, usedMB: 0 };
    }
  };

  const saveToHistory = (imageData, promptText) => {
    const newImage = {
      id: Date.now(),
      image: imageData,
      prompt: promptText,
      timestamp: new Date().toLocaleString(),
    };

    // Estimate the size of the new image
    const imageSize = estimateStorageSize(imageData);
    const sizeInMB = imageSize / (1024 * 1024);

    console.log(`New image estimated size: ${sizeInMB.toFixed(2)}MB`);

    // If single image is too large (over 8MB), don't store it
    if (sizeInMB > 8) {
      showMessage("Image too large to store in history");
      return;
    }

    // Dynamically adjust history limit based on image size
    let maxImages = 10;
    if (sizeInMB > 2) {
      maxImages = 3; // Large images: store only 3
    } else if (sizeInMB > 1) {
      maxImages = 5; // Medium images: store only 5
    } else {
      maxImages = 10; // Small images: store up to 10
    }

    // Add new image and limit history
    setImageHistory((prev) => [newImage, ...prev.slice(0, maxImages - 1)]);
  };

  const deleteFromHistory = (id) => {
    setImageHistory((prev) => prev.filter((img) => img.id !== id));
  };

  const clearAllHistory = () => {
    setImageHistory([]);
    localStorage.removeItem("imageHistory");
    showMessage("Image history cleared");
  };

  const loadFromHistory = (imageData) => {
    setGeneratedImage(imageData.image);
    setPrompt(imageData.prompt);
    setIsFullscreen(false); // Ensure we're not in fullscreen when loading from history
  };

  const downloadImage = () => {
    if (generatedImage) {
      try {
        const link = document.createElement("a");
        link.href = generatedImage;
        link.download = `generated-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showMessage("Image downloaded successfully!");
      } catch (error) {
        showMessage("Failed to download image");
      }
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    try {
      const res = await apiCall("/im-gen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Backend response:", data);
        console.log("Response keys:", Object.keys(data));
        console.log("Response structure:", JSON.stringify(data, null, 2));

        let imageData = null;

        // Handle different response formats
        if (data.image_url) {
          // If GCS upload was successful
          console.log("Using image_url:", data.image_url);
          imageData = data.image_url;
        } else if (data.image) {
          // If we have a direct image (could be base64 or URL)
          console.log("Found data.image, length:", data.image.length);
          if (data.image.startsWith("data:image/")) {
            // Already a data URL
            console.log("Using data URL as-is");
            imageData = data.image;
          } else if (data.image.length > 1000) {
            // Likely base64 string, convert to data URL
            console.log("Converting base64 to data URL");
            imageData = `data:image/png;base64,${data.image}`;
          } else {
            // Regular URL
            console.log("Using as regular URL");
            imageData = data.image;
          }
        } else if (data.base64_image) {
          // If backend returns base64_image field
          console.log("Using base64_image field");
          imageData = `data:image/png;base64,${data.base64_image}`;
        } else if (data.generated_images && data.generated_images.length > 0) {
          // If backend returns array of images
          console.log("Using first image from generated_images array");
          const firstImage = data.generated_images[0];
          if (firstImage.startsWith("data:image/")) {
            imageData = firstImage;
          } else {
            imageData = `data:image/png;base64,${firstImage}`;
          }
        } else {
          console.log("No image data found in response");
          setError("No image data received from server");
        }

        if (imageData) {
          setGeneratedImage(imageData);
          saveToHistory(imageData, prompt);
          showMessage("Image generated successfully!");
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(
          `Failed to generate image: ${errorData.detail || res.statusText}`
        );
        console.error("Failed to generate image:", res.status, errorData);
      }
    } catch (error) {
      setError(`Network error: ${error.message}`);
      console.error("Error generating image:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  return (
    <div className="space-y-6">
      <DashboardWorkspaceNav hideOverview />
      <WorkspaceHeader
        title="Text to Image Studio"
        description="Generate hero shots, mood boards, and concept art with governed prompts, negative controls, and instant history playback."
        badges={["GPU ready", "History synced"]}
      />
      <div className="flex min-h-[calc(100vh-8rem)] gap-4 rounded-3xl border border-white/10 bg-[#181D28] p-3 shadow-[0_30px_90px_rgba(6,8,20,0.45)] md:p-6">
        <WorkspaceSidePanel
          title="Gallery"
          subtitle="Generated Images"
          collapsedLabel="History"
          icon={HistoryIcon}
        >
          {({ isOpen }) => (
            <Slide
              direction="right"
              in={isOpen}
              mountOnEnter
              unmountOnExit
            >
              <div className="flex-1 overflow-hidden">
                <div className="mb-6 flex items-center gap-3 rounded-lg border border-white/10 bg-gradient-to-r from-gray-800/50 to-gray-700/30 p-3">
                  <div className="rounded-lg bg-gradient-to-r from-gold/20 to-gold/10 p-2">
                    <HistoryIcon
                      sx={{
                        color: "#D4AF37",
                        fontSize: "20px",
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <Typography
                      variant="h6"
                      sx={{
                        color: "white",
                        fontWeight: 600,
                        fontSize: "16px",
                        marginBottom: "2px",
                      }}
                    >
                      Recent Images
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(255, 255, 255, 0.6)",
                        fontSize: "12px",
                      }}
                    >
                      {imageHistory.length} images • {getStorageInfo().usedMB.toFixed(1)}MB used
                    </Typography>
                  </div>
                  {imageHistory.length > 0 && (
                    <Tooltip title="Clear All Images" placement="left">
                      <IconButton
                        size="small"
                        onClick={clearAllHistory}
                        sx={{
                          bgcolor: "rgba(255, 0, 0, 0.1)",
                          border: "1px solid rgba(255, 0, 0, 0.3)",
                          color: "rgba(255, 0, 0, 0.8)",
                          width: "28px",
                          height: "28px",
                          "&:hover": {
                            bgcolor: "rgba(255, 0, 0, 0.2)",
                            borderColor: "rgba(255, 0, 0, 0.5)",
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </div>

                <div className="custom-scrollbar max-h-96 space-y-3 overflow-y-auto">
                  {imageHistory.map((item) => (
                    <Card
                      key={item.id}
                      className="group relative overflow-hidden border border-white/10 bg-white/[0.02] transition-all duration-300 hover:border-gold/40 hover:bg-white/[0.04]"
                      sx={{
                        borderRadius: "16px",
                        backdropFilter: "blur(6px)",
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={item.image}
                        alt={item.prompt}
                        sx={{
                          height: 160,
                          objectFit: "cover",
                          transition: "transform 0.3s ease",
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <div className="absolute bottom-0 w-full p-3">
                          <Typography
                            variant="body2"
                            sx={{
                              color: "white",
                              fontWeight: 600,
                              marginBottom: "4px",
                            }}
                          >
                            {item.prompt.length > 50
                              ? `${item.prompt.slice(0, 47)}...`
                              : item.prompt}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "rgba(255, 255, 255, 0.7)",
                              fontSize: "11px",
                            }}
                          >
                            {item.timestamp}
                          </Typography>
                          <div className="mt-2 flex gap-2">
                            <Tooltip title="Load Image">
                              <IconButton
                                size="small"
                                onClick={() => loadFromHistory(item)}
                                sx={{
                                  bgcolor: "rgba(255, 255, 255, 0.1)",
                                  border: "1px solid rgba(255, 255, 255, 0.2)",
                                  color: "white",
                                  "&:hover": {
                                    bgcolor: "rgba(212, 175, 55, 0.2)",
                                    borderColor: "rgba(212, 175, 55, 0.5)",
                                  },
                                }}
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Item">
                              <IconButton
                                size="small"
                                onClick={() => deleteFromHistory(item.id)}
                                sx={{
                                  bgcolor: "rgba(255, 0, 0, 0.1)",
                                  border: "1px solid rgba(255, 0, 0, 0.3)",
                                  color: "rgba(255, 0, 0, 0.8)",
                                  "&:hover": {
                                    bgcolor: "rgba(255, 0, 0, 0.2)",
                                    borderColor: "rgba(255, 0, 0, 0.5)",
                                  },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {imageHistory.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-10 text-center">
                      <Typography
                        variant="h6"
                        sx={{
                          color: "white",
                          fontWeight: 600,
                          marginBottom: "8px",
                          fontSize: "16px",
                        }}
                      >
                        No images yet
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "rgba(255, 255, 255, 0.4)",
                          fontSize: "13px",
                        }}
                      >
                        Generated images will appear here
                      </Typography>
                    </div>
                  )}
                </div>
              </div>
            </Slide>
          )}
        </WorkspaceSidePanel>

        {/* Main Content */}
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Central Workspace */}
          <div className="flex-1 p-3 md:p-6">
            <div className="h-full bg-gray-800/50 rounded-xl border border-white/10 relative overflow-hidden">
              {error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-red-400 text-center p-4">
                    <div className="text-lg mb-2">Error</div>
                    <div className="text-sm">{error}</div>
                  </div>
                </div>
              ) : generatedImage ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="relative max-w-full max-h-full">
                    <Image
                      src={generatedImage}
                      alt="Generated image"
                      width={600}
                      height={600}
                      className={`max-w-full max-h-full object-contain rounded-lg transition-all duration-300 ${
                        isFullscreen
                          ? "fixed inset-0 z-40 w-screen h-screen bg-black cursor-pointer"
                          : ""
                      }`}
                      style={{
                        maxWidth: isFullscreen ? "100vw" : "90%",
                        maxHeight: isFullscreen ? "100vh" : "90%",
                      }}
                      onClick={isFullscreen ? closeFullscreen : undefined}
                    />

                    {/* Floating Action Buttons */}
                    <div className="absolute top-2 md:top-4 right-2 md:right-4 flex flex-col gap-1 md:gap-2">
                      {!isFullscreen && (
                        <>
                          <Tooltip title="Download Image" placement="left">
                            <Fab
                              size="small"
                              onClick={downloadImage}
                              sx={{
                                bgcolor: "#D4AF3700",
                                border: "1px solid #D4AF37",
                                color: "#D4AF37",
                                width: "40px",
                                height: "40px",
                                "&:hover": {
                                  bgcolor: "#D4AF3720",
                                  borderColor: "#D4AF37",
                                },
                                backdropFilter: "blur(4px)",
                              }}
                            >
                              <DownloadIcon sx={{ fontSize: "24px" }} />
                            </Fab>
                          </Tooltip>

                          <Tooltip title="View Fullscreen" placement="left">
                            <Fab
                              size="small"
                              onClick={toggleFullscreen}
                              sx={{
                                bgcolor: "#D4AF3700",
                                border: "1px solid #D4AF37",
                                color: "#D4AF37",
                                width: "40px",
                                height: "40px",
                                "&:hover": {
                                  bgcolor: "#D4AF3720",
                                  borderColor: "#D4AF37",
                                },
                                backdropFilter: "blur(4px)",
                              }}
                            >
                              <FullscreenIcon sx={{ fontSize: "24px" }} />
                            </Fab>
                          </Tooltip>
                        </>
                      )}

                      {isFullscreen && (
                        <Tooltip title="Close Fullscreen" placement="left">
                          <Fab
                            size="small"
                            onClick={closeFullscreen}
                            sx={{
                              bgcolor: "#D4AF3700",
                              border: "1px solid #D4AF37",
                              color: "#D4AF37",
                              "&:hover": {
                                bgcolor: "#D4AF3720",
                                borderColor: "#D4AF37",
                              },
                              backdropFilter: "blur(4px)",
                              position: "fixed",
                              top: "20px",
                              right: "20px",
                              zIndex: 9999,
                            }}
                          >
                            <CloseIcon />
                          </Fab>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-white/60 text-center px-4">
                    <div className="text-xl mb-2">
                      Generated image will appear here
                    </div>
                    <div className="text-sm">
                      Enter a prompt and click Generate
                    </div>
                  </div>
                </div>
              )}

              {/* Loading Overlay */}
              {isGenerating && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center text-white px-4">
                    <CircularProgress
                      size={60}
                      thickness={4}
                      sx={{
                        color: "#FFD700",
                        marginBottom: 2,
                      }}
                    />
                    <Typography
                      variant="h6"
                      className="mb-2"
                      sx={{ fontSize: "20px" }}
                    >
                      Generating Image...
                    </Typography>
                    <Typography
                      variant="body2"
                      className="text-white/80"
                      sx={{ fontSize: "14px" }}
                    >
                      This may take a few moments
                    </Typography>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Prompt Input */}
          <div className="p-3 md:p-6 border-t border-white/10">
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <input
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    setError(null);
                  }}
                  onKeyPress={(e) =>
                    e.key === "Enter" && !isGenerating && handleGenerate()
                  }
                  placeholder="Describe the image you want to generate..."
                  className="w-full px-4 md:px-6 py-3 md:py-4 pr-24 md:pr-32 bg-gray-800/50 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200 backdrop-blur-sm text-sm md:text-base"
                  disabled={isGenerating}
                />
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-gold to-yellow-600 hover:from-yellow-600 hover:to-gold disabled:from-gray-600 disabled:to-gray-700 text-white font-medium px-4 md:px-8 py-1.5 md:py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 md:gap-2 text-xs md:text-sm"
                >
                  {isGenerating && (
                    <CircularProgress size={12} sx={{ color: "white" }} />
                  )}
                  <span className="hidden sm:inline">
                    {isGenerating ? "Generating..." : "Generate"}
                  </span>
                  <span className="sm:hidden">
                    {isGenerating ? "..." : "Go"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <Snackbar
          open={showSnackbar}
          autoHideDuration={3000}
          onClose={() => setShowSnackbar(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setShowSnackbar(false)}
            severity="success"
            sx={{
              bgcolor: "rgba(0,0,0,0.8)",
              color: "white",
              "& .MuiAlert-icon": { color: "#FFD700" },
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 3px;
            margin: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(
              180deg,
              #d4af37 0%,
              rgba(212, 175, 55, 0.7) 100%
            );
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #d4af37 0%, #b8941f 100%);
          }
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          /* Enhanced animations */
          @keyframes slideInRight {
            from {
              transform: translateX(20px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          .custom-scrollbar > * {
            animation: slideInRight 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    </div>
  );
}
