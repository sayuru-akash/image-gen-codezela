import { BsArrowUpRightCircleFill } from "react-icons/bs";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Carousel3({ activeCarousel, onTabChange }) {
  const router = useRouter();

  const handleTryNow = () => {
    router.push("/dashboard/edit-with-mask");
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

          <p className="text-base">Precision Control</p>
          <h3 className="text-2xl font-semibold py-2">
            Targeted Image Editing with AI Masking
          </h3>
          <p className="text-sm mt-10 mb-10">
            Achieve precise edits by painting over specific areas of your image.
            Define exactly what you want to change, and our AI will
            intelligently regenerate only those masked sections, allowing for
            unparalleled control and transformative results.
          </p>
          <button
            onClick={handleTryNow}
            className="flex items-center gap-2 p-2 pl-4 bg-gradient-to-r from-gold to-white/50 text-white hover:from-white/20 from-20% hover:to-gold cursor-pointer transition-all text-sm rounded-full"
          >
            Try Now <BsArrowUpRightCircleFill className="w-7 h-7 text-white" />
          </button>
        </div>

        <div className="col-span-full lg:col-span-3 relative">
          {/* Decorative elements */}
          <Image
            alt=""
            src="/images/star-icon.svg"
            width={64}
            height={64}
            className="hidden lg:block absolute top-0 right-0"
            priority={false}
          />
          <Image
            alt=""
            src="/images/stars.svg"
            width={32}
            height={32}
            className="hidden lg:block absolute top-35 left-5"
            priority={false}
          />
          <Image
            alt=""
            src="/images/Product-Icon-3.svg"
            width={56}
            height={56}
            className="hidden lg:block absolute top-[24rem] left-5"
            priority={false}
          />

          <div className="flex justify-center h-full items-center">
            <div className="z-10 bg-gradient-to-r from-white/20 to-gold backdrop-blur-xs rounded-4xl p-2 lg:p-4 w-full lg:w-96 h-96 shadow-2xl">
              <div className="relative w-full h-full">
                <Image
                  alt="AI painting with vivid strokes"
                  src="/images/image-7.png"
                  fill
                  className="rounded-3xl object-cover"
                  sizes="(min-width: 1024px) 24rem, 90vw"
                  quality={70}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
