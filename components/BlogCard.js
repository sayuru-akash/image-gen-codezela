import Image from "next/image";
import Link from "next/link";

export default function BlogCard({
  href,
  image1,
  image2,
  title,
  excerpt,
  date,
  author,
  className = "",
}) {
  const content = (
    <div
      className={`group cursor-pointer border border-gray-600 p-1 rounded-3xl h-96 bg-gray-900 transition-transform duration-300 hover:-translate-y-1 ${className}`}
    >
      <div className="relative h-48 rounded-t-[1.4rem] overflow-hidden">
        <Image
          src={image1}
          width={500}
          height={500}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
        />
        <Image
          src={image2}
          width={500}
          height={500}
          alt={`${title} alternate`}
          className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
      </div>

      <div className="p-4">
        <p className="text-lg font-semibold text-white mb-2">{title}</p>
        <p className="text-off-white text-sm py-2 leading-relaxed line-clamp-3 overflow-y-auto scrollbar-hide">
          {excerpt}
        </p>
        <div className="flex gap-4 text-gray-400 text-xs mt-4">
          <p>• {date}</p>
          <p>• {author}</p>
        </div>
      </div>
    </div>
  );

  return href ? (
    <Link
      href={href}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/80 rounded-3xl"
    >
      {content}
    </Link>
  ) : (
    content
  );
}
