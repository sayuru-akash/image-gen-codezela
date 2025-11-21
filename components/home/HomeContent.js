"use client";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdOutlineArrowLeft, MdOutlineArrowRight } from "react-icons/md";
import useEmblaCarousel from "embla-carousel-react";
import Carousel1 from "@/components/carousel/carousel1";
import Carousel2 from "@/components/carousel/carousel2";
import Carousel3 from "@/components/carousel/carousel3";
import Carousel4 from "@/components/carousel/carousel4";
import Gallery from "@/components/Gallery";
import Hero from "@/components/Hero";
import Navigationbar from "@/components/navigationbar";
import Signup from "@/components/Signup";
import TestimonialCard from "@/components/TestimonialCard";
import UsersCard from "@/components/UsersCard";
import ExploreInnovation from "@/components/ExploreInnovation";
import Footer from "@/components/Footer";
import VideoShowcase from "@/components/VideoShowcase";

export default function HomeContent() {
  const { data: session } = useSession();
  const [activeCarousel, setActiveCarousel] = useState(1);
  const sectionSpacing = "px-4 py-12 md:px-10 lg:px-20 lg:py-16";
  const [testimonialViewportRef, testimonialEmbla] = useEmblaCarousel({
    loop: true,
    align: "start",
  });
  const [logoViewportRef, logoEmbla] = useEmblaCarousel({
    loop: true,
    align: "start",
  });
  const testimonialAutoplayRef = useRef(null);
  const stopTestimonialAutoplay = useCallback(() => {
    if (testimonialAutoplayRef.current) {
      window.clearInterval(testimonialAutoplayRef.current);
      testimonialAutoplayRef.current = null;
    }
  }, []);
  const startTestimonialAutoplay = useCallback(() => {
    if (testimonialAutoplayRef.current) return;
    testimonialAutoplayRef.current = window.setInterval(() => {
      testimonialEmbla?.scrollNext();
    }, 6000);
  }, [testimonialEmbla]);
  useEffect(() => {
    if (!testimonialEmbla) return undefined;
    startTestimonialAutoplay();
    testimonialEmbla.on("pointerDown", stopTestimonialAutoplay);
    testimonialEmbla.on("pointerUp", startTestimonialAutoplay);
    testimonialEmbla.on("pointerLeave", startTestimonialAutoplay);
    return () => {
      stopTestimonialAutoplay();
      testimonialEmbla.off("pointerDown", stopTestimonialAutoplay);
      testimonialEmbla.off("pointerUp", startTestimonialAutoplay);
      testimonialEmbla.off("pointerLeave", startTestimonialAutoplay);
    };
  }, [testimonialEmbla, startTestimonialAutoplay, stopTestimonialAutoplay]);
  const testimonialPrev = useCallback(() => {
    stopTestimonialAutoplay();
    testimonialEmbla?.scrollPrev();
    startTestimonialAutoplay();
  }, [testimonialEmbla, startTestimonialAutoplay, stopTestimonialAutoplay]);
  const testimonialNext = useCallback(() => {
    stopTestimonialAutoplay();
    testimonialEmbla?.scrollNext();
    startTestimonialAutoplay();
  }, [testimonialEmbla, startTestimonialAutoplay, stopTestimonialAutoplay]);
  const logoAutoplayRef = useRef(null);
  const stopLogoAutoplay = useCallback(() => {
    if (logoAutoplayRef.current) {
      window.clearInterval(logoAutoplayRef.current);
      logoAutoplayRef.current = null;
    }
  }, []);
  const startLogoAutoplay = useCallback(() => {
    if (logoAutoplayRef.current) return;
    logoAutoplayRef.current = window.setInterval(() => {
      logoEmbla?.scrollNext();
    }, 4500);
  }, [logoEmbla]);
  useEffect(() => {
    if (!logoEmbla) return undefined;
    startLogoAutoplay();
    logoEmbla.on("pointerDown", stopLogoAutoplay);
    logoEmbla.on("pointerUp", startLogoAutoplay);
    logoEmbla.on("pointerLeave", startLogoAutoplay);
    return () => {
      stopLogoAutoplay();
      logoEmbla.off("pointerDown", stopLogoAutoplay);
      logoEmbla.off("pointerUp", startLogoAutoplay);
      logoEmbla.off("pointerLeave", startLogoAutoplay);
    };
  }, [logoEmbla, startLogoAutoplay, stopLogoAutoplay]);
  const logoPrev = useCallback(() => {
    stopLogoAutoplay();
    logoEmbla?.scrollPrev();
    startLogoAutoplay();
  }, [logoEmbla, startLogoAutoplay, stopLogoAutoplay]);
  const logoNext = useCallback(() => {
    stopLogoAutoplay();
    logoEmbla?.scrollNext();
    startLogoAutoplay();
  }, [logoEmbla, startLogoAutoplay, stopLogoAutoplay]);

  const personaCards = useMemo(
    () => [
      {
        id: "growth",
        title: "Growth Marketers",
        body: "Launch personalisation-ready visuals for every channel with AI-assisted copy, localisation, and performance tags built into kAIro AI.",
      },
      {
        id: "product",
        title: "Product Designers",
        body: "Prototype interfaces, packaging, and merchandising displays using masks, layered prompts, and instant lighting adjustments.",
      },
      {
        id: "agencies",
        title: "Creative Agencies",
        body: "Partner with Codezela Technologies to deliver white-label AI experiences, managed production pipelines, and rapid campaign experimentation.",
      },
    ],
    []
  );

  const testimonials = useMemo(
    () => [
      {
        quote:
          "Our retail launches used to take six weeks of photo shoots. With kAIro AI we generate localisation-ready hero images in two days while maintaining brand guardrails.",
        author: "Lina Mensah",
        role: "Head of Brand Experience, Aurora Retail",
        avatar: "/images/john-doe.svg",
      },
      {
        quote:
          "Codezela Technologies helped us embed prompt governance across our product, marketing, and compliance teams. Approvals are faster and every asset is traceable.",
        author: "Chen Wu",
        role: "Director of Creative Operations, Nexus Fintech",
        avatar: "/images/john-doe.svg",
      },
      {
        quote:
          "The mask editor lets our designers tweak lighting and packaging without rerendering entire scenes. It's the smartest workflow addition we made this year.",
        author: "Emily Rodríguez",
        role: "Principal Product Designer, Stellar Labs",
        avatar: "/images/john-doe.svg",
      },
      {
        quote:
          "We rely on the dual image editor to craft pitch decks and lookbooks. Clients get to see multiple creative directions in a single review session.",
        author: "Gregory Patel",
        role: "Managing Partner, Brightline Creative",
        avatar: "/images/john-doe.svg",
      },
    ],
    []
  );
  const partnerLogos = useMemo(() => {
    const baseLogos = ["logo-1.svg", "logo-2.svg", "logo-3.svg", "logo-4.svg"];
    return [...baseLogos, ...baseLogos];
  }, []);

  const handleCarousel = (tab) => setActiveCarousel(tab);

  return (
    <>
      <section className="relative h-screen">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-blue/95 via-dark-blue/92 to-[#0F1622]">
          <Navigationbar />

          <div className="w-full grid justify-items-center px-6 py-20 lg:px-28 lg:pt-28">
            <h1 className="text-center text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              AI imagery engineered for brands that scale.
            </h1>
            <p className="mt-6 max-w-2xl text-center text-sm text-white/80 sm:text-base">
              kAIro AI, a subsidiary of Codezela Technologies, unifies
              text-to-image generation, intelligent editing, and governed
              delivery so your team can ideate, iterate, and publish richer
              stories in hours— not weeks.
            </p>

            <div className="mt-10 flex w-full flex-col gap-4 md:w-auto md:flex-row md:gap-6">
              <Link
                href={session ? "/dashboard" : "/signup"}
                className="w-full rounded-full bg-gradient-to-r from-gold to-white/70 px-8 py-3 text-center text-sm font-semibold text-dark-blue transition-all duration-300 hover:from-white/80 hover:to-gold md:w-auto"
              >
                {session ? "Open kAIro Dashboard" : "Get Started with kAIro AI"}
              </Link>
              <Link
                href="https://codezela.com/contact"
                target="_blank"
                rel="noreferrer"
                className="w-full rounded-full border border-white/40 px-8 py-3 text-center text-sm font-semibold text-white transition-all duration-300 hover:border-gold hover:text-gold md:w-auto"
              >
                Talk to Codezela Technologies →
              </Link>
            </div>
          </div>

          <div className="pointer-events-none absolute top-80 w-full">
            <Hero />
          </div>
        </div>
      </section>

      <main>
        <section
          id="features"
          className={`${sectionSpacing} scroll-mt-24 pt-36 md:pt-[36rem] lg:pt-[36rem]`}
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-gold/80">
              Platform capabilities
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
              Production-ready creative workflows for every stage of
              storytelling.
            </h2>
            <p className="mt-4 text-sm text-white/70">
              Switch between generation styles, collaborate on edits, and
              automate delivery to every channel from a single, secure
              workspace.
            </p>
          </div>

          <div className="mt-8">
            {activeCarousel === 1 ? (
              <Carousel1
                activeCarousel={activeCarousel}
                onTabChange={handleCarousel}
              />
            ) : activeCarousel === 2 ? (
              <Carousel2
                activeCarousel={activeCarousel}
                onTabChange={handleCarousel}
              />
            ) : activeCarousel === 3 ? (
              <Carousel3
                activeCarousel={activeCarousel}
                onTabChange={handleCarousel}
              />
            ) : activeCarousel === 4 ? (
              <Carousel4
                activeCarousel={activeCarousel}
                onTabChange={handleCarousel}
              />
            ) : (
              <Carousel1
                activeCarousel={activeCarousel}
                onTabChange={handleCarousel}
              />
            )}
          </div>
        </section>

        <section className={sectionSpacing}>
          <div className="grid gap-6 lg:grid-cols-3">
            {personaCards.map((card) => (
              <UsersCard key={card.id} title={card.title} body={card.body} />
            ))}
          </div>
        </section>

        <section className={sectionSpacing}>
          <div className="grid grid-cols-1 gap-8">
            <div className="relative flex flex-col">
              <div className="absolute -left-5 -top-8 hidden lg:block">
                <Image
                  src="/images/avatar-1.png"
                  alt="Creative director testimonial avatar"
                  width={192}
                  height={192}
                  className="h-40 w-40"
                />
              </div>

              <div className="flex items-end justify-between pt-16">
                <h3 className="ml-0 text-2xl font-semibold text-white sm:ml-32 sm:text-4xl lg:ml-32 lg:text-5xl">
                  Leaders shipping with{" "}
                  <span className="text-gold">kAIro AI</span>
                </h3>
                <div className="hidden gap-2 text-white/70 md:flex">
                  <button
                    type="button"
                    onClick={testimonialPrev}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gold bg-gradient-to-r from-gold/30 to-white/30 transition-colors duration-300 hover:from-gold/60 hover:to-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                    aria-label="View previous testimonial"
                  >
                    <MdOutlineArrowLeft />
                  </button>
                  <button
                    type="button"
                    onClick={testimonialNext}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gold bg-gradient-to-r from-gold/30 to-white/30 transition-colors duration-300 hover:from-gold/60 hover:to-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                    aria-label="View next testimonial"
                  >
                    <MdOutlineArrowRight />
                  </button>
                </div>
              </div>

              <div className="relative mt-12 w-full">
                <div
                  className="overflow-hidden"
                  ref={testimonialViewportRef}
                  aria-label="Testimonials"
                >
                  <div className="flex pb-4">
                    {testimonials.map((testimonial) => (
                      <div
                        key={testimonial.author}
                        className="flex-[0_0_100%] px-3 sm:flex-[0_0_70%] sm:px-4 lg:flex-[0_0_45%] lg:px-4"
                      >
                        <TestimonialCard {...testimonial} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={sectionSpacing}>
          <ExploreInnovation />
        </section>

        <section className={sectionSpacing}>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-gold/80">
                Strategic partners
              </p>
              <h3 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                Trusted by product and marketing teams worldwide.
              </h3>
              <p className="mt-4 text-sm text-white/70">
                Codezela Technologies collaborates with fintech, retail,
                entertainment, and SaaS innovators who demand on-brand visuals
                that can be tailored for every market.
              </p>
            </div>
            <div className="hidden items-end justify-end gap-2 text-white/70 lg:flex">
              <button
                type="button"
                onClick={logoPrev}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gold bg-gradient-to-r from-gold/30 to-white/30 transition-colors duration-300 hover:from-gold/60 hover:to-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                aria-label="View previous partner logo"
              >
                <MdOutlineArrowLeft />
              </button>
              <button
                type="button"
                onClick={logoNext}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gold bg-gradient-to-r from-gold/30 to-white/30 transition-colors duration-300 hover:from-gold/60 hover:to-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                aria-label="View next partner logo"
              >
                <MdOutlineArrowRight />
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <div className="flex items-center">
              <p className="text-sm text-white/70">
                From Fortune 500 standards and trends to emerging brand
                repositions, kAIro AI keeps creative assets secure, searchable,
                and ready for any channel.
              </p>
            </div>
            <div className="lg:col-span-2">
              <div
                className="overflow-hidden rounded-2xl border border-secondary-accent/40 bg-white/5 px-1 py-2 backdrop-blur"
                ref={logoViewportRef}
                aria-label="Strategic partner logos"
              >
                <div className="flex px-2">
                  {partnerLogos.map((logo, index) => (
                    <div
                      key={`${logo}-${index}`}
                      className="flex-[0_0_60%] px-3 sm:flex-[0_0_40%] sm:px-4 md:flex-[0_0_30%] lg:flex-[0_0_24%] lg:px-4 xl:flex-[0_0_20%]"
                    >
                      <div className="flex h-32 items-center justify-center rounded-2xl border border-secondary-accent/30 bg-dark-blue/40">
                        <Image
                          src={`/images/${logo}`}
                          alt={`Partner ${index + 1}`}
                          width={200}
                          height={200}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <VideoShowcase />

        <section id="usage" className={`${sectionSpacing} scroll-mt-24`}>
          <p className="text-center text-xs uppercase tracking-[0.35em] text-gold/80">
            Usage inspiration
          </p>
          <h3 className="mt-3 text-center text-2xl font-semibold text-white md:text-4xl">
            How teams activate kAIro AI across their lifecycle.
          </h3>
          <p className="mt-4 text-center text-sm text-white/70">
            Explore campaign-ready outputs, product mockups, and immersive art
            directions generated inside the platform.
          </p>
          <div className="mt-8">
            <Gallery />
          </div>
        </section>
      </main>

      <div id="contact" className="scroll-mt-24 pt-10 md:pt-14 lg:pt-20">
        <Signup />
      </div>

      <Footer />
    </>
  );
}
