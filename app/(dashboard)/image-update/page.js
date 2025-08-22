"use client";
import Image from "next/image";
import { BiSolidRightArrow } from "react-icons/bi";
import { HiMenu } from "react-icons/hi";
import TitleBar from "../titlebar";
import { useRef, useState } from "react";

export default function ImageUpdate() {
  const [prompt, setPrompt] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const fileInputRef = useRef(null);

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
  };

  const removeImage = (imageId, event) => {
    event.stopPropagation();
    setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
    if (selectedImage && selectedImage.id === imageId) {
      setSelectedImage(null);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage || !prompt.trim()) return;

    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedImage.file);
      formData.append("prompt", prompt);

      const res = await fetch("http://4.194.251.51:8000/edit-image", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedImage(data.image_url || data.image);
      }
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 h-screen bg-foundation-blue">
      <div className="col-span-1 p-4">
        <div className="relative px-4 py-8 flex flex-col bg-dark-blue border border-white/50 rounded-2xl h-full w-20">
          <div className="absolute -right-4 top-18 flex justify-center items-center w-8 h-8 bg-gradient-to-r from-gold from-50% to-white/60 to-95% text-white rounded-full hover:from-white/20 hover:to-gold cursor-pointer transition-all duration-500">
            <BiSolidRightArrow className="w-3 h-3 text-white" />
          </div>

          <div className="grid justify-items-center w-fit mx-auto">
            <div className="bg-white rounded w-6 h-6 flex items-center mb-8">
              <HiMenu className="w-6 h-6 text-dark-blue" />
            </div>

            <button onClick={handleAddImage}>
              <div className="rounded w-10 h-10 p-2 border-2 border-dashed border-gold mt-8 cursor-pointer">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Image
                  alt="image"
                  src="/images/image-icon.svg"
                  width={50}
                  height={50}
                />
              </div>
            </button>

            {/* Uploaded images */}
            <div className="mt-6 space-y-3 max-h-96 overflow-y-auto w-full">
              {uploadedImages.map((image) => (
                <div
                  key={image.id}
                  className={`relative group rounded-lg w-12 h-12 cursor-pointer border-2 transition-all duration-200 ${
                    selectedImage?.id === image.id
                      ? "border-yellow-500"
                      : "border-white/30 hover:border-yellow-500/60"
                  }`}
                  onClick={() => handleImageClick(image)}
                >
                  <Image
                    src={image.url}
                    alt={image.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover rounded-md"
                  />
                  <button
                    onClick={(e) => removeImage(image.id, e)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative col-span-11 py-5 px-14">
        <TitleBar />
        <div className="flex-grow h-9/12 bg-gray-800 mt-6 rounded-lg flex items-center justify-center">
          {generatedImage ? (
            <Image
              src={generatedImage}
              alt="Generated image"
              width={500}
              height={500}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          ) : selectedImage ? (
            <Image
              src={selectedImage.url}
              alt="Selected image"
              width={500}
              height={500}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          ) : (
            <div className="text-white/60 text-center">
              <div className="text-xl mb-2">Select an image to update</div>
              <div className="text-sm">
                Upload an image and enter a prompt to modify it
              </div>
            </div>
          )}
        </div>

        <div className="absolute flex justify-between p-2 bottom-5 left-14 right-14 bg-dark-blue border border-white/50 rounded-full h-fit">
          <div className="flex gap-4">
            <button
              onClick={handleAddImage}
              className="w-fit bg-gradient-to-r from-gold from-50% to-white/60 to-95% text-white text-sm font-medium px-8 py-2 rounded-full hover:from-white/20 hover:to-gold cursor-pointer transition-all duration-500"
            >
              {selectedImage ? "Change Image" : "Add Image"}
            </button>
            <div className="bg-white w-0.5 h-full"></div>
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Value"
              className="text-white outline-none transition-all bg-transparent flex-1"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedImage || !prompt.trim()}
            className="w-fit bg-gradient-to-r from-gold from-50% to-white/60 to-95% text-white text-sm font-medium px-8 py-2 rounded-full hover:from-white/20 hover:to-gold cursor-pointer transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
}
