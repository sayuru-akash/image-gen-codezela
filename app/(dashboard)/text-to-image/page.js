"use client";
import Image from "next/image";
import TitleBar from "../titlebar";
import { BiSolidRightArrow } from "react-icons/bi";
import { HiMenu } from "react-icons/hi";
import { useState } from "react";

export default function TexttoImage() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement("a");
      link.href = generatedImage;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch("http://4.194.251.51:8000/im-gen", {
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

        // Handle different response formats
        if (data.image_url) {
          // If GCS upload was successful
          console.log("Using image_url:", data.image_url);
          setGeneratedImage(data.image_url);
        } else if (data.image) {
          // If we have a direct image (could be base64 or URL)
          console.log("Found data.image, length:", data.image.length);
          if (data.image.startsWith("data:image/")) {
            // Already a data URL
            console.log("Using data URL as-is");
            setGeneratedImage(data.image);
          } else if (data.image.length > 1000) {
            // Likely base64 string, convert to data URL
            console.log("Converting base64 to data URL");
            setGeneratedImage(`data:image/png;base64,${data.image}`);
          } else {
            // Regular URL
            console.log("Using as regular URL");
            setGeneratedImage(data.image);
          }
        } else if (data.base64_image) {
          // If backend returns base64_image field
          console.log("Using base64_image field");
          setGeneratedImage(`data:image/png;base64,${data.base64_image}`);
        } else if (data.generated_images && data.generated_images.length > 0) {
          // If backend returns array of images
          console.log("Using first image from generated_images array");
          const firstImage = data.generated_images[0];
          if (firstImage.startsWith("data:image/")) {
            setGeneratedImage(firstImage);
          } else {
            setGeneratedImage(`data:image/png;base64,${firstImage}`);
          }
        } else {
          console.log("No image data found in response");
          setError("No image data received from server");
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
        <div className="flex-grow h-9/12 bg-gray-800 mt-6 rounded-lg flex items-center justify-center">
          {error ? (
            <div className="text-red-400 text-center p-4">
              <div className="text-lg mb-2">Error</div>
              <div className="text-sm">{error}</div>
            </div>
          ) : generatedImage ? (
            <div className="relative">
              <Image
                src={generatedImage}
                alt="Generated image"
                width={500}
                height={500}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <button
                onClick={downloadImage}
                className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white px-3 py-1 rounded text-sm"
              >
                Download
              </button>
            </div>
          ) : (
            <div className="text-white/60 text-center">
              <div className="text-xl mb-2">
                Generated image will appear here
              </div>
              <div className="text-sm">Enter a prompt and click Generate</div>
            </div>
          )}
        </div>

        <div className="absolute bottom-5 left-14 right-14">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="absolute right-3 top-2.5 w-fit bg-gradient-to-r from-gold from-50% to-white/60 to-95% text-white text-sm font-medium px-8 py-2 rounded-full hover:from-white/20 hover:to-gold cursor-pointer transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? "Generating..." : "Generate"}
          </button>
          <input
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              setError(null); // Clear error when user types
            }}
            onKeyPress={(e) => e.key === "Enter" && handleGenerate()}
            placeholder="Prompt"
            className="text-white px-10 py-4 outline-none bg-dark-blue border border-white/50 rounded-full w-full h-fit focus:border-white transition-all"
          />
        </div>
      </div>
    </div>
  );
}
