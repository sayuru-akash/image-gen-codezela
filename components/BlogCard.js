import Image from "next/image";
import Link from "next/link";

const VARIANT_STYLES = {
  default: {
    container: "min-h-[28rem]",
    image: "aspect-[3/2]",
    body: "gap-8 p-8",
    title: "text-2xl",
    excerpt: "text-base",
  },
  compact: {
    container: "min-h-[22rem]",
    image: "aspect-[4/3]",
    body: "gap-6 p-6",
    title: "text-xl",
    excerpt: "text-sm",
  },
};

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
  variant = "default",
  maxTitleLength = 90,
}) {
  const truncateWithEllipsis = (text, length) => {
    if (!text) return "";
    return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;
  };

  const {
    container: containerVariant,
    image: imageVariant,
    body: bodyVariant,
    title: titleVariant,
    excerpt: excerptVariant,
  } = VARIANT_STYLES[variant] ?? VARIANT_STYLES.default;

  const truncatedTitle = truncateWithEllipsis(title, maxTitleLength);
  const shouldShowExcerpt = !hideExcerpt && Boolean(excerpt);
  const truncatedExcerpt =
    shouldShowExcerpt && excerpt.length > maxExcerptLength
      ? `${excerpt.slice(0, maxExcerptLength).trimEnd()}…`
      : excerpt;

  const content = (
    <div
      className={`group flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.04] shadow-[0_25px_60px_rgba(6,8,20,0.55)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-gold/60 hover:bg-white/[0.08] ${containerVariant} ${className}`}
    >
      <div className={`relative w-full overflow-hidden ${imageVariant}`}>
        <Image
          src={image1}
          width={680}
          height={510}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-0"
        />
        <Image
          src={image2}
          width={680}
          height={510}
          alt={`${title} alternate`}
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#05070D] via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-60" />
      </div>

      <div className={`flex flex-1 flex-col justify-between ${bodyVariant}`}>
        <div className="space-y-3">
          {date && (
            <p className="text-xs uppercase tracking-[0.3em] text-gold/70">
              {date}
            </p>
          )}
          <h3
            className={`${titleVariant} font-semibold text-white leading-snug line-clamp-2`}
            title={title}
          >
            {truncatedTitle}
          </h3>
          {shouldShowExcerpt && (
            <p
              className={`${excerptVariant} leading-relaxed text-white/70 line-clamp-3`}
              title={excerpt}
            >
              {truncatedExcerpt}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.25em] text-white/45">
          {author && <span>{author}</span>}
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
