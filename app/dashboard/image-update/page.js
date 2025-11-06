"use client";
import Image from "next/image";
import { BiSolidRightArrow, BiDownload, BiRefresh } from "react-icons/bi";
import {
  HiMenu,
  HiOutlinePhotograph,
  HiOutlineAdjustments,
  HiX,
} from "react-icons/hi";
import { MdCompareArrows } from "react-icons/md";
import { FiUpload, FiEdit3, FiCheck } from "react-icons/fi";
import { RiExpandDiagonalLine } from "react-icons/ri";
import TitleBar from "@/components/dashboard/TitleBar";
import { useRef, useState, useEffect } from "react";
import { apiCall, API_BASE_URL } from "@/utils/apiUtils";

export default function ImageUpdate() {
  const [prompt, setPrompt] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Start collapsed by default
  const [selectedForEdit, setSelectedForEdit] = useState("original"); // "original" or "generated"
  const [showMessage, setShowMessage] = useState(null);
  const [showMobileGallery, setShowMobileGallery] = useState(false);
  const [showMobileComparison, setShowMobileComparison] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleAddImage = () => {
    fileInputRef.current?.click();
    // Auto-close sidebar on mobile when upload is triggered
    if (window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
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
    // Auto-close sidebar on mobile when image is selected
    if (window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
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
              <h2 className="text-white font-semibold text-lg">Gallery</h2>
              <p className="text-gray-400 text-sm">Uploaded & Generated</p>
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
            onClick={handleAddImage}
            className={`${
              sidebarCollapsed ? "w-8 h-8 p-1" : "w-full py-3 px-4"
            } mb-6 bg-gradient-to-r from-gold/20 to-yellow-600/20 hover:from-gold/30 hover:to-yellow-600/30 border-2 border-dashed border-gold/50 hover:border-gold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group`}
          >
            <FiUpload className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
            {!sidebarCollapsed && (
              <span className="text-gold font-medium">Upload Image</span>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </button>

          {/* Image Thumbnails */}
          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
            {uploadedImages.map((image) => (
              <div
                key={image.id}
                className={`relative group cursor-pointer transition-all duration-200 ${
                  sidebarCollapsed ? "w-8 h-8" : "w-full h-20"
                }`}
                onClick={() => handleImageClick(image)}
              >
                <div
                  className={`${
                    selectedImage?.id === image.id
                      ? "ring-2 ring-gold shadow-lg shadow-gold/20"
                      : "ring-1 ring-white/20 hover:ring-gold/50"
                  } rounded-lg overflow-hidden transition-all duration-200 ${
                    sidebarCollapsed ? "w-8 h-8" : "w-full h-20"
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={image.name}
                    width={sidebarCollapsed ? 32 : 320}
                    height={sidebarCollapsed ? 32 : 80}
                    className="w-full h-full object-cover"
                  />
                </div>

                {!sidebarCollapsed && (
                  <>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 rounded-lg" />
                    <button
                      onClick={(e) => removeImage(image.id, e)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center shadow-lg"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-1 left-1 right-1">
                      <div className="bg-black/70 backdrop-blur-sm rounded px-2 py-1">
                        <p className="text-white text-xs truncate">
                          {image.name}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}

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
          {!sidebarCollapsed && selectedImage && (
            <div className="border-t border-white/10 pt-4 mt-4 space-y-2">
              <p className="text-gray-400 text-sm font-medium mb-3">
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
                disabled={isGenerating || !prompt.trim()}
                className="w-full flex items-center gap-3 px-3 py-2 bg-gold/20 hover:bg-gold/30 disabled:bg-gray-700/30 rounded-lg transition-all duration-200 text-gold hover:text-yellow-300 disabled:text-gray-500"
              >
                <BiRefresh
                  className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`}
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
                      <h3 className="text-white font-medium">Selected Image</h3>
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
                            onClick={() => setSelectedForEdit("generated")}
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
                          selectedForEdit === "generated" && generatedImage
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
                  disabled={isGenerating || !selectedImage || !prompt.trim()}
                  className="flex items-center gap-1 md:gap-2 px-4 md:px-8 py-2 md:py-3 bg-gradient-to-r from-gold to-yellow-600 hover:from-yellow-600 hover:to-gold disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:scale-100 text-sm md:text-base"
                >
                  {isGenerating ? (
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
          {selectedImage && generatedImage && (
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
