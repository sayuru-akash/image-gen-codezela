import { BsArrowUpRightCircleFill } from "react-icons/bs";
import { useRouter } from "next/navigation";

export default function Carousel1({ activeCarousel, onTabChange }) {
  const router = useRouter();

  const handleTryNow = () => {
    router.push("/dashboard/text-to-image");
  };
  return (
    <div>
      <div className="grid grid-cols-7 gap-4 lg:py-10">
        <div className="col-span-full lg:col-span-4 text-white py-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 lg:space-x-12 text-base mb-14">
            <button
              onClick={() => onTabChange(1)}
              className={`text-left mb-4 transition-all underline cursor-pointer ${
                activeCarousel === 1
                  ? "bg-gradient-to-r from-gold from-10% to-white to-95% bg-clip-text text-transparent"
                  : "text-white hover:bg-gradient-to-r hover:from-gold hover:from-10% hover:to-white hover:to-95% hover:bg-clip-text hover:text-transparent"
              }`}
            >
              Text to Image
            </button>
            <button
              onClick={() => onTabChange(2)}
              className={`text-left mb-4 transition-all underline cursor-pointer ${
                activeCarousel === 2
                  ? "bg-gradient-to-r from-gold from-10% to-white to-95% bg-clip-text text-transparent"
                  : "text-white hover:bg-gradient-to-r hover:from-gold hover:from-10% hover:to-white hover:to-95% hover:bg-clip-text hover:text-transparent"
              }`}
            >
              Image Update
            </button>
            <button
              onClick={() => onTabChange(3)}
              className={`text-left mb-4 transition-all underline cursor-pointer ${
                activeCarousel === 3
                  ? "bg-gradient-to-r from-gold from-10% to-white to-95% bg-clip-text text-transparent"
                  : "text-white hover:bg-gradient-to-r hover:from-gold hover:from-10% hover:to-white hover:to-95% hover:bg-clip-text hover:text-transparent"
              }`}
            >
              Edit with Mask
            </button>
            <button
              onClick={() => onTabChange(4)}
              className={`text-left mb-4 transition-all underline cursor-pointer ${
                activeCarousel === 4
                  ? "bg-gradient-to-r from-gold from-10% to-white to-95% bg-clip-text text-transparent"
                  : "text-white hover:bg-gradient-to-r hover:from-gold hover:from-10% hover:to-white hover:to-95% hover:bg-clip-text hover:text-transparent"
              }`}
            >
              AI Dual Image Editor
            </button>
          </div>

          <p className="text-base">Core Tools</p>
          <h3 className="text-2xl font-semibold py-2">
            AI Text to Image Generator
          </h3>
          <p className="text-sm mt-10 mb-10">
            Transform your ideas into stunning visuals with our powerful AI.
            Simply describe your vision in text, and watch as it comes to life
            with incredible detail and artistic flair. Whether it&apos;s
            realistic scenes, digital art, or abstract concepts, our AI
            delivers.
          </p>
          <button
            onClick={handleTryNow}
            className="flex items-center gap-2 p-2 pl-4 bg-gradient-to-r from-gold to-white/50 text-white hover:from-white/20 from-20% hover:to-gold cursor-pointer transition-all text-sm rounded-full"
          >
            Try Now <BsArrowUpRightCircleFill className="w-7 h-7 text-white" />
          </button>
        </div>

        <div className="col-span-full lg:col-span-3">
          {/* Right side star */}
          <div className="hidden lg:grid justify-items-end">
            <div className="absolute w-16 h-16 bg-[url(/images/star-icon.svg)] bg-center bg-cover"></div>
          </div>

          {/* Stars */}
          <div className="hidden lg:block relative">
            <div className="absolute w-8 h-8 top-35 left-5 bg-[url(/images/stars.svg)] bg-center bg-cover"></div>
          </div>

          {/* Icon */}
          <div className="hidden lg:block relative">
            <div className="absolute w-14 h-14 top-[24rem] left-5 bg-[url(/images/Product-Icon-1.svg)] bg-center bg-cover"></div>
          </div>

          <div className="flex justify-center h-full items-center">
            <div className="z-10 bg-gradient-to-r from-white/20 to-gold backdrop-blur-xs rounded-4xl p-2 lg:p-4 w-full lg:w-96 h-96 shadow-2xl">
              <div className="bg-[url(/images/image-5.png)] bg-center bg-cover rounded-3xl w-full h-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
