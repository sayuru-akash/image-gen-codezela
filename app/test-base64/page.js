"use client";
import Image from "next/image";
import { useState } from "react";

// This is a test page to verify base64 image handling
export default function TestBase64() {
  const [testImage, setTestImage] = useState(null);

  // Sample base64 image (1x1 red pixel)
  const sampleBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAFJ7Fz+LgAAAABJRU5ErkJggg==";

  const testBase64Image = () => {
    const dataUrl = `data:image/png;base64,${sampleBase64}`;
    setTestImage(dataUrl);
  };

  const testWithLongBase64 = () => {
    // Simulate a long base64 string like from your backend
    const longBase64 = sampleBase64.repeat(100); // Just for testing
    const dataUrl = `data:image/png;base64,${longBase64}`;
    setTestImage(dataUrl);
  };

  const clearImage = () => {
    setTestImage(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-white text-3xl mb-8">Base64 Image Test</h1>

        <div className="mb-8 space-x-4">
          <button
            onClick={testBase64Image}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Test Base64 Image
          </button>
          <button
            onClick={testWithLongBase64}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Test Long Base64
          </button>
          <button
            onClick={clearImage}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Clear Image
          </button>
        </div>

        <div className="bg-gray-800 p-8 rounded-lg">
          {testImage ? (
            <div>
              <p className="text-white mb-4">Image loaded successfully!</p>
              <p className="text-gray-400 text-sm mb-4">
                Data URL length: {testImage.length} characters
              </p>
              <Image
                src={testImage}
                alt="Test image"
                width={100}
                height={100}
                className="border border-gray-600"
              />
            </div>
          ) : (
            <p className="text-gray-400">No image loaded</p>
          )}
        </div>
      </div>
    </div>
  );
}
