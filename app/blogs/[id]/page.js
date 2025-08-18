import ExploreInnovation from "@/components/ExploreInnovation";
import Footer from "@/components/Footer";
import NavigationBar from "@/components/navigationbar";
import Image from "next/image";
import { LiaShareAltSolid } from "react-icons/lia";
import { MdOutlineArrowLeft, MdOutlineArrowRight } from "react-icons/md";

export default function Blog() {
  return (
    <>
      <div className="bg-black mb-10">
        <NavigationBar />
      </div>

      <div className="w-11/12 md:w-3/5 mx-auto my-20">
        <div className="bg-white/10 backdrop-blur-xs w-full h-96 rounded-4xl border border-white/30 p-3 mb-10">
          <div className="relative w-full h-full rounded-2xl overflow-hidden">
            <Image
              alt="Blog Image"
              src="/images/image-11.jpg"
              width={1080}
              height={1080}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>

        <h3 className="text-5xl text-white font-semibold leading-12 md:leading-14">
          Discover New Horizons with Advanced Models
        </h3>

        <div className="flex justify-between items-center my-4">
          <div>
            <p className="text-xs text-off-white">
              written by{" "}
              <span className="text-sm text-white">Rishad Ahamed</span>
            </p>
            <p className="text-xs text-off-white">13th August 2025</p>
          </div>

          <div className="flex items-center gap-1 text-white text-sm hover:text-gold cursor-pointer transition-all">
            <LiaShareAltSolid className="w-6 h-6" />
            <p>Share</p>
          </div>
        </div>

        <h3 className="text-2xl text-white font-semibold py-4">Sub Heading</h3>

        <p className="text-off-white text-base text-justify">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum
          dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
          quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
          commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
          velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
          occaecat cupidatat non proident, sunt in culpa qui officia deserunt
          mollit anim id est laborum.
        </p>

        <div className="grid grid-cols-3 gap-8 my-8">
          <p className="col-span-2 text-off-white text-base text-justify">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum
            dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim
            veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat. Duis aute irure dolor in reprehenderit in
            voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
            officia deserunt mollit anim id est laborum.
          </p>

          <div className="bg-white/10 backdrop-blur-xs w-full h-96 rounded-4xl border border-white/30 p-3">
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
              <Image
                alt="Blog Image"
                src="/images/image-1.png"
                width={1080}
                height={1080}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <h3 className="text-2xl text-white font-semibold py-4">Sub Heading</h3>

        <p className="text-off-white text-base text-justify">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum
          dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
          quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
          commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
          velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
          occaecat cupidatat non proident, sunt in culpa qui officia deserunt
          mollit anim id est laborum.
        </p>

        <div className="grid grid-cols-3 gap-8 my-8">
          <div className="bg-white/10 backdrop-blur-xs w-full h-96 rounded-4xl border border-white/30 p-3">
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
              <Image
                alt="Blog Image"
                src="/images/image-11.jpg"
                width={1080}
                height={1080}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
          <p className="col-span-2 text-off-white text-base text-justify">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum
            dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim
            veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat. Duis aute irure dolor in reprehenderit in
            voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
            officia deserunt mollit anim id est laborum.
          </p>
        </div>
      </div>

      <div className="p-4 md:px-20 md:py-10 bg-black">
        <ExploreInnovation />
        <hr className="border border-off-white"/>
      </div>
      <Footer />
    </>
  );
}
