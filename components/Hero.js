"use client";
import { useEffect } from "react";
import Image from "next/image";

export default function Hero() {
  useEffect(() => {
    const image1 = document.getElementById("image1");
    const image2 = document.getElementById("image2");
    const image3 = document.getElementById("image3");
    const image4 = document.getElementById("image4");

    function handleParallaxScroll() {
      const scrollY = window.scrollY;

      const parallaxSpeed = 0.5;

      if (image1) {
        image1.style.transform = `translate(${
          scrollY * -parallaxSpeed * 0.3
        }px, ${scrollY * -parallaxSpeed}px) rotate(0deg)`;
      }
      if (image2) {
        image2.style.transform = `translate(${
          scrollY * parallaxSpeed * 0.3
        }px, ${scrollY * -parallaxSpeed}px) rotate(0deg)`;
      }
      if (image3) {
        image3.style.transform = `translate(${
          scrollY * -parallaxSpeed * 0.6
        }px, ${scrollY * -parallaxSpeed * 1.2}px) rotate(20deg)`;
      }
      if (image4) {
        image4.style.transform = `translate(${
          scrollY * parallaxSpeed * 0.6
        }px, ${scrollY * -parallaxSpeed * 1.2}px) rotate(-20deg)`;
      }
    }

    let ticking = false;
    function requestTick() {
      if (!ticking) {
        requestAnimationFrame(handleParallaxScroll);
        ticking = true;
      }
    }

    function handleScroll() {
      ticking = false;
      requestTick();
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative overflow-hidden pt-60">
      <div
        id="image1"
        className="parallax-element hidden lg:block absolute w-56 h-72 bg-transparent backdrop-blur-xs p-3 rounded-2xl shadow-2xl border border-white/30 -rotate-[20deg] left-28 will-change-transform"
      >
        <div className="relative w-full h-full">
          <Image
            alt="AI generated portrait on purple gradient background"
            src="/images/image-1.png"
            fill
            className="rounded-xl object-cover"
            sizes="(min-width: 1024px) 14rem, 0"
            priority
          />
        </div>
      </div>

      {/* Image 2 - Top Right */}
      <div
        id="image2"
        className="parallax-element hidden lg:block absolute w-72 h-72 bg-transparent backdrop-blur-xs p-3 rounded-2xl shadow-2xl border border-white/30 rotate-[20deg] right-15 will-change-transform"
      >
        <div className="relative w-full h-full">
          <Image
            alt="Creative illustration of a fashion model"
            src="/images/image-2.jpg"
            fill
            className="rounded-xl object-cover"
            sizes="(min-width: 1024px) 16rem, 0"
            priority
            quality={65}
          />
        </div>
      </div>

      {/* Image 3 - Bottom Left (moves to top left when scrolling) */}
      <div
        id="image3"
        className="parallax-element hidden lg:block absolute w-48 h-48 bg-transparent backdrop-blur-xs p-3 rounded-2xl shadow-2xl border border-white/30 rotate-[20deg] left-28 -bottom-40 z-5 will-change-transform"
      >
        <div className="relative w-full h-full">
          <Image
            alt="Futuristic neon city created by AI"
            src="/images/image-3.jpg"
            fill
            className="rounded-xl object-cover"
            sizes="(min-width: 1024px) 10rem, 0"
            quality={65}
            priority
          />
        </div>
      </div>

      {/* Image 4 - Bottom Right (moves to top right when scrolling) */}
      <div
        id="image4"
        className="parallax-element hidden lg:block absolute w-40 h-56 bg-transparent backdrop-blur-xs p-3 rounded-2xl shadow-2xl border border-white/30 -rotate-[20deg] right-20 -bottom-40 z-5 will-change-transform"
      >
        <div className="relative w-full h-full">
          <Image
            alt="Colorful AI generated abstract art"
            src="/images/image-4.jpg"
            fill
            className="rounded-xl object-cover"
            sizes="(min-width: 1024px) 134px, 0"
            quality={70}
            priority
          />
        </div>
      </div>

      {/* Main Image */}
      <div className="z-50 bg-transparent backdrop-blur-xs rounded-4xl p-2 mx-auto lg:p-6 w-11/12 lg:w-7/12 h-72 md:h-[40rem] shadow-2xl border border-white/30">
        <div className="relative w-full h-full">
          <Image
            alt="AI-generated gallery showcasing kAIro AI capabilities"
            src="/images/hero-img.jpg"
            fill
            className="rounded-3xl object-cover"
            sizes="(min-width: 1024px) 58vw, 92vw"
            priority
            fetchPriority="high"
            quality={75}
          />
        </div>
      </div>
    </div>
  );
}
