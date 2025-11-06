import Image from "next/image";
import { BiSolidQuoteRight } from "react-icons/bi";

export default function TestimonialCard({
  quote = "kAIro AI cut our production timelines in half. The Codezela Technologies team helped us lock in prompts that match brand guardrails perfectly.",
  author = "Lina Mensah",
  role = "Head of Brand Experience, Aurora Retail",
  avatar = "/images/john-doe.svg",
}) {
  return (
    <div className="relative flex h-full min-h-[16rem] flex-col justify-between rounded-2xl border border-white/20 bg-dark-blue/60 p-6 backdrop-blur-sm md:min-h-[18rem] md:p-8">
      <p className="text-sm font-semibold text-white md:text-base">
        “{quote}”
      </p>
      <div className="mt-6 flex items-center gap-3">
        <div className="h-14 w-14 overflow-hidden rounded-full border border-gold/60">
          <Image
            src={avatar}
            alt={`${author} portrait`}
            width={100}
            height={100}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{author}</p>
          <p className="text-xs text-white/70">{role}</p>
        </div>
      </div>
      <BiSolidQuoteRight className="absolute bottom-5 right-5 h-16 w-16 text-white/10" />
    </div>
  );
}
