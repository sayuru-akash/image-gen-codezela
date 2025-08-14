"use client";
import Carousel1 from "@/components/carousel/carousel1";
import Carousel2 from "@/components/carousel/carousel2";
import Carousel3 from "@/components/carousel/carousel3";
import Carousel4 from "@/components/carousel/carousel4";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";
import Hero from "@/components/Hero";
import InnovationCard from "@/components/InnovationCard";
import Navigationbar from "@/components/navigationbar";
import TestimonialCard from "@/components/TestimonialCard";
import UsersCard from "@/components/UsersCard";
import Image from "next/image";
import { useState } from "react";
import { MdOutlineArrowLeft, MdOutlineArrowRight } from "react-icons/md";

export default function Home() {
  const [activeCarousel, setActiveCarousel] = useState(1);

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

  const Innvoations = [
    {
      id: "1",
      image1: "/images/image-2.jpg",
      image2: "/images/image-14.jpg",
      title: "Style Transfer",
      body: "Transform your photos by applying artistic styles from renowned paintings and artworks. Give your images a unique flair with just one click.",
      date: "13 August 2025",
      author: "Rishad Ahamed",
    },
    {
      id: "2",
      image1: "/images/image-11.jpg",
      image2: "/images/image-14.jpg",
      title: "Style Transfer",
      body: "Transform your photos by applying artistic styles from renowned paintings and artworks. Give your images a unique flair with just one click.",
      date: "13 August 2025",
      author: "Rishad Ahamed",
    },
    {
      id: "3",
      image1: "/images/image-12.jpg",
      image2: "/images/image-14.jpg",
      title: "Style Transfer",
      body: "Transform your photos by applying artistic styles from renowned paintings and artworks. Give your images a unique flair with just one click.",
      date: "13 August 2025",
      author: "Rishad Ahamed",
    },
    {
      id: "4",
      image1: "/images/image-13.png",
      image2: "/images/image-14.jpg",
      title: "Style Transfer",
      body: "Transform your photos by applying artistic styles from renowned paintings and artworks. Give your images a unique flair with just one click.",
      date: "13 August 2025",
      author: "Rishad Ahamed",
    },
  ];

  return (
    <>
      <div className="bg-[url(/images/hero-img.jpg)] bg-center bg-cover h-screen">
        <div className="w-full h-full bg-gradient-to-b from-dark-blue from-5% via-gold/20 to-dark-blue">
          <Navigationbar />

          <div className="w-full grid justify-items-center px-6 py-20 lg:p-28">
            <h1 className="text-white text-5xl font-bold mb-4 text-center">
              Creativity, Unleashed.
            </h1>
            <p className="text-base text-white text-center mb-10">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>

            <div className="flex flex-col md:flex-row gap-4 lg:gap-8 w-full md:w-fit">
              <button className="w-full md:w-fit bg-gradient-to-r from-gold from-50% to-white/60 to-95% text-white text-sm font-medium px-8 py-3 rounded-full hover:from-white/20 hover:to-gold cursor-pointer transition-all duration-700">
                Get Started
              </button>

              <button className="w-full md:w-fit px-8 py-3 text-sm font-medium text-white rounded-full border border-white hover:text-gold hover:border-gold cursor-pointer transition-all">
                Developer API →
              </button>
            </div>
          </div>

          <Hero />
        </div>
      </div>
      {/* </div> */}

      <div className="w-full h-[20vh] md:h-[85vh]"></div>

      <div className="p-5 md:p-20">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 lg:px-20 py-20">
        {Users.map((user) => (
          <UsersCard key={user.id} title={user.title} body={user.body} />
        ))}
      </div>

      {/* Testimonials */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 px-4 pb-72 md:p-20">
        <div className="flex justify-center items-center backdrop-blur-xs border border-white/20 rounded-[2.5rem] w-full md:w-[30rem] md:h-[28rem]">
          <Image
            src="/images/image-10.png"
            alt="Testimonials"
            width={500}
            height={500}
            className="w-full md:w-[29rem] md:h-[27rem]"
          />
          {/* <div className="w-80 h-80 rounded-4xl bg-red-200"></div> */}
        </div>

        <div className="col-span-2">
          <div className="flex flex-col relative w-full">
            <div className="absolute -left-5 md:-left-20 -top-8 z-10">
              <Image
                src="/images/avatar-1.png"
                alt="Fun Avatar"
                width={300}
                height={300}
                className="w-48 h-48 md:w-80 md:h-80"
              />
            </div>

            <div className="py-10 flex justify-between h-fit items-end-safe">
              <h3 className="ml-36 text-2xl md:text-5xl font-semibold bg-gradient-to-r from-gold from-10% to-white to-90% bg-clip-text text-transparent">
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
              <div className="absolute md:-left-10 w-full">
                <div className="flex gap-2 w-full overflow-hidden overflow-x-auto">
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
      <div className="p-4 md:px-20 md:py-10">
        {/* Title */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          <h3 className="text-2xl md:text-5xl font-semibold bg-gradient-to-r from-gold from-10% to-white to-90% bg-clip-text text-transparent">
            Explore Innovative Possibilities with Enhanced Models
          </h3>

          <div className="hidden md:flex justify-end mt-auto">
            <div className="md:flex gap-2">
              <div className="flex justify-center items-center w-8 h-8 bg-gradient-to-r from-gold from-20% to-white/50 to-80% rounded-full hover:from-dark-blue hover:to-gold border border-gold transition-all cursor-pointer">
                <MdOutlineArrowLeft className="w-7 h-7 text-white group-hover:hidden transition-all duration-300" />
              </div>
              <div className="flex justify-center items-center w-8 h-8 bg-gradient-to-r from-gold from-20% to-white/50 to-80% rounded-full hover:from-dark-blue hover:to-gold border border-gold transition-all cursor-pointer">
                <MdOutlineArrowRight className="w-7 h-7 text-white group-hover:hidden transition-all duration-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Grids */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-6 md:py-20">
          {Innvoations.map((innovation) => (
            <InnovationCard
              key={innovation.id}
              image1={innovation.image1}
              image2={innovation.image2}
              title={innovation.title}
              body={innovation.body}
              date={innovation.date}
              author={innovation.author}
            />
          ))}
        </div>
      </div>

      {/* Partners */}
      <div className="p-4 md:px-20 md:py-10">
        {/* Title */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          <h3 className="text-2xl md:text-5xl font-semibold bg-gradient-to-r from-gold from-10% to-white to-90% bg-clip-text text-transparent">
            Our Partners
          </h3>

          <div className="hidden md:flex justify-end mt-auto">
            <div className="md:flex gap-2">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-10">
          <div className="flex items-center">
            <p className="text-off-white text-base py-2 leading-relaxed line-clamp-6 overflow-y-auto">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>

          <div className="col-span-2">
            <div className="flex gap-2 w-full overflow-x-auto overflow-y-hidden h-32">
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
      <div className="p-4 md:px-20 md:py-20">
        {/* Title */}
        <h3 className="text-2xl md:text-4xl mb-10 text-center font-semibold bg-gradient-to-r from-gold from-10% to-white to-90% bg-clip-text text-transparent">
          Platform Gallery
        </h3>
        <Gallery />
      </div>

      {/* Sign up */}
      <div className="w-full h-fit p-4 md:p-20 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gradient-to-r from-dark-blue to-gold">
        <div className="bg-transparent backdrop-blur-xs rounded-4xl p-2 w-full h-96 shadow-2xl border border-white/30">
          <div className="bg-[url(/images/hero-img.jpg)] bg-center bg-cover rounded-3xl w-full h-full"></div>
        </div>

        <div className="py-10 px-5 md:p-10">
          <p className="text-white text-4xl font-semibold mb-10">
            Create your next artwork, with the power of KAIRO Ai
          </p>
          <button className="w-full md:w-fit bg-gradient-to-r from-gold from-50% to-white/60 to-95% text-white text-sm font-medium px-8 py-3 rounded-full hover:from-white/20 hover:to-gold cursor-pointer transition-all duration-100000">
            Start Using KAIRO →
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
}
