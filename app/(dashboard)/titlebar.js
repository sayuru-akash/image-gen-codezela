import Image from "next/image";

export default function TitleBar() {
  return (
    <div className="flex justify-between items-center">
      {/* Logo */}
      <div className="flex items-center">
        <div className="w-12 h-12 bg-gradient-to-r from-white from-20% to-gold to-80% rounded-full mr-2"></div>
        <span className="text-xl font-semibold tracking-wider text-white">kAIro</span>
      </div>

      <div className="w-14 h-14 bg-gradient-to-r from-white from-20% to-gold to-80% rounded-full overflow-hidden">
        <Image
          src="/images/john-doe.svg"
          alt="imge"
          width={100}
          height={100}
          className="w-14 h-14"
        />
      </div>
    </div>
  );
}
