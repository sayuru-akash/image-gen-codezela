"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MdOutlineArrowLeft, MdOutlineArrowRight } from "react-icons/md";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

const videos = [
  {
    id: 1,
    src: "/videos/mvideo4.mp4",
  },
  {
    id: 2,
    src: "/videos/mvideo1.mp4",
  },
  {
    id: 3,
    src: "/videos/mvideo2.mp4",
  },
  {
    id: 4,
    src: "/videos/mvideo.mp4",
  },
];

export default function VideoShowcase() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    skipSnaps: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState({});
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const videoRefs = useRef({});
  const autoplayRef = useRef(null);

  // Detect user interaction to enable sound
  useEffect(() => {
    const handleUserInteraction = () => {
      setHasUserInteracted(true);
      // Remove listeners after first interaction
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
    };

    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("keydown", handleUserInteraction);
    document.addEventListener("touchstart", handleUserInteraction);

    return () => {
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
    };
  }, []);

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      window.clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  const startAutoplay = useCallback(() => {
    if (autoplayRef.current) return;
    autoplayRef.current = window.setInterval(() => {
      emblaApi?.scrollNext();
    }, 8000);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return undefined;

    const onSelect = () => {
      const newIndex = emblaApi.selectedScrollSnap();
      setSelectedIndex(newIndex);

      // Pause all videos first
      Object.values(videoRefs.current).forEach((video) => {
        if (video) {
          video.pause();
          // Mute all videos when pausing
          video.muted = true;
        }
      });
      setIsPlaying({});

      // Auto-play the currently selected video
      const currentVideoId = videos[newIndex]?.id;
      if (currentVideoId && videoRefs.current[currentVideoId]) {
        const currentVideo = videoRefs.current[currentVideoId];
        // Enable sound only if user has interacted
        currentVideo.muted = !hasUserInteracted;
        currentVideo.play().catch(() => {
          // Handle autoplay failure (browser restrictions)
          console.log("Autoplay prevented by browser");
        });
        setIsPlaying({ [currentVideoId]: true });
      }
    };

    emblaApi.on("select", onSelect);
    onSelect();

    startAutoplay();
    emblaApi.on("pointerDown", stopAutoplay);

    return () => {
      stopAutoplay();
      emblaApi.off("select", onSelect);
      emblaApi.off("pointerDown", stopAutoplay);
    };
  }, [emblaApi, startAutoplay, stopAutoplay, hasUserInteracted]);

  // Auto-play first video on component mount
  useEffect(() => {
    const firstVideoId = videos[0]?.id;
    if (firstVideoId && videoRefs.current[firstVideoId]) {
      const firstVideo = videoRefs.current[firstVideoId];
      // Start muted initially, will enable sound on user interaction
      firstVideo.muted = true;
      firstVideo.play().catch(() => {
        // Handle autoplay failure (browser restrictions)
        console.log("Initial autoplay prevented by browser");
      });
      setIsPlaying({ [firstVideoId]: true });
    }
  }, []);

  const scrollPrev = useCallback(() => {
    stopAutoplay();
    emblaApi?.scrollPrev();
    setTimeout(startAutoplay, 100);
  }, [emblaApi, startAutoplay, stopAutoplay]);

  const scrollNext = useCallback(() => {
    stopAutoplay();
    emblaApi?.scrollNext();
    setTimeout(startAutoplay, 100);
  }, [emblaApi, startAutoplay, stopAutoplay]);

  const scrollTo = useCallback(
    (index) => {
      stopAutoplay();
      emblaApi?.scrollTo(index);
      setTimeout(startAutoplay, 100);
    },
    [emblaApi, startAutoplay, stopAutoplay]
  );

  const togglePlayPause = (videoId) => {
    const video = videoRefs.current[videoId];
    if (!video) return;

    if (isPlaying[videoId]) {
      video.pause();
      setIsPlaying((prev) => ({ ...prev, [videoId]: false }));
    } else {
      // Enable sound when user manually plays
      video.muted = false;
      setHasUserInteracted(true);
      video.play();
      setIsPlaying((prev) => ({ ...prev, [videoId]: true }));
    }
  };

  return (
    <section className="relative overflow-hidden px-4 py-8 md:px-10 lg:px-20 lg:py-12">
      {/* Decorative background elements */}
      <div className="absolute left-0 top-20 h-[500px] w-[500px] rounded-full bg-gold/5 blur-[120px]" />
      <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-secondary-accent/10 blur-[100px]" />

      <div className="relative z-10">
        {/* Header */}
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-gold/80">
            See kAIro in Action
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
            Transform Your Creative Workflow with{" "}
            <span className="bg-gradient-to-r from-gold to-white bg-clip-text text-transparent">
              AI Intelligence
            </span>
          </h2>
          <p className="mt-4 text-sm text-white/70 md:text-base">
            Watch how leading teams leverage kAIro AI to accelerate ideation,
            streamline production, and deliver exceptional visual experiences at
            enterprise scale.
          </p>
        </div>

        {/* Video Carousel */}
        <div className="relative mt-8 lg:mt-12">
          {/* Navigation Buttons */}
          <div className="absolute -top-14 right-0 z-20 hidden gap-2 md:flex">
            <button
              type="button"
              onClick={scrollPrev}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gold bg-gradient-to-r from-gold/30 to-white/30 text-white transition-all duration-300 hover:from-gold/60 hover:to-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
              aria-label="Previous video"
            >
              <MdOutlineArrowLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gold bg-gradient-to-r from-gold/30 to-white/30 text-white transition-all duration-300 hover:from-gold/60 hover:to-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
              aria-label="Next video"
            >
              <MdOutlineArrowRight className="h-5 w-5" />
            </button>
          </div>

          {/* Embla Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="flex-[0_0_100%] px-4 md:flex-[0_0_85%] lg:flex-[0_0_75%] xl:flex-[0_0_65%]"
                >
                  <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-secondary-accent/10 p-1 backdrop-blur-sm transition-all duration-500 hover:border-gold/40 hover:shadow-[0_0_40px_rgba(212,175,55,0.15)]">
                    <div className="relative aspect-video overflow-hidden rounded-[1.3rem] bg-dark-blue">
                      <video
                        ref={(el) => (videoRefs.current[video.id] = el)}
                        className="h-full w-full object-cover"
                        loop
                        playsInline
                        autoPlay
                        muted
                      >
                        <source src={video.src} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>

                      {/* Video Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-blue/90 via-transparent to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100">
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              type="button"
                              onClick={() => togglePlayPause(video.id)}
                              className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/40 bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:border-gold hover:bg-gold/30 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                              aria-label={
                                isPlaying[video.id]
                                  ? "Pause video"
                                  : "Play video"
                              }
                            >
                              {isPlaying[video.id] ? (
                                <Pause className="h-6 w-6 fill-current" />
                              ) : (
                                <Play className="ml-1 h-6 w-6 fill-current" />
                              )}
                            </button>
                            {hasUserInteracted && (
                              <button
                                type="button"
                                onClick={() => {
                                  const video = videoRefs.current[video.id];
                                  if (video) {
                                    video.muted = !video.muted;
                                    // Force re-render by updating state
                                    setIsPlaying((prev) => ({ ...prev }));
                                  }
                                }}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:border-gold hover:bg-gold/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                                aria-label={
                                  videoRefs.current[video.id]?.muted
                                    ? "Unmute video"
                                    : "Mute video"
                                }
                              >
                                {videoRefs.current[video.id]?.muted ? (
                                  <VolumeX className="h-4 w-4" />
                                ) : (
                                  <Volume2 className="h-4 w-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dot Indicators */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {videos.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => scrollTo(index)}
                className={`h-2.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 ${
                  index === selectedIndex
                    ? "w-8 bg-gradient-to-r from-gold to-white"
                    : "w-2.5 bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Go to video ${index + 1}`}
              />
            ))}
          </div>

          {/* Mobile Navigation */}
          <div className="mt-4 flex justify-center gap-3 md:hidden">
            <button
              type="button"
              onClick={scrollPrev}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-gold bg-gradient-to-r from-gold/30 to-white/30 text-white transition-all duration-300 hover:from-gold/60 hover:to-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
              aria-label="Previous video"
            >
              <MdOutlineArrowLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-gold bg-gradient-to-r from-gold/30 to-white/30 text-white transition-all duration-300 hover:from-gold/60 hover:to-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
              aria-label="Next video"
            >
              <MdOutlineArrowRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
