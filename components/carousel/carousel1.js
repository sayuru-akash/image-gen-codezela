import { BsArrowUpRightCircleFill } from "react-icons/bs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import CapabilitySwitcher from "./CapabilitySwitcher";

export default function Carousel1({ activeCarousel, onTabChange }) {
  const router = useRouter();

  const handleTryNow = () => {
    router.push("/dashboard/text-to-image");
  };
  return (
    <div>
      <div className="grid grid-cols-7 gap-4 lg:py-10">
        <div className="col-span-full lg:col-span-4 text-white py-14">
          <CapabilitySwitcher active={activeCarousel} onChange={onTabChange} />

          <p className="text-base uppercase tracking-[0.25em] text-gold/80">
            Core engine
          </p>
          <h3 className="text-2xl font-semibold py-2 text-white">
            Narrative text-to-image built for brand storytelling.
          </h3>
          <p className="text-sm mt-8 mb-10 text-white/80">
            Describe your campaign concept, tone, or product hero and kAIro AI
            creates ready-to-use imagery in seconds. Save prompt recipes,
            control negative prompts, and keep every render aligned with your
            visual identity.
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
            src="/images/Product-Icon-1.svg"
            width={56}
            height={56}
            className="hidden lg:block absolute top-[24rem] left-5"
            priority={false}
          />

          <div className="flex justify-center h-full items-center">
            <div className="z-10 bg-gradient-to-r from-white/20 to-gold backdrop-blur-xs rounded-4xl p-2 lg:p-4 w-full lg:w-96 h-96 shadow-2xl">
              <div className="relative w-full h-full">
                <Image
                  alt="AI generated portrait in warm tones"
                  src="/images/image-5.png"
                  fill
                  className="rounded-3xl object-cover"
                  sizes="(min-width: 1024px) 352px, 90vw"
                  quality={60}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
