"use client";
import Image from "next/image";
import { useState } from "react";

export default function BlogCard({
  onViewBlog,
  image1,
  image2,
  title,
  body,
  date,
  author,
}) {
  const [isHovered, setIsHovered] = useState(false);

  const handleView = () => {
    onViewBlog?.();
  };

  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleView}
    >
      <div className="border border-gray-600 p-1 rounded-3xl h-96 bg-gray-900">
        <div className="relative h-48 rounded-t-[1.4rem] overflow-hidden">
          <Image
            src={image1}
            width={500}
            height={500}
            alt={title}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              isHovered ? "opacity-0" : "opacity-100"
            }`}
          />
          <Image
            src={image2}
            width={500}
            height={500}
            alt={`${title} hover`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>

        <div className="p-4">
          <p className="text-lg font-semibold text-white mb-2">{title}</p>
          <p className="text-off-white text-sm py-2 leading-relaxed line-clamp-3 overflow-y-auto scrollbar-hide">
            {body}
          </p>
          <div className="flex gap-4 text-gray-400 text-xs mt-4">
            <p>• {date}</p>
            <p>• {author}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
