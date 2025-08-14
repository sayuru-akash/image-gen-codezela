import {
  BsArrowRightCircleFill,
  BsArrowUpRightCircleFill,
} from "react-icons/bs";

export default function UsersCard({ title, body }) {
  return (
    <div className="group cursor-pointer">
      <div className="relative rounded-2xl border border-secondary-accent p-6 min-h-48 overflow-hidden transition-all duration-300">
        {/* Background Image - appears on hover with opacity */}
        <div className="absolute inset-0 bg-[url(/images/image-9.jpg)] bg-center bg-cover opacity-0 group-hover:opacity-15 transition-opacity duration-300 rounded-2xl"></div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-10">
            <p className="text-2xl font-semibold text-white">{title}</p>
            <div className="flex justify-center items-center w-9 h-9 bg-gradient-to-r from-gold from-20% to-white/50 to-80% rounded-full">
              {/* Default: Arrow Up Right */}
              <BsArrowUpRightCircleFill className="w-7 h-7 text-white group-hover:hidden transition-all duration-300" />
              {/* Hover: Arrow Right */}
              <BsArrowRightCircleFill className="w-7 h-7 text-white hidden group-hover:block transition-all duration-300" />
            </div>
          </div>
          <p className="text-sm text-off-white">{body}</p>
        </div>
      </div>
    </div>
  );
}
