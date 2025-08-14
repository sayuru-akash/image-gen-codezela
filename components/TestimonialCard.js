import Image from "next/image";
import { BiSolidQuoteRight } from "react-icons/bi";

export default function TestimonialCard() {
  return (
    <div className="relative flex rounded-2xl bg-dark-blue/50 backdrop-blur-xs border border-white/20 h-60">
      <div className="w-screen md:w-[36rem] p-4 md:p-8">
        <p className="text-white font-semibold text-sm">
          &quot;Lorem ipsum dolor sit amet consectetur. Tellus nisi phasellus
          tempus ut ultrices.&quot;
        </p>
        <p className="text-off-white text-xs py-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </p>
        <div className="flex gap-3 items-center">
          <div className="w-14 h-14 bg-gradient-to-r from-white from-20% to-gold to-80% rounded-full overflow-hidden">
            <Image
              src="/images/john-doe.svg"
              alt="imge"
              width={100}
              height={100}
              className="w-14 h-14"
            />
          </div>
          <div>
            <p className="text-sm text-white font-semibold">John Doe</p>
            <p className="text-sm text-white font-light">Title, Company Name</p>
          </div>
        </div>
      </div>
      <div className="absolute bottom-5 right-5">
        <BiSolidQuoteRight className="w-20 h-20 text-white/5" />
      </div>
    </div>
  );
}
