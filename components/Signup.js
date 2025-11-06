import Image from "next/image";

export default function Signup() {
  return (
    <div className="w-full h-fit p-4 md:p-10 lg:p-20 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gradient-to-r from-dark-blue to-gold">
      <div className="bg-transparent backdrop-blur-xs rounded-4xl p-2 w-full h-96 shadow-2xl border border-white/30">
        <div className="relative w-full h-full">
          <Image
            alt="Featured AI generated artwork"
            src="/images/hero-img.jpg"
            fill
            className="rounded-3xl object-cover"
            quality={70}
            sizes="(min-width: 768px) 40vw, 100vw"
          />
        </div>
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
  );
}
