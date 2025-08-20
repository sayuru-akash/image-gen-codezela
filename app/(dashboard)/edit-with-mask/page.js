"use client";
import Image from "next/image";
import { BiSolidRightArrow } from "react-icons/bi";
import { HiMenu } from "react-icons/hi";
import TitleBar from "../titlebar";
import { useRef, useState } from "react";

export default function EditwithMask() {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
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

        <div className="flex-grow h-3/4 bg-gray-800 mt-6 rounded-lg flex items-center justify-center overflow-hidden">
          {selectedImage ? (
            <div className="w-full h-full p-4 flex flex-col items-center justify-center">
              <div className="relative w-full h-full max-h-[calc(100%-3rem)]">
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.name}
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
              <p className="text-white text-center mt-4 text-sm shrink-0">
                {selectedImage.name}
              </p>
            </div>
          ) : (
            <div className="text-white/60 text-center">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto mb-4 opacity-40"
              >
                <path
                  d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
                  fill="currentColor"
                />
              </svg>
              <p>Upload an image to get started</p>
            </div>
          )}
        </div>

        <div className="absolute flex justify-between p-2 bottom-5 left-14 right-14 bg-dark-blue border border-white/50 rounded-full h-fit">
          <div className="flex gap-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
            <button
              onClick={handleAddImage}
              className="w-fit bg-gradient-to-r from-gold from-50% to-white/60 to-95% text-white text-sm font-medium px-8 py-2 rounded-full hover:from-white/20 hover:to-gold cursor-pointer transition-all duration-500"
            >
              Add Image
            </button>
            <div className="bg-white w-0.5 h-full"></div>
            <input
              placeholder="Value"
              className="text-white outline-none transition-all"
            />
          </div>

          <button className="w-fit bg-gradient-to-r from-gold from-50% to-white/60 to-95% text-white text-sm font-medium px-8 py-2 rounded-full hover:from-white/20 hover:to-gold cursor-pointer transition-all duration-500">
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}
