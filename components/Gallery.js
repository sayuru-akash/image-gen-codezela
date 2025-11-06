"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

const GALLERY_LAYOUT = [
  {
    wrapperClass: "grid grid-cols-1 gap-3 md:grid-cols-4",
    items: [
      {
        src: "/images/image-15.jpg",
        alt: "AI generated fashion editorial scene",
        className: "h-72",
      },
      {
        src: "/images/image-9.jpg",
        alt: "AI generated neon portrait",
        className: "h-72",
      },
      {
        src: "/images/image-11.jpg",
        alt: "AI generated urban skyline artwork",
        className: "h-72 md:col-span-2",
      },
    ],
  },
  {
    wrapperClass: "grid grid-cols-1 gap-3 md:grid-cols-3",
    items: [
      {
        src: "/images/image-16.jpg",
        alt: "AI generated product flat lay",
        className: "h-110",
      },
      {
        isNested: true,
        className: "grid gap-3",
        items: [
          {
            src: "/images/image-17.jpg",
            alt: "AI generated cinematic landscape",
            className: "h-53",
          },
          {
            src: "/images/image-18.jpg",
            alt: "AI generated architectural concept",
            className: "h-53",
          },
        ],
      },
      {
        src: "/images/image-19.jpg",
        alt: "AI generated abstract textures",
        className: "h-110",
      },
    ],
  },
  {
    wrapperClass: "grid grid-cols-1 gap-3 md:grid-cols-4",
    items: [
      {
        src: "/images/image-14.jpg",
        alt: "AI generated campaign mood board",
        className: "h-72 md:col-span-2",
      },
      {
        src: "/images/image-20.jpg",
        alt: "AI generated desert landscape",
        className: "h-72",
      },
      {
        src: "/images/image-12.jpg",
        alt: "AI generated lifestyle photography",
        className: "h-72",
      },
    ],
  },
];

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!selectedImage) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSelectedImage(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImage]);

  const galleryGroups = useMemo(() => GALLERY_LAYOUT, []);

  const openImage = (item) => {
    setSelectedImage(item);
    setIsLoaded(false);
  };

  const renderImageButton = (item) => (
    <button
      key={item.src}
      type="button"
      onClick={() => openImage(item)}
      className={`group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 ${item.className}`}
      aria-label={`View ${item.alt}`}
    >
      <Image
        src={item.src}
        alt={item.alt}
        fill
        sizes="(min-width: 1024px) 25vw, 90vw"
        className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
        priority={item.priority}
      />
    </button>
  );

  return (
    <>
      <div className="grid gap-3">
        {galleryGroups.map((section, index) => (
          <div key={index} className={section.wrapperClass}>
            {section.items.map((item) =>
              item.isNested ? (
                <div key={item.className} className={item.className}>
                  {item.items.map((nested) => renderImageButton(nested))}
                </div>
              ) : (
                renderImageButton(item)
              )
            )}
          </div>
        ))}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#05070d]/80 backdrop-blur-xl px-4"
          role="dialog"
          aria-modal="true"
          aria-label={selectedImage.alt}
        >
          <div
            className="absolute inset-0 -z-10 opacity-40 transition-opacity duration-300"
            style={{
              backgroundImage: `url(${selectedImage.src})`,
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              filter: "blur(40px)",
            }}
          />
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/[0.08] text-white transition-all duration-300 hover:border-gold/70 hover:bg-gold/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
            aria-label="Close image preview"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative flex w-full max-w-4xl flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-black/70 shadow-[0_40px_120px_rgba(5,7,13,0.75)]">
            {!isLoaded && (
              <div className="flex h-[60vh] min-h-[320px] w-full items-center justify-center bg-white/[0.03] text-sm uppercase tracking-[0.4em] text-white/60">
                Loading…
              </div>
            )}
            <Image
              src={selectedImage.src}
              alt={selectedImage.alt}
              width={1600}
              height={900}
              className={`max-h-[80vh] w-full object-contain transition-opacity duration-300 ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoadingComplete={() => setIsLoaded(true)}
              priority
            />
            <p className="px-6 py-5 text-center text-sm text-white/70">
              {selectedImage.alt}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
