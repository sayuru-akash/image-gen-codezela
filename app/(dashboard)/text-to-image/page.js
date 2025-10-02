// app/(dashboard)/text-to-image/page.js
"use client";
import Image from "next/image";
import TitleBar from "../titlebar";
import { BiSolidRightArrow } from "react-icons/bi";
import { HiMenu } from "react-icons/hi";
import { useState, useEffect } from "react";
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
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);
  const [imageHistory, setImageHistory] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // Load image history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("imageHistory");
    if (savedHistory) {
      setImageHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save image history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("imageHistory", JSON.stringify(imageHistory));
  }, [imageHistory]);

  const saveToHistory = (imageData, promptText) => {
    const newImage = {
      id: Date.now(),
      image: imageData,
      prompt: promptText,
      timestamp: new Date().toLocaleString(),
    };
    setImageHistory((prev) => [newImage, ...prev.slice(0, 9)]); // Keep only 10 recent images
  };

  const deleteFromHistory = (id) => {
    setImageHistory((prev) => prev.filter((img) => img.id !== id));
  };

  const loadFromHistory = (imageData) => {
    setGeneratedImage(imageData.image);
    setPrompt(imageData.prompt);
    setIsFullscreen(false); // Ensure we're not in fullscreen when loading from history
  };

  const showMessage = (message) => {
    setSnackbarMessage(message);
    setShowSnackbar(true);
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
    <div className="flex h-screen" style={{ backgroundColor: "#181D28" }}>
      {/* Collapsible Left Sidebar */}
      <div
        className={`${
          sidebarExpanded ? "w-80" : "w-16"
        } transition-all duration-300 ease-in-out bg-gray-800/50 backdrop-blur-sm border-r border-white/10`}
      >
        <div className="h-full flex flex-col p-4">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-6">
            <div
              className={`${
                sidebarExpanded ? "block" : "hidden"
              } transition-all duration-300`}
            >
              <h2 className="text-white font-semibold text-lg">Gallery</h2>
              <p className="text-gray-400 text-sm">Generated Images</p>
            </div>
            <button
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="p-2 rounded-lg bg-gray-700/50 hover:bg-gold/20 transition-all duration-200 border border-white/10 hover:border-gold/50"
            >
              <BiSolidRightArrow
                className={`w-4 h-4 text-gold transition-transform duration-300 ${
                  sidebarExpanded ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Collapsed Sidebar Indicator */}
          {!sidebarExpanded && (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="relative">
                {/* History Icon with pulse animation */}
                <div className="mb-4 p-3 bg-gradient-to-r from-gold/20 to-gold/10 rounded-lg border border-gold/30 animate-pulse">
                  <HistoryIcon
                    sx={{
                      color: "#D4AF37",
                      fontSize: "24px",
                    }}
                  />
                </div>

                {/* Floating dots indicator */}
                <div className="flex flex-col space-y-1 items-center">
                  <div
                    className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>

                {/* Text hint */}
                <div className="mt-4 transform -rotate-90 origin-center">
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(212, 175, 55, 0.8)",
                      fontSize: "10px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    History
                  </Typography>
                </div>
              </div>
            </div>
          )}

          {/* Generated Images History */}
          {sidebarExpanded && (
            <Slide
              direction="right"
              in={sidebarExpanded}
              mountOnEnter
              unmountOnExit
            >
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-3 mb-6 p-3 bg-gradient-to-r from-gray-800/50 to-gray-700/30 rounded-lg border border-white/10">
                  <div className="p-2 bg-gradient-to-r from-gold/20 to-gold/10 rounded-lg">
                    <HistoryIcon
                      sx={{
                        color: "#D4AF37",
                        fontSize: "20px",
                      }}
                    />
                  </div>
                  <div>
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
                      {imageHistory.length} of 10 images
                    </Typography>
                  </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                  {imageHistory.map((item) => (
                    <Card
                      key={item.id}
                      className="cursor-pointer transition-all duration-200 overflow-hidden"
                      onClick={() => loadFromHistory(item)}
                      sx={{
                        bgcolor: "rgba(30, 41, 59, 0.8)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "12px",
                        "&:hover": {
                          borderColor: "#D4AF37",
                          boxShadow: "0 4px 20px rgba(212, 175, 55, 0.3)",
                          transform: "translateY(-2px)",
                          bgcolor: "rgba(30, 41, 59, 0.9)",
                        },
                      }}
                    >
                      <div className="relative group">
                        <CardMedia
                          component="img"
                          height="100"
                          image={item.image}
                          alt={item.prompt}
                          sx={{
                            height: "100px",
                            objectFit: "cover",
                            borderRadius: "12px 12px 0 0",
                          }}
                        />

                        {/* Overlay with gradient for better text visibility */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200" />

                        {/* Delete button */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteFromHistory(item.id);
                            }}
                            sx={{
                              bgcolor: "rgba(0, 0, 0, 0.7)",
                              border: "1px solid #D4AF37",
                              color: "#D4AF37",
                              width: "28px",
                              height: "28px",
                              "&:hover": {
                                bgcolor: "rgba(212, 175, 55, 0.2)",
                                borderColor: "#D4AF37",
                                transform: "scale(1.1)",
                              },
                              backdropFilter: "blur(4px)",
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </div>

                        {/* Play/View indicator */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="bg-black bg-opacity-50 rounded-full p-2 backdrop-blur-sm">
                            <FullscreenIcon
                              sx={{
                                color: "#D4AF37",
                                fontSize: "20px",
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <Box
                        className="p-3"
                        sx={{ bgcolor: "rgba(30, 41, 59, 0.9)" }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: "rgba(255, 255, 255, 0.9)",
                            fontWeight: 500,
                            marginBottom: "4px",
                            lineHeight: 1.3,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            fontSize: "14px",
                          }}
                          title={item.prompt}
                        >
                          {item.prompt.length > 40
                            ? `${item.prompt.substring(0, 40)}...`
                            : item.prompt}
                        </Typography>

                        <div className="flex items-center justify-between">
                          <Typography
                            variant="caption"
                            sx={{
                              color: "rgba(212, 175, 55, 0.8)",
                              fontSize: "11px",
                              fontWeight: 500,
                            }}
                          >
                            {new Date(item.timestamp).toLocaleDateString()}
                          </Typography>

                          <Typography
                            variant="caption"
                            sx={{
                              color: "rgba(255, 255, 255, 0.6)",
                              fontSize: "11px",
                            }}
                          >
                            {new Date(item.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Typography>
                        </div>
                      </Box>
                    </Card>
                  ))}

                  {imageHistory.length === 0 && (
                    <div className="text-center py-12">
                      <div className="mb-4">
                        <HistoryIcon
                          sx={{
                            fontSize: "48px",
                            color: "rgba(212, 175, 55, 0.3)",
                          }}
                        />
                      </div>
                      <Typography
                        variant="body1"
                        sx={{
                          color: "rgba(255, 255, 255, 0.6)",
                          fontWeight: 500,
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
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile menu button */}
        <div className="md:hidden fixed top-4 left-4 z-40">
          <IconButton
            onClick={() => setSidebarExpanded(true)}
            sx={{
              bgcolor: "rgba(30, 41, 59, 0.9)",
              border: "1px solid #D4AF37",
              color: "#D4AF37",
              "&:hover": {
                bgcolor: "rgba(212, 175, 55, 0.2)",
              },
              backdropFilter: "blur(4px)",
            }}
          >
            <HiMenu size={20} />
          </IconButton>
        </div>

        {/* Title Bar */}
        <div className="p-6 border-b border-white/10">
          <TitleBar />
        </div>

        {/* Central Workspace */}
        <div className="flex-1 p-6">
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
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
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
        <div className="p-6 border-t border-white/10">
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
                className="w-full px-6 py-4 pr-32 bg-gray-800/50 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200 backdrop-blur-sm text-base"
                disabled={isGenerating}
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-gold to-yellow-600 hover:from-yellow-600 hover:to-gold disabled:from-gray-600 disabled:to-gray-700 text-white font-medium px-8 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isGenerating && (
                  <CircularProgress size={16} sx={{ color: "white" }} />
                )}
                <span>{isGenerating ? "Generating..." : "Generate"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Snackbar for notifications */}
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

      {/* Custom CSS for scrollbar */}
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

        .custom-scrollbar > *:nth-child(1) {
          animation-delay: 0.1s;
        }
        .custom-scrollbar > *:nth-child(2) {
          animation-delay: 0.2s;
        }
        .custom-scrollbar > *:nth-child(3) {
          animation-delay: 0.3s;
        }
        .custom-scrollbar > *:nth-child(4) {
          animation-delay: 0.4s;
        }
        .custom-scrollbar > *:nth-child(5) {
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
}
