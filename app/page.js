"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Carousel1 from "@/components/carousel/carousel1";
import Carousel2 from "@/components/carousel/carousel2";
import Carousel3 from "@/components/carousel/carousel3";
import Carousel4 from "@/components/carousel/carousel4";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";
import Hero from "@/components/Hero";
import Navigationbar from "@/components/navigationbar";
import Signup from "@/components/Signup";
import TestimonialCard from "@/components/TestimonialCard";
import UsersCard from "@/components/UsersCard";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MdOutlineArrowLeft, MdOutlineArrowRight } from "react-icons/md";
import ExploreInnovation from "@/components/ExploreInnovation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeCarousel, setActiveCarousel] = useState(1);

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
  }, [status, router]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-dark-blue flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // If user is authenticated, show the home page with dashboard access
  // If user is not authenticated, they will be redirected to login
  const handleCarousel = (tab) => {
    setActiveCarousel(tab);
  };

  const Users = [
    {
      id: "1",
      title: "For Creators",
      body: "In a world where creativity knows no bounds, imagine a vibrant marketplace bustling with life.",
    },
    {
      id: "2",
      title: "For Innovators",
      body: "Picture a realm where ideas transform into reality, a collaborative space thriving on imagination and innovation.",
    },
    {
      id: "3",
      title: "For Dreamers",
      body: "Visualize a sanctuary where aspirations take flight, filled with inspiration and the energy of countless possibilities.",
    },
  ];

  return (
    <>
      <div className="bg-[url(/images/hero-img.jpg)] bg-center bg-cover h-screen">
        <div className="w-full h-full relative bg-gradient-to-b from-dark-blue from-5% via-gold/20 to-dark-blue">
          <Navigationbar />

          <div className="w-full grid justify-items-center px-6 py-20 lg:px-28 lg:pt-28">
            <h1 className="text-white text-5xl font-bold mb-4 text-center">
              Creativity, Unleashed.
            </h1>
            <p className="text-base text-white text-center mb-10">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>

            <div className="flex flex-col md:flex-row gap-4 lg:gap-8 w-full md:w-fit">
              {session ? (
                <Link
                  href="/text-to-image"
                  className="w-full md:w-fit bg-gradient-to-r from-gold from-50% to-white/60 to-95% text-white text-sm font-medium px-8 py-3 rounded-full hover:from-white/20 hover:to-gold cursor-pointer transition-all duration-700 text-center"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  href="/signup"
                  className="w-full md:w-fit bg-gradient-to-r from-gold from-50% to-white/60 to-95% text-white text-sm font-medium px-8 py-3 rounded-full hover:from-white/20 hover:to-gold cursor-pointer transition-all duration-700 text-center"
                >
                  Get Started
                </Link>
              )}

              <button className="w-full md:w-fit px-8 py-3 text-sm font-medium text-white rounded-full border border-white hover:text-gold hover:border-gold cursor-pointer transition-all">
                Developer API →
              </button>
            </div>
          </div>

          <div className="absolute top-70 w-full">
            <Hero />
          </div>
        </div>
      </div>
      {/* </div> */}

      <div className="w-full h-[20vh] md:h-[15vh] lg:h-[85vh]"></div>

      <div className="p-5 md:p-10 lg:p-20">
        <h3 className="text-3xl font-semibold text-center bg-gradient-to-r from-gold from-10% to-white to-90% bg-clip-text text-transparent">
          Unleash Your Creativity
        </h3>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-4 md:px-10 lg:px-20 py-20">
        {Users.map((user) => (
          <UsersCard key={user.id} title={user.title} body={user.body} />
        ))}
      </div>

      {/* Testimonials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 px-4 pb-72 md:px-10 lg:p-20">
        <div className="flex justify-center items-center backdrop-blur-xs border border-white/20 rounded-[2.5rem] md:rounded-[3rem] lg:rounded-[2.5rem] w-full lg:w-[30rem] lg:h-[28rem]">
          <Image
            src="/images/image-10.png"
            alt="Testimonials"
            width={500}
            height={500}
            className="w-full lg:w-[29rem] lg:h-[27rem]"
          />
          {/* <div className="w-80 h-80 rounded-4xl bg-red-200"></div> */}
        </div>

        <div className="lg:col-span-2">
          <div className="flex flex-col relative w-full">
            <div className="absolute -left-5 lg:-left-20 -top-8 z-10">
              <Image
                src="/images/avatar-1.png"
                alt="Fun Avatar"
                width={300}
                height={300}
                className="w-48 h-48 md:w-80 md:h-80"
              />
            </div>

            <div className="py-10 flex justify-between h-fit items-end-safe">
              <h3 className="ml-36 md:ml-52 lg:ml-36 text-2xl md:text-5xl font-semibold bg-gradient-to-r from-gold from-10% to-white to-90% bg-clip-text text-transparent">
                The <br />
                <span>Creators Says!</span>
              </h3>

              <div className="hidden md:flex gap-2">
                <div className="flex justify-center items-center w-8 h-8 bg-gradient-to-r from-gold from-20% to-white/50 to-80% rounded-full hover:from-dark-blue hover:to-gold border border-gold transition-all cursor-pointer">
                  <MdOutlineArrowLeft className="w-7 h-7 text-white group-hover:hidden transition-all duration-300" />
                </div>
                <div className="flex justify-center items-center w-8 h-8 bg-gradient-to-r from-gold from-20% to-white/50 to-80% rounded-full hover:from-dark-blue hover:to-gold border border-gold transition-all cursor-pointer">
                  <MdOutlineArrowRight className="w-7 h-7 text-white group-hover:hidden transition-all duration-300" />
                </div>
              </div>
            </div>

            <div className="w-full -mt-3 md:mt-[4.15rem] relative">
              <div className="absolute lg:-left-10 w-full">
                <div className="flex gap-2 w-full overflow-hidden overflow-x-auto scrollbar-hide">
                  <TestimonialCard />
                  <TestimonialCard />
                  <TestimonialCard />
                  <TestimonialCard />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explore innvoations */}
      <div className="p-4 md:px-10 lg:px-20 md:py-10">
        <ExploreInnovation />
      </div>

      {/* Partners */}
      <div className="p-4 md:px-10 lg:px-20 md:py-10">
        {/* Title */}
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <h3 className="text-2xl md:text-5xl font-semibold bg-gradient-to-r from-gold from-10% to-white to-90% bg-clip-text text-transparent">
            Our Partners
          </h3>

          <div className="hidden lg:flex justify-end mt-auto">
            <div className="lg:flex gap-2">
              <div className="flex justify-center items-center w-8 h-8 bg-gradient-to-r from-gold from-20% to-white/50 to-80% rounded-full hover:from-dark-blue hover:to-gold border border-gold transition-all cursor-pointer">
                <MdOutlineArrowLeft className="w-7 h-7 text-white group-hover:hidden transition-all duration-300" />
              </div>
              <div className="flex justify-center items-center w-8 h-8 bg-gradient-to-r from-gold from-20% to-white/50 to-80% rounded-full hover:from-dark-blue hover:to-gold border border-gold transition-all cursor-pointer">
                <MdOutlineArrowRight className="w-7 h-7 text-white group-hover:hidden transition-all duration-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 py-10">
          <div className="flex items-center">
            <p className="text-off-white text-base py-2 leading-relaxed line-clamp-6 overflow-y-auto">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>

          <div className="col-span-2">
            <div className="flex gap-2 w-full overflow-x-auto overflow-y-hidden scrollbar-hide h-32">
              <div className="flex items-center justify-center rounded-2xl border border-secondary-accent h-32 w-56 flex-shrink-0">
                <Image
                  src="/images/logo-1.svg"
                  alt="Logo"
                  width={200}
                  height={200}
                />
              </div>

              <div className="flex items-center justify-center rounded-2xl border border-secondary-accent h-32 w-56 flex-shrink-0">
                <Image
                  src="/images/logo-2.svg"
                  alt="Logo"
                  width={200}
                  height={200}
                />
              </div>

              <div className="flex items-center justify-center rounded-2xl border border-secondary-accent h-32 w-56 flex-shrink-0">
                <Image
                  src="/images/logo-3.svg"
                  alt="Logo"
                  width={200}
                  height={200}
                />
              </div>

              <div className="flex items-center justify-center rounded-2xl border border-secondary-accent h-32 w-56 flex-shrink-0">
                <Image
                  src="/images/logo-4.svg"
                  alt="Logo"
                  width={200}
                  height={200}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Gallery */}
      <div className="p-4 md:px-10 lg:px-20 md:py-20">
        {/* Title */}
        <h3 className="text-2xl md:text-4xl mb-10 text-center font-semibold bg-gradient-to-r from-gold from-10% to-white to-90% bg-clip-text text-transparent">
          Platform Gallery
        </h3>
        <Gallery />
      </div>

      {/* Sign up */}
      <Signup />

      <Footer />
    </>
  );
}
