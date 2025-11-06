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
  hideExcerpt = false,
  maxExcerptLength = 140,
}) {
  const shouldShowExcerpt = !hideExcerpt && Boolean(excerpt);
  const truncatedExcerpt =
    shouldShowExcerpt && excerpt.length > maxExcerptLength
      ? `${excerpt.slice(0, maxExcerptLength).trimEnd()}…`
      : excerpt;

  const content = (
    <div
      className={`group cursor-pointer border border-gray-600 p-1 rounded-3xl h-96 bg-gray-900 transition-transform duration-300 hover:-translate-y-1 ${className}`}
    >
      <div className="flex h-full flex-col rounded-[1.4rem] bg-gray-900">
        <div className="relative h-48 overflow-hidden rounded-t-[1.4rem]">
          <Image
            src={image1}
            width={500}
            height={500}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-0"
          />
          <Image
            src={image2}
            width={500}
            height={500}
            alt={`${title} alternate`}
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        </div>

        <div className="flex flex-1 flex-col justify-between p-4">
          <div>
            <p className="mb-2 text-lg font-semibold text-white">{title}</p>
            {shouldShowExcerpt && (
              <p className="text-off-white text-sm leading-relaxed">
                {truncatedExcerpt}
              </p>
            )}
          </div>
          <div className="mt-6 flex flex-wrap gap-4 text-xs text-gray-400">
            {date && <p>• {date}</p>}
            {author && <p>• {author}</p>}
          </div>
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
