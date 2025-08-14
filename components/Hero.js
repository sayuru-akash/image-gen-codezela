"use client";
import { useEffect } from "react";

export default function Hero() {
  useEffect(() => {
    function handleParallaxScroll() {
      const scrollY = window.scrollY;
      const image1 = document.getElementById("image1");
      const image2 = document.getElementById("image2");
      const image3 = document.getElementById("image3");
      const image4 = document.getElementById("image4");

      // Define movement multipliers for each direction
      const parallaxSpeed = 0.5;

      if (image1) {
        // Image 1: Move up and left
        image1.style.transform = `translate(${
          scrollY * -parallaxSpeed * 0.3
        }px, ${scrollY * -parallaxSpeed}px) rotate(0deg)`;
      }
      if (image2) {
        // Image 2: Move up and right
        image2.style.transform = `translate(${
          scrollY * parallaxSpeed * 0.3
        }px, ${scrollY * -parallaxSpeed}px) rotate(0deg)`;
      }
      if (image3) {
        // Image 3: Move to top left (up and left)
        image3.style.transform = `translate(${
          scrollY * -parallaxSpeed * 0.6
        }px, ${scrollY * -parallaxSpeed * 1.2}px) rotate(20deg)`;
      }
      if (image4) {
        // Image 4: Move to top right (up and right)
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

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div
        id="image1"
        className="parallax-element hidden lg:block absolute w-56 h-72 bg-transparent backdrop-blur-xs p-3 rounded-2xl shadow-2xl border border-white/30 -rotate-[20deg] left-28"
      >
        <div className="bg-[url(/images/image-1.png)] bg-center bg-cover rounded-xl w-full h-full"></div>
      </div>

      {/* Image 2 - Top Right */}
      <div
        id="image2"
        className="parallax-element hidden lg:block absolute w-72 h-72 bg-transparent backdrop-blur-xs p-3 rounded-2xl shadow-2xl border border-white/30 rotate-[20deg] right-15"
      >
        <div className="bg-[url(/images/image-2.jpg)] bg-center bg-cover rounded-xl w-full h-full"></div>
      </div>

      {/* Image 3 - Bottom Left (moves to top left when scrolling) */}
      <div
        id="image3"
        className="parallax-element hidden lg:block absolute w-48 h-48 bg-transparent backdrop-blur-xs p-3 rounded-2xl shadow-2xl border border-white/30 rotate-[20deg] left-28 -bottom-120 z-5"
      >
        <div className="bg-[url(/images/image-3.jpg)] bg-center bg-cover rounded-xl w-full h-full"></div>
      </div>

      {/* Image 4 - Bottom Right (moves to top right when scrolling) */}
      <div
        id="image4"
        className="parallax-element hidden lg:block absolute w-40 h-56 bg-transparent backdrop-blur-xs p-3 rounded-2xl shadow-2xl border border-white/30 -rotate-[20deg] right-20 -bottom-150 z-5"
      >
        <div className="bg-[url(/images/image-4.jpg)] bg-center bg-cover rounded-xl w-full h-full"></div>
      </div>

      {/* Main Image */}
      <div className="z-50 bg-transparent backdrop-blur-xs rounded-4xl p-2 mx-auto md:p-6 w-11/12 md:w-7/12 h-72 md:h-[40rem] shadow-2xl border border-white/30">
        <div className="bg-[url(/images/hero-img.jpg)] bg-center bg-cover rounded-3xl w-full h-full"></div>
      </div>
    </>
  );
}
