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

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
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
          {generatedImage ? (
            <Image
              src={generatedImage}
              alt="Generated image"
              width={500}
              height={500}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
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
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleGenerate()}
            placeholder="Prompt"
            className="text-white px-10 py-4 outline-none bg-dark-blue border border-white/50 rounded-full w-full h-fit focus:border-white transition-all"
          />
        </div>
      </div>
    </div>
  );
}
