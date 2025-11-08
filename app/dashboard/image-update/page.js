"use client";
import Image from "next/image";
import WorkspaceHeader from "@/components/dashboard/WorkspaceHeader";
import DashboardWorkspaceNav from "@/components/dashboard/DashboardWorkspaceNav";
import WorkspaceSidePanel from "@/components/dashboard/WorkspaceSidePanel";
import WorkspaceQuickStats from "@/components/dashboard/WorkspaceQuickStats";
import { BiDownload, BiRefresh } from "react-icons/bi";
import { HiOutlinePhotograph, HiOutlineAdjustments, HiX } from "react-icons/hi";
import { MdCompareArrows } from "react-icons/md";
import { FiUpload, FiEdit3, FiCheck } from "react-icons/fi";
import { RiExpandDiagonalLine } from "react-icons/ri";
import { useRef, useState, useEffect } from "react";
import { apiCall, API_BASE_URL } from "@/utils/apiUtils";
import { Slide } from "@mui/material";

export default function ImageUpdate() {
  const [prompt, setPrompt] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [selectedForEdit, setSelectedForEdit] = useState("original"); // "original" or "generated"
  const [showMessage, setShowMessage] = useState(null);
  const [showMobileGallery, setShowMobileGallery] = useState(false);
  const [showMobileComparison, setShowMobileComparison] = useState(false);
  const fileInputRef = useRef(null);

  // Show message notification
  const displayMessage = (message) => {
    setShowMessage(message);
    setTimeout(() => setShowMessage(null), 3000);
  };

  const handleAddImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);

    if (files.length === 0) {
      return;
    }

    files.forEach((file) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        displayMessage(`"${file.name}" is not a valid image file.`);
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        displayMessage(`"${file.name}" is too large. Maximum size is 10MB.`);
        return;
      }

      // Validate image type (common formats)
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        displayMessage(
          `"${file.name}" format not supported. Please use JPG, PNG, GIF, or WebP.`
        );
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const newImage = {
            id: Date.now() + Math.random(),
            name: file.name,
            url: e.target.result,
            file: file,
            size: file.size,
            type: file.type,
          };

          setUploadedImages((prev) => [...prev, newImage]);

          if (!selectedImage) {
            setSelectedImage(newImage);
            setSelectedForEdit("original");
          }

          displayMessage(`"${file.name}" uploaded successfully!`);
        } catch (error) {
          console.error("Error processing uploaded image:", error);
          displayMessage(`Failed to process "${file.name}"`);
        }
      };

      reader.onerror = () => {
        displayMessage(`Failed to read "${file.name}"`);
      };

      reader.readAsDataURL(file);
    });

    // Reset input
    event.target.value = "";
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setSelectedForEdit("original");
  };

  const removeImage = (imageId, event) => {
    event.stopPropagation();
    setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
    if (selectedImage && selectedImage.id === imageId) {
      setSelectedImage(null);
      setGeneratedImage(null);
    }
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
    if (selectedForEdit === "generated" && generatedImage && prompt.trim()) {
      handleGenerate();
    } else if (
      selectedForEdit === "original" &&
      selectedImage &&
      prompt.trim()
    ) {
      handleGenerate();
    } else {
      displayMessage("Please select an image and enter a prompt");
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage || !prompt.trim()) {
      displayMessage("Please select an image and enter a prompt");
      return;
    }

    setIsGenerating(true);
    try {
      const formData = new FormData();

      // Use the appropriate image based on selection
      let imageToEdit;

      if (selectedForEdit === "generated" && generatedImage) {
        // Handle generated image - convert to blob properly
        try {
          if (generatedImage.startsWith("data:image/")) {
            // Convert data URL to blob
            const response = await fetch(generatedImage);
            imageToEdit = await response.blob();
          } else {
            // If it's a URL, fetch it
            const response = await fetch(generatedImage);
            if (!response.ok) {
              throw new Error("Failed to fetch generated image");
            }
            imageToEdit = await response.blob();
          }
        } catch (blobError) {
          console.error("Error converting generated image:", blobError);
          displayMessage(
            "Error processing generated image. Using original instead."
          );
          imageToEdit = selectedImage.file;
        }
      } else {
        // Use original image file
        imageToEdit = selectedImage.file;
      }

      // Validate that we have a valid image
      if (
        !imageToEdit ||
        !imageToEdit.type ||
        !imageToEdit.type.startsWith("image/")
      ) {
        throw new Error("Invalid image data");
      }

      formData.append("image", imageToEdit);
      formData.append("prompt", prompt);

      console.log("Sending image edit request:", {
        imageType: imageToEdit.type,
        imageSize: imageToEdit.size,
        prompt: prompt,
        selectedForEdit: selectedForEdit,
      });

      const res = await apiCall("/edit-image", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Backend response:", data);

        // Handle different response formats
        if (data.image_url) {
          setGeneratedImage(data.image_url);
        } else if (data.image) {
          if (data.image.startsWith("data:image/")) {
            setGeneratedImage(data.image);
          } else if (data.image.length > 1000) {
            setGeneratedImage(`data:image/png;base64,${data.image}`);
          } else {
            setGeneratedImage(data.image);
          }
        } else if (data.base64_image) {
          setGeneratedImage(`data:image/png;base64,${data.base64_image}`);
        } else if (data.generated_images && data.generated_images.length > 0) {
          const firstImage = data.generated_images[0];
          if (firstImage.startsWith("data:image/")) {
            setGeneratedImage(firstImage);
          } else {
            setGeneratedImage(`data:image/png;base64,${firstImage}`);
          }
        } else {
          throw new Error("No image data received from server");
        }
        displayMessage("Image generated successfully!");
      } else {
        const errorData = await res
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
    } catch (error) {
      console.error("Error generating image:", error);

      // Provide more specific error messages
      if (error.message.includes("400")) {
        displayMessage("Invalid request. Please check your image and prompt.");
      } else if (error.message.includes("413")) {
        displayMessage("Image file too large. Please use a smaller image.");
      } else if (error.message.includes("429")) {
        displayMessage(
          "Too many requests. Please wait a moment and try again."
        );
      } else if (error.message.includes("500")) {
        displayMessage("Server error. Please try again later.");
      } else {
        displayMessage("Failed to generate image. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Mobile Gallery Modal Component
  const MobileGalleryModal = () => (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-white font-semibold text-lg">Gallery</h3>
          <button
            onClick={() => setShowMobileGallery(false)}
            className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-all duration-200"
          >
            <HiX className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Upload Button */}
        <div className="p-4">
          <button
            onClick={handleAddImage}
            className="w-full py-3 px-4 bg-gradient-to-r from-gold/20 to-yellow-600/20 hover:from-gold/30 hover:to-yellow-600/30 border-2 border-dashed border-gold/50 hover:border-gold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <FiUpload className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
            <span className="text-gold font-medium">Upload New Image</span>
          </button>
        </div>

        {/* Image Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            {uploadedImages.map((image) => (
              <div
                key={image.id}
                className="relative group cursor-pointer"
                onClick={() => {
                  handleImageClick(image);
                  setShowMobileGallery(false);
                }}
              >
                <div
                  className={`aspect-square rounded-lg overflow-hidden ring-2 transition-all duration-200 ${
                    selectedImage?.id === image.id
                      ? "ring-gold shadow-lg shadow-gold/20"
                      : "ring-white/20 hover:ring-gold/50"
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={image.name}
                    width={150}
                    height={150}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={(e) => removeImage(image.id, e)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center shadow-lg"
                >
                  ×
                </button>
                <div className="absolute bottom-1 left-1 right-1">
                  <div className="bg-black/70 backdrop-blur-sm rounded px-2 py-1">
                    <p className="text-white text-xs truncate">{image.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Generated Image */}
          {generatedImage && (
            <div className="mt-6 border-t border-white/10 pt-4">
              <p className="text-gray-400 text-sm mb-3 font-medium">
                Generated Result
              </p>
              <div className="relative group cursor-pointer">
                <div className="aspect-square rounded-lg overflow-hidden ring-2 ring-green-500/50 hover:ring-green-400 transition-all duration-200">
                  <Image
                    src={generatedImage}
                    alt="Generated"
                    width={150}
                    height={150}
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
              {selectedImage ? (
                <Image
                  src={selectedImage.url}
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
                    : selectedImage?.url,
                  selectedForEdit === "generated"
                    ? "generated"
                    : selectedImage?.name
                )
              }
              disabled={!selectedImage}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-700/50 hover:bg-gray-600/50 disabled:bg-gray-800/50 text-white disabled:text-gray-500 font-medium rounded-lg transition-all duration-200"
            >
              <BiDownload className="w-5 h-5" />
              <span>Download Selected</span>
            </button>
            <button
              onClick={handleRegenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gold/20 hover:bg-gold/30 disabled:bg-gray-700/30 rounded-lg transition-all duration-200 text-gold hover:text-yellow-300 disabled:text-gray-500 font-medium"
            >
              <BiRefresh
                className={`w-5 h-5 ${isGenerating ? "animate-spin" : ""}`}
              />
              <span>Re-generate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return "--";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatImageMeta = (image, fallback = "Awaiting image") => {
    if (!image) return fallback;
    const size =
      typeof image.size === "number"
        ? formatFileSize(image.size)
        : image.file?.size
        ? formatFileSize(image.file.size)
        : "--";
    const type = (image.type || image.file?.type || "image").split("/").pop();
    return `${size} • ${type?.toUpperCase() || "IMG"}`;
  };

  const quickStats = [
    {
      label: "Uploads",
      value: `${uploadedImages.length}`,
      hint: "Active assets",
    },
    {
      label: "Selected",
      value: selectedImage?.name ? selectedImage.name.slice(0, 14) : "None",
      hint:
        selectedForEdit === "generated" ? "Editing output" : "Editing input",
    },
    {
      label: "Status",
      value: isGenerating ? "Rendering" : generatedImage ? "Ready" : "Idle",
      hint: isGenerating ? "GPU engaged" : "Standing by",
    },
    {
      label: "Mode",
      value: selectedForEdit === "generated" ? "Generated" : "Original",
      hint: "Active layer",
    },
  ];

  return (
    <div className="space-y-6">
      <DashboardWorkspaceNav hideOverview />
      <WorkspaceHeader
        title="Image Update Pipeline"
        description="Refresh lighting, backgrounds, and campaign-specific elements without re-rendering entire scenes or rebooking shoots."
        badges={["Upload ready", "Mask aware"]}
      />
      <WorkspaceQuickStats stats={quickStats} />
      <div className="flex min-h-[calc(100vh-8rem)] gap-4 rounded-3xl border border-white/10 bg-[#181D28] p-3 shadow-[0_30px_90px_rgba(6,8,20,0.45)] md:p-6">
        <WorkspaceSidePanel
          title="Gallery"
          subtitle="Uploaded & Generated"
          collapsedLabel="Gallery"
          icon={HiOutlinePhotograph}
        >
          {({ isOpen }) => (
            <Slide direction="right" in={isOpen} mountOnEnter unmountOnExit>
              <div className="flex-1 overflow-hidden">
                <button
                  onClick={handleAddImage}
                  className="group mb-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gold/50 bg-gradient-to-r from-gold/20 to-yellow-600/20 px-4 py-3 transition-all duration-200 hover:border-gold hover:from-gold/30 hover:to-yellow-600/30"
                >
                  <FiUpload className="w-5 h-5 text-gold transition-transform group-hover:scale-110" />
                  <span className="text-gold font-medium">Upload Image</span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </button>

                <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto">
                  {uploadedImages.map((image) => (
                    <div
                      key={image.id}
                      className="group relative cursor-pointer rounded-xl border border-white/10 bg-gray-800/40 p-3 transition-all duration-200 hover:border-gold/40"
                      onClick={() => handleImageSelection(image)}
                    >
                      <div className="h-20 w-full overflow-hidden rounded-lg">
                        <Image
                          src={image.url}
                          alt={image.name}
                          width={320}
                          height={80}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm font-medium">
                            {image.name.length > 20
                              ? `${image.name.slice(0, 17)}...`
                              : image.name}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {Math.round(image.size / 1024)} KB • {image.type}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReplaceImage(uploadedImages.indexOf(image));
                            }}
                            className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 transition-all duration-200 hover:border-gold/50 hover:text-white"
                          >
                            <FiEdit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteImage(image.id);
                            }}
                            className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-red-300 transition-all duration-200 hover:bg-red-500/20"
                          >
                            <HiX className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {selectedImage?.id === image.id && (
                        <div className="absolute inset-0 rounded-xl border-2 border-gold/60"></div>
                      )}
                    </div>
                  ))}

                  {uploadedImages.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-center">
                      <HiOutlinePhotograph className="mx-auto mb-2 h-12 w-12 text-white/40" />
                      <p className="text-white font-medium">No images yet</p>
                      <p className="text-gray-400 text-sm">
                        Upload images to start editing
                      </p>
                    </div>
                  )}
                </div>

                {generatedImage && (
                  <div className="mt-6 border-t border-white/10 pt-4">
                    <p className="mb-3 text-sm font-medium text-gray-400">
                      Generated Result
                    </p>
                    <div className="group relative cursor-pointer">
                      <div className="h-20 w-full overflow-hidden rounded-lg ring-1 ring-green-500/50 transition-all duration-200 hover:ring-green-400">
                        <Image
                          src={generatedImage}
                          alt="Generated"
                          width={320}
                          height={80}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="absolute right-2 top-2 rounded-full bg-green-500 px-2 py-1 text-xs font-medium text-white">
                        NEW
                      </div>
                    </div>
                  </div>
                )}

                {selectedImage && (
                  <div className="mt-4 border-t border-white/10 pt-4 space-y-2">
                    <p className="mb-3 text-sm font-medium text-gray-400">
                      Quick Actions
                    </p>
                    <button
                      onClick={() =>
                        downloadImage(
                          selectedForEdit === "generated"
                            ? generatedImage
                            : selectedImage.url,
                          selectedForEdit === "generated"
                            ? "generated"
                            : selectedImage.name
                        )
                      }
                      className="flex w-full items-center gap-3 rounded-lg bg-gray-700/50 px-3 py-2 text-gray-300 transition-all duration-200 hover:bg-gray-600/50 hover:text-white"
                    >
                      <BiDownload className="h-4 w-4" />
                      <span className="text-sm">Download</span>
                    </button>
                    <button
                      onClick={handleResize}
                      className="flex w-full items-center gap-3 rounded-lg bg-gray-700/50 px-3 py-2 text-gray-300 transition-all duration-200 hover:bg-gray-600/50 hover:text-white"
                    >
                      <RiExpandDiagonalLine className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleRegenerate}
                      disabled={isGenerating || !prompt.trim()}
                      className="flex w-full items-center gap-3 rounded-lg bg-gold/20 px-3 py-2 text-gold transition-all duration-200 hover:bg-gold/30 hover:text-yellow-300 disabled:bg-gray-700/30 disabled:text-gray-500"
                    >
                      <BiRefresh
                        className={`h-4 w-4 ${
                          isGenerating ? "animate-spin" : ""
                        }`}
                      />
                      <span className="text-sm">Re-generate</span>
                    </button>
                  </div>
                )}
              </div>
            </Slide>
          )}
        </WorkspaceSidePanel>

        {/* Main Content Area */}
        <div className="flex-1 p-3 md:p-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_26rem] items-start">
            <div className="flex flex-col rounded-[32px] border border-white/10 bg-gradient-to-br from-[#111828] via-[#101826] to-[#0b0f19] p-3 md:p-6 shadow-[0_40px_120px_rgba(6,8,20,0.65)]">
              {/* Central Workspace */}
              <div className="flex-1 flex">
                {/* Prompt Input Area */}
                <div className="flex-1 p-3 md:p-6">
                  <div className="max-w-4xl mx-auto">
                    {/* Mobile Upload Section - Only visible on mobile when no images */}
                    {uploadedImages.length === 0 && (
                      <div className="md:hidden mb-6">
                        <div className="text-center">
                          <button
                            onClick={handleAddImage}
                            className="w-full py-4 px-6 bg-gradient-to-r from-gold/20 to-yellow-600/20 hover:from-gold/30 hover:to-yellow-600/30 border-2 border-dashed border-gold/50 hover:border-gold rounded-xl transition-all duration-200 flex items-center justify-center gap-3 group"
                          >
                            <FiUpload className="w-6 h-6 text-gold group-hover:scale-110 transition-transform" />
                            <span className="text-gold font-medium text-lg">
                              Upload Image to Start
                            </span>
                          </button>
                          <p className="text-gray-400 text-sm mt-2">
                            Choose an image to modify with AI
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Mobile Quick Actions - Only visible on mobile when images exist */}
                    {uploadedImages.length > 0 && (
                      <div className="md:hidden mb-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowMobileGallery(true)}
                            className="flex-1 py-2 px-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-white text-sm font-medium"
                          >
                            <HiOutlinePhotograph className="w-4 h-4" />
                            Gallery ({uploadedImages.length})
                          </button>
                          <button
                            onClick={() => setShowMobileComparison(true)}
                            disabled={!selectedImage}
                            className="flex-1 py-2 px-3 bg-gray-700/50 hover:bg-gray-600/50 disabled:bg-gray-800/50 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-white disabled:text-gray-500 text-sm font-medium"
                          >
                            <MdCompareArrows className="w-4 h-4" />
                            Compare
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Selected Image Preview - Mobile */}
                    {selectedImage && (
                      <div className="md:hidden mb-6">
                        <div className="bg-gray-800/50 rounded-xl p-4 border border-white/10">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-white font-medium">
                              Selected Image
                            </h3>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setSelectedForEdit("original")}
                                className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                                  selectedForEdit === "original"
                                    ? "bg-gold text-gray-900"
                                    : "bg-gray-700/50 text-gray-300"
                                }`}
                              >
                                Original
                              </button>
                              {generatedImage && (
                                <button
                                  onClick={() =>
                                    setSelectedForEdit("generated")
                                  }
                                  className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                                    selectedForEdit === "generated"
                                      ? "bg-gold text-gray-900"
                                      : "bg-gray-700/50 text-gray-300"
                                  }`}
                                >
                                  Generated
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                            <Image
                              src={
                                selectedForEdit === "generated" &&
                                generatedImage
                                  ? generatedImage
                                  : selectedImage.url
                              }
                              alt="Selected"
                              width={400}
                              height={225}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Modern Input Box */}
                    <div className="mb-6 md:mb-8">
                      <label className="block text-white font-medium mb-2 md:mb-3 text-sm md:text-base">
                        Describe your image modifications
                      </label>
                      <div className="relative">
                        <textarea
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="Describe how you want to modify the image... (e.g., 'Add sunglasses to the person', 'Change background to beach', 'Make it more colorful')"
                          className="w-full h-24 md:h-32 px-3 md:px-4 py-2 md:py-3 bg-gray-800/50 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200 resize-none backdrop-blur-sm text-sm md:text-base"
                          disabled={isGenerating}
                        />
                        <div className="absolute bottom-2 md:bottom-3 right-2 md:right-3">
                          <FiEdit3 className="w-3 md:w-4 h-3 md:h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 md:gap-4 justify-center">
                      <button
                        onClick={handleGenerate}
                        disabled={
                          isGenerating || !selectedImage || !prompt.trim()
                        }
                        className="flex items-center gap-1 md:gap-2 px-4 md:px-8 py-2 md:py-3 bg-gradient-to-r from-gold to-yellow-600 hover:from-yellow-600 hover:to-gold disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:scale-100 text-sm md:text-base"
                      >
                        {isGenerating ? (
                          <>
                            <div className="w-3 md:w-4 h-3 md:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span className="hidden sm:inline">
                              Generating...
                            </span>
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
                        onClick={handleAddImage}
                        className="md:hidden flex items-center gap-1 px-3 py-2 bg-gold/20 hover:bg-gold/30 text-gold font-medium rounded-xl transition-all duration-200 border border-gold/50 hover:border-gold text-sm"
                      >
                        <FiUpload className="w-4 h-4" />
                        <span>Upload</span>
                      </button>

                      <button
                        onClick={() =>
                          downloadImage(
                            selectedForEdit === "generated"
                              ? generatedImage
                              : selectedImage?.url,
                            selectedForEdit === "generated"
                              ? "generated"
                              : selectedImage?.name
                          )
                        }
                        disabled={!selectedImage}
                        className="flex items-center gap-1 md:gap-2 px-3 md:px-6 py-2 md:py-3 bg-gray-700/50 hover:bg-gray-600/50 disabled:bg-gray-800/50 text-white disabled:text-gray-500 font-medium rounded-xl transition-all duration-200 border border-white/10 hover:border-white/20 text-sm md:text-base"
                      >
                        <BiDownload className="w-4 md:w-5 h-4 md:h-5" />
                        <span className="hidden sm:inline">Download</span>
                      </button>
                    </div>

                    {/* Mobile Action Grid - Additional mobile actions */}
                    {selectedImage && (
                      <div className="md:hidden mt-6">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={handleRegenerate}
                            disabled={isGenerating || !prompt.trim()}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-gold/20 hover:bg-gold/30 disabled:bg-gray-700/30 rounded-lg transition-all duration-200 text-gold hover:text-yellow-300 disabled:text-gray-500 font-medium text-sm"
                          >
                            <BiRefresh
                              className={`w-4 h-4 ${
                                isGenerating ? "animate-spin" : ""
                              }`}
                            />
                            <span>Re-generate</span>
                          </button>
                          <button
                            onClick={handleResize}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-all duration-200 text-gray-300 hover:text-white font-medium text-sm"
                          >
                            <RiExpandDiagonalLine className="w-4 h-4" />
                            <span>Resize</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Image Comparison */}
          <div className="flex flex-col rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_30px_90px_rgba(6,8,20,0.55)] h-full">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/60">
                  Comparative View
                </p>
                <h3 className="text-xl font-semibold text-white">
                  Image Comparison
                </h3>
                <p className="text-sm text-white/50">
                  Toggle between versions to choose the active edit target.
                </p>
              </div>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70">
                {selectedForEdit === "generated" ? "Generated" : "Original"}
              </span>
            </div>

            <div className="mb-4 flex gap-2">
              <button
                onClick={() => setSelectedForEdit("original")}
                className={`flex-1 rounded-2xl px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] transition-all duration-200 ${
                  selectedForEdit === "original"
                    ? "bg-gold text-gray-900"
                    : "bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                Original
              </button>
              <button
                onClick={() => setSelectedForEdit("generated")}
                disabled={!generatedImage}
                className={`flex-1 rounded-2xl px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] transition-all duration-200 ${
                  selectedForEdit === "generated"
                    ? "bg-gold text-gray-900"
                    : "bg-white/5 text-white/70 hover:bg-white/10 disabled:bg-transparent disabled:text-white/30"
                }`}
              >
                Generated
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-auto pr-1">
              <div
                className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-200 ${
                  selectedForEdit === "original"
                    ? "border-gold/70 bg-gradient-to-br from-white/5 to-white/[0.02] shadow-[0_20px_60px_rgba(6,8,20,0.35)]"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Original image
                    </p>
                    <p className="text-xs text-white/50">
                      {formatImageMeta(selectedImage)}
                    </p>
                  </div>
                  {selectedForEdit === "original" && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
                      Active
                      <FiCheck className="h-3 w-3" />
                    </span>
                  )}
                </div>
                <div className="relative aspect-[4/3] rounded-xl border border-white/10 bg-black/40 overflow-hidden">
                  {selectedImage ? (
                    <Image
                      src={selectedImage.url}
                      alt="Original comparison preview"
                      fill
                      sizes="100%"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white/30">
                      <HiOutlinePhotograph className="h-10 w-10" />
                    </div>
                  )}
                  {selectedImage && (
                    <div className="absolute left-3 bottom-3 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs text-white/80 backdrop-blur">
                      {selectedImage.name}
                    </div>
                  )}
                </div>
              </div>

              <div
                className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-200 ${
                  selectedForEdit === "generated"
                    ? "border-gold/70 bg-gradient-to-br from-white/5 to-white/[0.02] shadow-[0_20px_60px_rgba(6,8,20,0.35)]"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Generated result
                    </p>
                    <p className="text-xs text-white/50">
                      {generatedImage ? "AI output • PNG" : "Awaiting render"}
                    </p>
                  </div>
                  {selectedForEdit === "generated" && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
                      Active
                      <FiCheck className="h-3 w-3" />
                    </span>
                  )}
                </div>
                <div className="relative aspect-[4/3] rounded-xl border border-white/10 bg-black/40 overflow-hidden">
                  {generatedImage ? (
                    <Image
                      src={generatedImage}
                      alt="Generated comparison preview"
                      fill
                      sizes="100%"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-white/40">
                      <HiOutlineAdjustments className="h-10 w-10" />
                      <p className="text-xs uppercase tracking-[0.4em]">
                        Pending
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {(selectedImage || generatedImage) && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-white/50">
                  Selection summary
                </p>
                <p className="mt-2 text-sm text-white/80">
                  <span className="text-gold font-semibold">
                    Active edit target:
                  </span>{" "}
                  {selectedForEdit === "generated"
                    ? "Generated image"
                    : "Original image"}
                </p>
                {selectedImage && (
                  <p className="mt-1 text-xs text-white/50">
                    Source • {selectedImage.name} (
                    {formatImageMeta(selectedImage)})
                  </p>
                )}
                {generatedImage && (
                  <p className="mt-1 text-xs text-white/50">
                    Output • Latest AI pass
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Gallery Modal */}
      {showMobileGallery && <MobileGalleryModal />}

      {/* Mobile Comparison Modal */}
      {showMobileComparison && <MobileComparisonModal />}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
        multiple
      />

      {/* Message Notification */}
      {showMessage && (
        <div className="fixed top-6 right-6 bg-gray-800 border border-gold/50 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
          {showMessage}
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
      `}</style>
    </div>
  );
}
