"use client";
import Image from "next/image";
import { BiSolidRightArrow, BiDownload, BiRefresh } from "react-icons/bi";
import {
  HiMenu,
  HiOutlinePhotograph,
  HiOutlineAdjustments,
} from "react-icons/hi";
import { MdCompareArrows } from "react-icons/md";
import { FiUpload, FiEdit3, FiCheck } from "react-icons/fi";
import { RiExpandDiagonalLine } from "react-icons/ri";
import TitleBar from "../titlebar";
import { useRef, useState } from "react";
import { apiCall, API_BASE_URL } from "@/utils/apiUtils";

export default function ImageUpdate() {
  const [prompt, setPrompt] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState("original"); // "original" or "generated"
  const [showMessage, setShowMessage] = useState(null);
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

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage = {
            id: Date.now() + Math.random(),
            name: file.name,
            url: e.target.result,
            file: file,
          };
          setUploadedImages((prev) => [...prev, newImage]);
          if (!selectedImage) {
            setSelectedImage(newImage);
            setSelectedForEdit("original");
          }
        };
        reader.readAsDataURL(file);
      }
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
    if (!selectedImage || !prompt.trim()) return;

    setIsGenerating(true);
    try {
      const formData = new FormData();

      // Use the appropriate image based on selection
      const imageToEdit =
        selectedForEdit === "generated" && generatedImage
          ? await fetch(generatedImage).then((r) => r.blob())
          : selectedImage.file;

      formData.append("image", imageToEdit);
      formData.append("prompt", prompt);

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
        }
        displayMessage("Image generated successfully!");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      displayMessage("Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: "#181D28" }}>
      {/* Collapsible Left Sidebar */}
      <div
        className={`${
          sidebarCollapsed ? "w-16" : "w-80"
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
        {/* Title Bar */}
        <div className="p-6 border-b border-white/10">
          <TitleBar />
        </div>

        {/* Central Workspace */}
        <div className="flex-1 flex">
          {/* Prompt Input Area */}
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              {/* Modern Input Box */}
              <div className="mb-8">
                <label className="block text-white font-medium mb-3">
                  Describe your image modifications
                </label>
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe how you want to modify the image... (e.g., 'Add sunglasses to the person', 'Change background to beach', 'Make it more colorful')"
                    className="w-full h-32 px-4 py-3 bg-gray-800/50 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200 resize-none backdrop-blur-sm"
                    disabled={isGenerating}
                  />
                  <div className="absolute bottom-3 right-3">
                    <FiEdit3 className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !selectedImage || !prompt.trim()}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-gold to-yellow-600 hover:from-yellow-600 hover:to-gold disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:scale-100"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <HiOutlineAdjustments className="w-5 h-5" />
                      Generate
                    </>
                  )}
                </button>

                {/* <button
                  onClick={handleResize}
                  disabled={!selectedImage}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 disabled:bg-gray-800/50 text-white disabled:text-gray-500 font-medium rounded-xl transition-all duration-200 border border-white/10 hover:border-white/20"
                >
                  <RiExpandDiagonalLine className="w-5 h-5" />
                  Resize
                </button> */}

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
                  className="flex items-center gap-2 px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 disabled:bg-gray-800/50 text-white disabled:text-gray-500 font-medium rounded-xl transition-all duration-200 border border-white/10 hover:border-white/20"
                >
                  <BiDownload className="w-5 h-5" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Image Comparison */}
      <div className="w-96 bg-gray-800/30 backdrop-blur-sm border-l border-white/10 p-6">
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
