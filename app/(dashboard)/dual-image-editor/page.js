"use client";
import Image from "next/image";
import { BiSolidRightArrow } from "react-icons/bi";
import { HiMenu } from "react-icons/hi";
import TitleBar from "../titlebar";
import { useState } from "react";

export default function DualImageEditor() {
  const [prompt, setPrompt] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      setSelectedImages(files);
    }
  };

  const handleGenerate = async () => {
    if (selectedImages.length === 0 || !prompt.trim()) return;

    setIsGenerating(true);
    try {
      const formData = new FormData();
      selectedImages.forEach((image, index) => {
        formData.append(`image_${index}`, image);
      });
      formData.append("prompt", prompt);
      formData.append("batch_size", selectedImages.length.toString());

      const res = await fetch(
        "http://4.194.251.51:8000/create-from-references",
        {
          method: "POST",
          body: formData,
        }
      );

      if (res.ok) {
        const data = await res.json();
        setGeneratedImages(data.images || [data.image_url || data.image]);
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

            <div className="rounded w-10 h-10 p-2 border-2 border-dashed border-gold mt-8 cursor-pointer">
              <Image
                alt="image"
                src="/images/image-icon.svg"
                width={50}
                height={50}
              />
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
          ) : selectedImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 h-full">
              {selectedImages.map((img, index) => (
                <div key={index} className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-white text-sm mb-2">
                      Image {index + 1}
                    </div>
                    <Image
                      src={URL.createObjectURL(img)}
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
            <label className="w-fit bg-gradient-to-r from-gold from-50% to-white/60 to-95% text-white text-sm font-medium px-8 py-2 rounded-full hover:from-white/20 hover:to-gold cursor-pointer transition-all duration-500">
              {selectedImages.length > 0
                ? `Change Images (${selectedImages.length})`
                : "Add Images"}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
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
              isGenerating || selectedImages.length === 0 || !prompt.trim()
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
