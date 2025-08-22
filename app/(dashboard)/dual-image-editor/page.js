"use client";
import Image from "next/image";
import { BiSolidRightArrow } from "react-icons/bi";
import { HiMenu } from "react-icons/hi";
import TitleBar from "../titlebar";
import { useRef, useState } from "react";

export default function DualImageEditor() {
  const [prompt, setPrompt] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
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
    if (uploadedImages.length === 0 || !prompt.trim()) return;

    setIsGenerating(true);
    try {
      const formData = new FormData();
      uploadedImages.forEach((image, index) => {
        formData.append(`image_${index}`, image.file);
      });
      formData.append("prompt", prompt);
      formData.append("batch_size", uploadedImages.length.toString());

      const res = await fetch(
        "http://4.194.251.51:8000/create-from-references",
        {
          method: "POST",
          body: formData,
        }
      );

      if (res.ok) {
        const data = await res.json();
        console.log("Backend response:", data);

        // Handle different response formats
        let imagesToSet = [];

        if (data.images) {
          // If we have an array of images
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
          // Single image URL
          imagesToSet = [data.image_url];
        } else if (data.image) {
          // Single image (base64 or URL)
          if (data.image.startsWith("data:image/")) {
            imagesToSet = [data.image];
          } else if (data.image.length > 1000) {
            imagesToSet = [`data:image/png;base64,${data.image}`];
          } else {
            imagesToSet = [data.image];
          }
        } else if (data.base64_image) {
          // Single base64 image
          imagesToSet = [`data:image/png;base64,${data.base64_image}`];
        } else if (data.generated_images && data.generated_images.length > 0) {
          // Array of generated images
          imagesToSet = data.generated_images.map((img) => {
            if (img.startsWith("data:image/")) {
              return img;
            } else {
              return `data:image/png;base64,${img}`;
            }
          });
        }

        setGeneratedImages(imagesToSet);
      }
    } catch (error) {
      console.error("Error generating images:", error);
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
                  multiple
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
        <div className="flex-grow h-9/12 bg-gray-800 mt-6 rounded-lg p-4 overflow-auto">
          {generatedImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 h-full">
              {generatedImages.map((img, index) => (
                <div key={index} className="flex items-center justify-center">
                  <Image
                    src={img}
                    alt={`Generated image ${index + 1}`}
                    width={400}
                    height={400}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                </div>
              ))}
            </div>
          ) : uploadedImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 h-full">
              {uploadedImages.map((img, index) => (
                <div key={index} className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-white text-sm mb-2">
                      Image {index + 1}
                    </div>
                    <Image
                      src={img.url}
                      alt={`Selected image ${index + 1}`}
                      width={400}
                      height={400}
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-white/60 text-center flex items-center justify-center h-full">
              <div>
                <div className="text-xl mb-2">
                  Select multiple images for batch processing
                </div>
                <div className="text-sm">
                  Upload multiple images and enter a prompt to process them all
                </div>
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
              {uploadedImages.length > 0
                ? `Change Images (${uploadedImages.length})`
                : "Add Images"}
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
            disabled={
              isGenerating || uploadedImages.length === 0 || !prompt.trim()
            }
            className="w-fit bg-gradient-to-r from-gold from-50% to-white/60 to-95% text-white text-sm font-medium px-8 py-2 rounded-full hover:from-white/20 hover:to-gold cursor-pointer transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
}
