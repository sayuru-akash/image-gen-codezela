"use client";
import Image from "next/image";
import { BiSolidRightArrow, BiDownload, BiRefresh } from "react-icons/bi";
import { HiMenu, HiOutlinePhotograph } from "react-icons/hi";
import { FiUpload, FiCheck, FiEdit3 } from "react-icons/fi";
import { RiExpandDiagonalLine } from "react-icons/ri";
import TitleBar from "../titlebar";
import { useRef, useState, useEffect } from "react";
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
  Chip,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Fullscreen as FullscreenIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  CompareArrows as CompareArrowsIcon,
  Close as CloseIcon,
  GridView as GridViewIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  Image as ImageIcon,
} from "@mui/icons-material";

export default function DualImageEditor() {
  const [prompt, setPrompt] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [imageHistory, setImageHistory] = useState([]);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const fileInputRef = useRef(null);

  // Load image history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("dualEditorHistory");
    if (savedHistory) {
      setImageHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save image history to localStorage whenever it changes
  useEffect(() => {
    try {
      // Only store essential data, not image URLs to avoid quota issues
      const compactHistory = imageHistory.map((item) => ({
        id: item.id,
        prompt: item.prompt,
        timestamp: item.timestamp,
        uploadedCount: item.uploadedImages?.length || 0,
        generatedCount: item.generatedImages?.length || 0,
      }));
      localStorage.setItem("dualEditorHistory", JSON.stringify(compactHistory));
    } catch (error) {
      console.warn("Failed to save history to localStorage:", error);
      // Clear old data if quota exceeded
      if (error.name === "QuotaExceededError") {
        try {
          localStorage.removeItem("dualEditorHistory");
          console.log("Cleared localStorage due to quota exceeded");
        } catch (clearError) {
          console.warn("Failed to clear localStorage:", clearError);
        }
      }
    }
  }, [imageHistory]);

  // Handle mobile view initialization and responsive behavior
  useEffect(() => {
    const checkMobileView = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setSidebarExpanded(false);
      }
    };

    // Check on mount
    checkMobileView();

    // Add resize listener
    window.addEventListener("resize", checkMobileView);
    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

  const saveToHistory = (uploadedImgs, generatedImgs, promptText) => {
    const newItem = {
      id: Date.now(),
      // Store minimal metadata instead of actual image data
      uploadedImages: uploadedImgs.map((img) => ({
        id: img.id,
        name: img.name,
        size: img.size,
        type: img.type,
      })),
      generatedImages: [], // Don't store generated image URLs to save space
      uploadedCount: uploadedImgs.length,
      generatedCount: generatedImgs.length,
      prompt: promptText,
      timestamp: new Date().toLocaleString(),
    };
    setImageHistory((prev) => [newItem, ...prev.slice(0, 4)]); // Reduced to 5 items to save space
  };

  const deleteFromHistory = (id) => {
    setImageHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const loadFromHistory = (historyItem) => {
    // Since we don't store image URLs anymore, we can only restore the prompt
    // and clear current images to let user re-upload
    setUploadedImages([]);
    setGeneratedImages([]);
    setPrompt(historyItem.prompt);
    setSelectedImageIndex(0);
    setIsFullscreen(false);
    showMessage(
      `Restored prompt: "${historyItem.prompt}". Please re-upload your images.`
    );
  };

  const showMessage = (message) => {
    setSnackbarMessage(message);
    setShowSnackbar(true);
  };

  const toggleFullscreen = (image) => {
    setFullscreenImage(image);
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    setFullscreenImage(null);
  };

  const downloadImage = (imageUrl, filename = "dual-editor-image") => {
    try {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `${filename}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showMessage("Image downloaded successfully!");
    } catch (error) {
      showMessage("Failed to download image");
    }
  };

  const handleAddImage = () => {
    if (uploadedImages.length >= 2) {
      showMessage(
        "Maximum 2 images allowed. Please replace an existing image."
      );
      return;
    }
    fileInputRef.current?.click();
  };

  const handleReplaceImage = (index) => {
    setSelectedImageIndex(index);
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const file = files[0]; // Only take the first file

    // Validate file
    if (!file.type.startsWith("image/")) {
      showMessage("Please select a valid image file");
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      showMessage("Image too large. Maximum size is 10MB");
      return;
    }

    if (file.size === 0) {
      showMessage("Empty file selected");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const newImage = {
        id: Date.now() + Math.random(),
        name: file.name,
        url: e.target.result,
        file: file,
        size: file.size,
        type: file.type,
      };

      setUploadedImages((prev) => {
        const newImages = [...prev];
        if (newImages.length >= 2) {
          // Replace the selected image
          newImages[selectedImageIndex] = newImage;
        } else {
          // Add new image
          newImages.push(newImage);
        }
        return newImages;
      });

      showMessage(
        `Image ${
          uploadedImages.length >= 2 ? "replaced" : "added"
        } successfully`
      );
    };

    reader.onerror = () => {
      showMessage("Failed to read image file");
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const removeImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    if (selectedImageIndex >= uploadedImages.length - 1) {
      setSelectedImageIndex(Math.max(0, uploadedImages.length - 2));
    }
    showMessage("Image removed successfully");
  };

  const handleGenerate = async () => {
    if (uploadedImages.length === 0 || !prompt.trim()) {
      showMessage("Please upload at least one image and enter a prompt");
      return;
    }

    setIsGenerating(true);
    try {
      const formData = new FormData();

      // Add images with validation
      uploadedImages.forEach((image, index) => {
        if (image.file && image.file instanceof File) {
          formData.append("images", image.file, image.file.name);
          console.log(`Added image ${index}:`, {
            name: image.file.name,
            size: image.file.size,
            type: image.file.type,
          });
        }
      });

      formData.append("prompt", prompt.trim());
      formData.append("batch_size", uploadedImages.length.toString());

      const res = await apiCall("/create-from-references", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Backend response:", data);

        let imagesToSet = [];

        if (data.images) {
          imagesToSet = data.images.map((img) => {
            if (img.startsWith("data:image/")) {
              return img;
            } else if (img.length > 1000) {
              return `data:image/png;base64,${img}`;
            } else {
              return img;
            }
          });
        } else if (data.image_url) {
          imagesToSet = [data.image_url];
        } else if (data.image) {
          if (data.image.startsWith("data:image/")) {
            imagesToSet = [data.image];
          } else if (data.image.length > 1000) {
            imagesToSet = [`data:image/png;base64,${data.image}`];
          } else {
            imagesToSet = [data.image];
          }
        } else if (data.base64_image) {
          imagesToSet = [`data:image/png;base64,${data.base64_image}`];
        } else if (data.generated_images && data.generated_images.length > 0) {
          imagesToSet = data.generated_images.map((img) => {
            if (img.startsWith("data:image/")) {
              return img;
            } else {
              return `data:image/png;base64,${img}`;
            }
          });
        }

        if (imagesToSet.length > 0) {
          setGeneratedImages(imagesToSet);
          saveToHistory(uploadedImages, imagesToSet, prompt);
          showMessage(
            `Successfully generated ${imagesToSet.length} image${
              imagesToSet.length > 1 ? "s" : ""
            }!`
          );
        } else {
          showMessage("No images were generated. Please try again.");
        }
      } else {
        let errorMessage = `Request failed with status ${res.status}`;

        try {
          const errorData = await res.json();
          console.error("Error response:", errorData);

          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }

          if (res.status === 422) {
            errorMessage =
              "Invalid request data. Please check your images and prompt.";
          }
        } catch (parseError) {
          console.error("Could not parse error response:", parseError);
        }

        showMessage(errorMessage);
      }
    } catch (error) {
      console.error("Error generating images:", error);
      showMessage("Failed to generate images. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  return (
    <div className="flex h-screen" style={{ backgroundColor: "#181D28" }}>
      {/* Collapsible Left Sidebar */}
      <div
        className={`${sidebarExpanded ? "w-80 md:w-80" : "w-16 md:w-16"} ${
          sidebarExpanded
            ? "fixed md:relative inset-0 z-50 md:z-auto"
            : "hidden md:block"
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
              <h2 className="text-white font-semibold text-lg">Dual Editor</h2>
              <p className="text-gray-400 text-sm">Two Image Workflow</p>
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

          {/* Mobile Overlay */}
          {sidebarExpanded && (
            <div
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarExpanded(false)}
            />
          )}

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

          {/* Expanded Sidebar Content */}
          {sidebarExpanded && (
            <Slide
              direction="right"
              in={sidebarExpanded}
              mountOnEnter
              unmountOnExit
            >
              <div className="flex-1 overflow-hidden">
                {/* Quick Actions */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4 p-3 bg-gradient-to-r from-gray-800/50 to-gray-700/30 rounded-lg border border-white/10">
                    <div className="p-2 bg-gradient-to-r from-gold/20 to-gold/10 rounded-lg">
                      <CompareArrowsIcon
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
                        Quick Actions
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgba(255, 255, 255, 0.6)",
                          fontSize: "12px",
                        }}
                      >
                        Manage your images
                      </Typography>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={handleAddImage}
                      disabled={uploadedImages.length >= 2}
                      className="w-full p-3 bg-gradient-to-r from-gold/20 to-gold/10 hover:from-gold/30 hover:to-gold/20 disabled:from-gray-600/20 disabled:to-gray-600/10 border border-gold/30 disabled:border-gray-600/30 rounded-lg transition-all duration-200 group disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3">
                        <CloudUploadIcon
                          sx={{
                            color:
                              uploadedImages.length >= 2
                                ? "rgba(255,255,255,0.4)"
                                : "#D4AF37",
                            fontSize: "20px",
                          }}
                        />
                        <div className="text-left">
                          <Typography
                            variant="body2"
                            sx={{
                              color:
                                uploadedImages.length >= 2
                                  ? "rgba(255,255,255,0.4)"
                                  : "white",
                              fontWeight: 500,
                              fontSize: "14px",
                            }}
                          >
                            {uploadedImages.length >= 2
                              ? "Max Images Reached"
                              : "Upload Image"}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color:
                                uploadedImages.length >= 2
                                  ? "rgba(255,255,255,0.3)"
                                  : "rgba(255, 255, 255, 0.6)",
                              fontSize: "11px",
                            }}
                          >
                            {uploadedImages.length}/2 images
                          </Typography>
                        </div>
                      </div>
                    </button>

                    {generatedImages.length > 0 && (
                      <button
                        onClick={() => {
                          generatedImages.forEach((img, index) => {
                            downloadImage(img, `generated-${index + 1}`);
                          });
                        }}
                        className="w-full p-3 bg-gradient-to-r from-green-600/20 to-green-600/10 hover:from-green-600/30 hover:to-green-600/20 border border-green-600/30 rounded-lg transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-3">
                          <DownloadIcon
                            sx={{
                              color: "#22C55E",
                              fontSize: "20px",
                            }}
                          />
                          <div className="text-left">
                            <Typography
                              variant="body2"
                              sx={{
                                color: "white",
                                fontWeight: 500,
                                fontSize: "14px",
                              }}
                            >
                              Download All
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "rgba(255, 255, 255, 0.6)",
                                fontSize: "11px",
                              }}
                            >
                              {generatedImages.length} generated images
                            </Typography>
                          </div>
                        </div>
                      </button>
                    )}

                    {uploadedImages.length > 0 && (
                      <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt.trim()}
                        className="w-full p-3 bg-gradient-to-r from-blue-600/20 to-blue-600/10 hover:from-blue-600/30 hover:to-blue-600/20 disabled:from-gray-600/20 disabled:to-gray-600/10 border border-blue-600/30 disabled:border-gray-600/30 rounded-lg transition-all duration-200 group disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center gap-3">
                          {isGenerating ? (
                            <CircularProgress
                              size={20}
                              sx={{ color: "#3B82F6" }}
                            />
                          ) : (
                            <RefreshIcon
                              sx={{
                                color: !prompt.trim()
                                  ? "rgba(255,255,255,0.4)"
                                  : "#3B82F6",
                                fontSize: "20px",
                              }}
                            />
                          )}
                          <div className="text-left">
                            <Typography
                              variant="body2"
                              sx={{
                                color: !prompt.trim()
                                  ? "rgba(255,255,255,0.4)"
                                  : "white",
                                fontWeight: 500,
                                fontSize: "14px",
                              }}
                            >
                              {isGenerating ? "Generating..." : "Regenerate"}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: !prompt.trim()
                                  ? "rgba(255,255,255,0.3)"
                                  : "rgba(255, 255, 255, 0.6)",
                                fontSize: "11px",
                              }}
                            >
                              {isGenerating
                                ? "Please wait..."
                                : "Create new versions"}
                            </Typography>
                          </div>
                        </div>
                      </button>
                    )}
                  </div>
                </div>

                {/* History Section */}
                <div className="flex items-center gap-3 mb-4 p-3 bg-gradient-to-r from-gray-800/50 to-gray-700/30 rounded-lg border border-white/10">
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
                      Recent Projects
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(255, 255, 255, 0.6)",
                        fontSize: "12px",
                      }}
                    >
                      {imageHistory.length} of 10 projects
                    </Typography>
                  </div>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
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
                        {/* Preview placeholders since we don't store image URLs */}
                        <div className="flex h-16 overflow-hidden bg-gray-700 rounded-t-lg">
                          {Array.from({
                            length: Math.min(item.uploadedCount || 0, 2),
                          }).map((_, idx) => (
                            <div
                              key={idx}
                              className="flex-1 border-r border-gray-600 last:border-r-0"
                            >
                              <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-600 to-gray-700">
                                <div className="text-center">
                                  <ImageIcon
                                    sx={{
                                      fontSize: "20px",
                                      color: idx === 0 ? "#D4AF37" : "#60A5FA",
                                      opacity: 0.7,
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "rgba(255, 255, 255, 0.5)",
                                      fontSize: "10px",
                                      display: "block",
                                      marginTop: "2px",
                                    }}
                                  >
                                    #{idx + 1}
                                  </Typography>
                                </div>
                              </div>
                            </div>
                          ))}
                          {Array.from({
                            length: 2 - Math.min(item.uploadedCount || 0, 2),
                          }).map((_, idx) => (
                            <div
                              key={`empty-${idx}`}
                              className="flex-1 border-r border-gray-600 last:border-r-0"
                            >
                              <div className="h-full flex items-center justify-center bg-gray-800">
                                <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Delete button */}
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
                              width: "24px",
                              height: "24px",
                              "&:hover": {
                                bgcolor: "rgba(212, 175, 55, 0.2)",
                                borderColor: "#D4AF37",
                                transform: "scale(1.1)",
                              },
                              backdropFilter: "blur(4px)",
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: "14px" }} />
                          </IconButton>
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
                            fontSize: "13px",
                          }}
                          title={item.prompt}
                        >
                          {item.prompt.length > 30
                            ? `${item.prompt.substring(0, 30)}...`
                            : item.prompt}
                        </Typography>

                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            <Chip
                              label={`${item.uploadedCount || 0} input`}
                              size="small"
                              sx={{
                                bgcolor: "rgba(212, 175, 55, 0.2)",
                                color: "#D4AF37",
                                fontSize: "10px",
                                height: "18px",
                              }}
                            />
                            <Chip
                              label={`${item.generatedCount || 0} output`}
                              size="small"
                              sx={{
                                bgcolor: "rgba(34, 197, 94, 0.2)",
                                color: "#22C55E",
                                fontSize: "10px",
                                height: "18px",
                              }}
                            />
                          </div>

                          <Typography
                            variant="caption"
                            sx={{
                              color: "rgba(255, 255, 255, 0.6)",
                              fontSize: "10px",
                            }}
                          >
                            {new Date(item.timestamp).toLocaleDateString()}
                          </Typography>
                        </div>
                      </Box>
                    </Card>
                  ))}

                  {imageHistory.length === 0 && (
                    <div className="text-center py-8">
                      <div className="mb-3">
                        <HistoryIcon
                          sx={{
                            fontSize: "40px",
                            color: "rgba(212, 175, 55, 0.3)",
                          }}
                        />
                      </div>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "rgba(255, 255, 255, 0.6)",
                          fontWeight: 500,
                          marginBottom: "4px",
                          fontSize: "14px",
                        }}
                      >
                        No projects yet
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgba(255, 255, 255, 0.4)",
                          fontSize: "12px",
                        }}
                      >
                        Completed projects will appear here
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
        <div className="p-3 md:p-6 border-b border-white/10">
          <TitleBar />
        </div>

        {/* Main Workspace - Improved Layout */}
        <div className="flex-1 p-3 md:p-6 flex flex-col">
          {/* Content Area with Uploaded and Generated Images */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6">
            {/* Uploaded Images - Compact Size */}
            <div className="lg:col-span-1">
              <div className="mb-4 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-gold/20 to-gold/10 rounded-lg">
                  <CloudUploadIcon
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
                    }}
                  >
                    Source Images
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255, 255, 255, 0.6)",
                      fontSize: "12px",
                    }}
                  >
                    {uploadedImages.length}/2 uploaded
                  </Typography>
                </div>
              </div>

              {/* Compact Image Slots */}
              <div className="space-y-4">
                {/* Image Slot 1 */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gold rounded-full"></div>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "white",
                          fontWeight: 500,
                          fontSize: "14px",
                        }}
                      >
                        Image 1
                      </Typography>
                      {selectedImageIndex === 0 && (
                        <Chip
                          label="Selected"
                          size="small"
                          sx={{
                            bgcolor: "rgba(212, 175, 55, 0.2)",
                            color: "#D4AF37",
                            fontSize: "10px",
                            height: "16px",
                          }}
                        />
                      )}
                    </div>
                    {uploadedImages[0] && (
                      <div className="flex gap-1">
                        <Tooltip title="Replace">
                          <IconButton
                            size="small"
                            onClick={() => handleReplaceImage(0)}
                            sx={{
                              bgcolor: "rgba(212, 175, 55, 0.2)",
                              color: "#D4AF37",
                              width: "24px",
                              height: "24px",
                              "&:hover": {
                                bgcolor: "rgba(212, 175, 55, 0.3)",
                              },
                            }}
                          >
                            <FiEdit3 size={12} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove">
                          <IconButton
                            size="small"
                            onClick={() => removeImage(0)}
                            sx={{
                              bgcolor: "rgba(239, 68, 68, 0.2)",
                              color: "#EF4444",
                              width: "24px",
                              height: "24px",
                              "&:hover": {
                                bgcolor: "rgba(239, 68, 68, 0.3)",
                              },
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: "12px" }} />
                          </IconButton>
                        </Tooltip>
                      </div>
                    )}
                  </div>

                  <Card
                    className={`cursor-pointer transition-all duration-300 ${
                      selectedImageIndex === 0
                        ? "ring-2 ring-gold ring-opacity-50"
                        : ""
                    }`}
                    onClick={() => setSelectedImageIndex(0)}
                    sx={{
                      bgcolor: "rgba(30, 41, 59, 0.8)",
                      border:
                        selectedImageIndex === 0
                          ? "2px solid #D4AF37"
                          : "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "12px",
                      overflow: "hidden",
                      height: "150px", // Fixed compact height
                      boxShadow:
                        selectedImageIndex === 0
                          ? "0 0 15px rgba(212, 175, 55, 0.3)"
                          : "0 2px 8px rgba(0, 0, 0, 0.1)",
                      "&:hover": {
                        borderColor: "#D4AF37",
                        boxShadow: "0 4px 15px rgba(212, 175, 55, 0.2)",
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    {uploadedImages[0] ? (
                      <div className="relative h-full group">
                        <CardMedia
                          component="img"
                          image={uploadedImages[0].url}
                          alt="Image 1"
                          sx={{
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                        {/* Action buttons overlay */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Tooltip title="Fullscreen">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFullscreen(uploadedImages[0].url);
                              }}
                              sx={{
                                bgcolor: "rgba(0, 0, 0, 0.7)",
                                color: "white",
                                width: "24px",
                                height: "24px",
                                "&:hover": {
                                  bgcolor: "rgba(212, 175, 55, 0.8)",
                                },
                              }}
                            >
                              <FullscreenIcon sx={{ fontSize: "14px" }} />
                            </IconButton>
                          </Tooltip>
                        </div>

                        {/* Image info */}
                        <div className="absolute bottom-2 left-2">
                          <Chip
                            label={uploadedImages[0].name}
                            size="small"
                            sx={{
                              bgcolor: "rgba(0, 0, 0, 0.7)",
                              color: "white",
                              fontSize: "9px",
                              height: "16px",
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div
                        className="h-full flex items-center justify-center border-2 border-dashed border-gold/50 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 hover:border-gold transition-all duration-200"
                        onClick={handleAddImage}
                      >
                        <div className="text-center">
                          <CloudUploadIcon
                            sx={{
                              fontSize: "32px",
                              color: "#D4AF37",
                              marginBottom: "8px",
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              color: "white",
                              fontWeight: 500,
                              marginBottom: "4px",
                              fontSize: "12px",
                            }}
                          >
                            Upload First
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "rgba(255, 255, 255, 0.6)",
                              fontSize: "10px",
                            }}
                          >
                            Click to browse
                          </Typography>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>

                {/* Image Slot 2 */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "white",
                          fontWeight: 500,
                          fontSize: "14px",
                        }}
                      >
                        Image 2
                      </Typography>
                      {selectedImageIndex === 1 && (
                        <Chip
                          label="Selected"
                          size="small"
                          sx={{
                            bgcolor: "rgba(96, 165, 250, 0.2)",
                            color: "#60A5FA",
                            fontSize: "10px",
                            height: "16px",
                          }}
                        />
                      )}
                    </div>
                    {uploadedImages[1] && (
                      <div className="flex gap-1">
                        <Tooltip title="Replace">
                          <IconButton
                            size="small"
                            onClick={() => handleReplaceImage(1)}
                            sx={{
                              bgcolor: "rgba(96, 165, 250, 0.2)",
                              color: "#60A5FA",
                              width: "24px",
                              height: "24px",
                              "&:hover": {
                                bgcolor: "rgba(96, 165, 250, 0.3)",
                              },
                            }}
                          >
                            <FiEdit3 size={12} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove">
                          <IconButton
                            size="small"
                            onClick={() => removeImage(1)}
                            sx={{
                              bgcolor: "rgba(239, 68, 68, 0.2)",
                              color: "#EF4444",
                              width: "24px",
                              height: "24px",
                              "&:hover": {
                                bgcolor: "rgba(239, 68, 68, 0.3)",
                              },
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: "12px" }} />
                          </IconButton>
                        </Tooltip>
                      </div>
                    )}
                  </div>

                  <Card
                    className={`cursor-pointer transition-all duration-300 ${
                      selectedImageIndex === 1
                        ? "ring-2 ring-blue-400 ring-opacity-50"
                        : ""
                    }`}
                    onClick={() => setSelectedImageIndex(1)}
                    sx={{
                      bgcolor: "rgba(30, 41, 59, 0.8)",
                      border:
                        selectedImageIndex === 1
                          ? "2px solid #60A5FA"
                          : "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "12px",
                      overflow: "hidden",
                      height: "150px", // Fixed compact height
                      boxShadow:
                        selectedImageIndex === 1
                          ? "0 0 15px rgba(96, 165, 250, 0.3)"
                          : "0 2px 8px rgba(0, 0, 0, 0.1)",
                      "&:hover": {
                        borderColor: "#60A5FA",
                        boxShadow: "0 4px 15px rgba(96, 165, 250, 0.2)",
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    {uploadedImages[1] ? (
                      <div className="relative h-full group">
                        <CardMedia
                          component="img"
                          image={uploadedImages[1].url}
                          alt="Image 2"
                          sx={{
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                        {/* Action buttons overlay */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Tooltip title="Fullscreen">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFullscreen(uploadedImages[1].url);
                              }}
                              sx={{
                                bgcolor: "rgba(0, 0, 0, 0.7)",
                                color: "white",
                                width: "24px",
                                height: "24px",
                                "&:hover": {
                                  bgcolor: "rgba(96, 165, 250, 0.8)",
                                },
                              }}
                            >
                              <FullscreenIcon sx={{ fontSize: "14px" }} />
                            </IconButton>
                          </Tooltip>
                        </div>

                        {/* Image info */}
                        <div className="absolute bottom-2 left-2">
                          <Chip
                            label={uploadedImages[1].name}
                            size="small"
                            sx={{
                              bgcolor: "rgba(0, 0, 0, 0.7)",
                              color: "white",
                              fontSize: "9px",
                              height: "16px",
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div
                        className="h-full flex items-center justify-center border-2 border-dashed border-blue-400/50 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 hover:border-blue-400 transition-all duration-200"
                        onClick={
                          uploadedImages.length === 0
                            ? handleAddImage
                            : () => handleReplaceImage(1)
                        }
                      >
                        <div className="text-center">
                          <CloudUploadIcon
                            sx={{
                              fontSize: "32px",
                              color: "#60A5FA",
                              marginBottom: "8px",
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              color: "white",
                              fontWeight: 500,
                              marginBottom: "4px",
                              fontSize: "12px",
                            }}
                          >
                            {uploadedImages.length === 0
                              ? "Upload Second"
                              : "Add Second"}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "rgba(255, 255, 255, 0.6)",
                              fontSize: "10px",
                            }}
                          >
                            Click to browse
                          </Typography>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            </div>

            {/* Generated Images - Larger Display */}
            <div className="lg:col-span-2">
              {generatedImages.length > 0 ? (
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-green-600/20 to-green-600/10 rounded-lg">
                      <GridViewIcon
                        sx={{
                          color: "#22C55E",
                          fontSize: "24px",
                        }}
                      />
                    </div>
                    <div>
                      <Typography
                        variant="h6"
                        sx={{
                          color: "white",
                          fontWeight: 600,
                          fontSize: "18px",
                        }}
                      >
                        Generated Results
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgba(255, 255, 255, 0.6)",
                          fontSize: "14px",
                        }}
                      >
                        {generatedImages.length} image
                        {generatedImages.length > 1 ? "s" : ""} generated
                      </Typography>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    {generatedImages.map((img, index) => (
                      <Card
                        key={index}
                        className="cursor-pointer transition-all duration-200 overflow-hidden group"
                        onClick={() => toggleFullscreen(img)}
                        sx={{
                          bgcolor: "rgba(30, 41, 59, 0.8)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          borderRadius: "12px",
                          "&:hover": {
                            borderColor: "#22C55E",
                            boxShadow: "0 4px 20px rgba(34, 197, 94, 0.3)",
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        <div className="relative">
                          <CardMedia
                            component="img"
                            height="300"
                            image={img}
                            alt={`Generated image ${index + 1}`}
                            sx={{
                              height: "300px", // Increased from 200px
                              objectFit: "cover",
                            }}
                          />

                          {/* Overlay on hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200" />

                          {/* Action buttons */}
                          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Tooltip title="Download">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadImage(img, `generated-${index + 1}`);
                                }}
                                sx={{
                                  bgcolor: "rgba(0, 0, 0, 0.7)",
                                  border: "1px solid #22C55E",
                                  color: "#22C55E",
                                  width: "32px",
                                  height: "32px",
                                  "&:hover": {
                                    bgcolor: "rgba(34, 197, 94, 0.2)",
                                    transform: "scale(1.1)",
                                  },
                                  backdropFilter: "blur(4px)",
                                }}
                              >
                                <DownloadIcon sx={{ fontSize: "18px" }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View Fullscreen">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFullscreen(img);
                                }}
                                sx={{
                                  bgcolor: "rgba(0, 0, 0, 0.7)",
                                  border: "1px solid #22C55E",
                                  color: "#22C55E",
                                  width: "32px",
                                  height: "32px",
                                  "&:hover": {
                                    bgcolor: "rgba(34, 197, 94, 0.2)",
                                    transform: "scale(1.1)",
                                  },
                                  backdropFilter: "blur(4px)",
                                }}
                              >
                                <FullscreenIcon sx={{ fontSize: "18px" }} />
                              </IconButton>
                            </Tooltip>
                          </div>

                          {/* Image number */}
                          <div className="absolute bottom-3 left-3">
                            <Chip
                              label={`Result ${index + 1}`}
                              size="small"
                              sx={{
                                bgcolor: "rgba(34, 197, 94, 0.9)",
                                color: "black",
                                fontSize: "12px",
                                fontWeight: 600,
                                height: "20px",
                              }}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="mb-4 p-4 bg-gradient-to-r from-gray-600/20 to-gray-600/10 rounded-full w-fit mx-auto">
                      <GridViewIcon
                        sx={{
                          fontSize: "48px",
                          color: "rgba(255, 255, 255, 0.3)",
                        }}
                      />
                    </div>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "rgba(255, 255, 255, 0.6)",
                        fontWeight: 500,
                        marginBottom: "8px",
                        fontSize: "18px",
                      }}
                    >
                      No images generated yet
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255, 255, 255, 0.4)",
                        fontSize: "14px",
                        maxWidth: "300px",
                        margin: "0 auto",
                      }}
                    >
                      Upload two images and add a prompt to generate new images
                    </Typography>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input Section - Bottom placement */}
          <div className="mt-3 md:mt-6 border-t border-white/10 pt-3 md:pt-6">
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    !isGenerating &&
                    uploadedImages.length > 0 &&
                    prompt.trim() &&
                    handleGenerate()
                  }
                  placeholder="Describe what you want to generate from these images..."
                  className="w-full px-4 md:px-6 py-3 md:py-4 pr-32 md:pr-40 bg-gray-800/50 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200 backdrop-blur-sm text-sm md:text-base shadow-lg"
                  disabled={isGenerating}
                />

                {/* Action buttons */}
                <div className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 flex gap-1 md:gap-2">
                  <button
                    onClick={handleGenerate}
                    disabled={
                      isGenerating ||
                      uploadedImages.length === 0 ||
                      !prompt.trim()
                    }
                    className="bg-gradient-to-r from-gold to-yellow-600 hover:from-yellow-600 hover:to-gold disabled:from-gray-600 disabled:to-gray-700 text-white font-medium px-3 md:px-6 py-1.5 md:py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 md:gap-2 shadow-lg text-xs md:text-sm"
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

              {/* Status indicator */}
              <div className="flex items-center justify-center mt-3 md:mt-4 gap-2 md:gap-4 text-xs md:text-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      uploadedImages.length >= 1 ? "bg-gold" : "bg-gray-600"
                    }`}
                  ></div>
                  <span
                    className={
                      uploadedImages.length >= 1 ? "text-gold" : "text-gray-400"
                    }
                  >
                    Image 1 {uploadedImages.length >= 1 ? "✓" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      uploadedImages.length >= 2 ? "bg-blue-400" : "bg-gray-600"
                    }`}
                  ></div>
                  <span
                    className={
                      uploadedImages.length >= 2
                        ? "text-blue-400"
                        : "text-gray-400"
                    }
                  >
                    Image 2 {uploadedImages.length >= 2 ? "✓" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      prompt.trim() ? "bg-green-400" : "bg-gray-600"
                    }`}
                  ></div>
                  <span
                    className={
                      prompt.trim() ? "text-green-400" : "text-gray-400"
                    }
                  >
                    Prompt {prompt.trim() ? "✓" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && fullscreenImage && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="relative max-w-full max-h-full p-4">
            <Image
              src={fullscreenImage}
              alt="Fullscreen view"
              width={1200}
              height={800}
              className="max-w-full max-h-full object-contain"
              onClick={closeFullscreen}
            />

            {/* Close button */}
            <Tooltip title="Close Fullscreen">
              <Fab
                onClick={closeFullscreen}
                sx={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  bgcolor: "#D4AF3700",
                  border: "1px solid #D4AF37",
                  color: "#D4AF37",
                  "&:hover": {
                    bgcolor: "#D4AF3720",
                    borderColor: "#D4AF37",
                  },
                  backdropFilter: "blur(4px)",
                }}
              >
                <CloseIcon />
              </Fab>
            </Tooltip>

            {/* Download button */}
            <Tooltip title="Download Image">
              <Fab
                onClick={() =>
                  downloadImage(fullscreenImage, "dual-editor-fullscreen")
                }
                sx={{
                  position: "absolute",
                  top: "80px",
                  right: "20px",
                  bgcolor: "#D4AF3700",
                  border: "1px solid #D4AF37",
                  color: "#D4AF37",
                  "&:hover": {
                    bgcolor: "#D4AF3720",
                    borderColor: "#D4AF37",
                  },
                  backdropFilter: "blur(4px)",
                }}
              >
                <DownloadIcon />
              </Fab>
            </Tooltip>
          </div>
        </div>
      )}

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

      {/* Custom CSS for scrollbar and animations */}
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
