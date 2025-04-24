import Link from "next/link";
import Image from "next/image";

export default function ServiceCard({
  title,
  description,
  imageSrc,
  altText,
  linkHref,
  gradient,
}) {
  return (
    <Link
      href={linkHref}
      className={`block w-full h-full rounded-xl overflow-hidden transition-all duration-300 card-hover ${
        gradient === "blue" ? "card-glow" : ""
      }`}
    >
      <div
        className={`h-full flex flex-col ${
          gradient === "blue" ? "gradient-bg" : "creative-gradient"
        } ${gradient === "pink" ? "brush-animation" : ""}`}
      >
        <div className="relative h-48 md:h-64">
          <Image
            src={imageSrc}
            alt={altText}
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
        <div className="p-6 flex-grow flex flex-col justify-between">
          <div>
            <h3 className="text-xl md:text-2xl font-bold mb-3 text-white">
              {title}
            </h3>
            <p className="text-gray-200">{description}</p>
          </div>
          <div className="mt-6">
            <span className="inline-block px-4 py-2 bg-opacity-20 bg-white text-white rounded-lg">
              Try Now →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
