import ExploreInnovation from "@/components/ExploreInnovation";
import Footer from "@/components/Footer";
import NavigationBar from "@/components/navigationbar";
import Signup from "@/components/Signup";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllArticles, getArticleBySlug } from "@/lib/articles";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const articles = await getAllArticles();
    return articles
      .filter((article) => article && article.id)
      .map((article) => ({ id: article.id }));
  } catch (error) {
    console.warn(
      "Failed to generate static params for blog articles:",
      error.message
    );
    return [];
  }
}

export async function generateMetadata({ params }) {
  const article = await getArticleBySlug(params.id);
  if (!article) {
    return {
      title: "kAIro AI Insights | Codezela Technologies",
    };
  }

  return {
    title: `${article.title} | kAIro AI Insights`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [
        {
          url: article.heroImage || article.image1,
          width: 1200,
          height: 630,
          alt: `${article.title} hero image`,
        },
      ],
    },
  };
}

export default async function BlogArticle({ params }) {
  const article = await getArticleBySlug(params.id);

  if (!article) {
    notFound();
  }

  return (
    <>
      <div className="bg-black">
        <NavigationBar />
      </div>

      <article className="mx-auto my-16 w-11/12 max-w-4xl">
        <div className="relative mb-10 h-80 overflow-hidden rounded-4xl border border-white/20">
          <Image
            alt={article.title}
            src={article.heroImage || article.image1}
            fill
            className="object-cover"
            priority
          />
        </div>

        <h1 className="text-4xl font-semibold text-white sm:text-5xl">
          {article.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-white/70">
          <div>
            <p>
              By <span className="text-white">{article.author}</span>
            </p>
            <p>
              {article.date} · {article.readTime}
            </p>
          </div>
          <Link
            href="https://codezela.com/contact"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/30 px-4 py-2 text-white transition-colors duration-200 hover:border-gold hover:text-gold"
          >
            Talk to Codezela Technologies
          </Link>
        </div>

        <p className="mt-6 text-base text-white/75">{article.excerpt}</p>

        {article.sections.map((section) => (
          <section key={section.heading} className="mt-10">
            <h2 className="text-2xl font-semibold text-white">
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="mt-4 text-base leading-relaxed text-white/75"
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </article>

      <section className="bg-black px-4 py-16 md:px-10 lg:px-20">
        <ExploreInnovation />
        <hr className="mt-10 border border-off-white/20" />
      </section>

      <div id="contact" className="scroll-mt-24">
        <Signup />
      </div>

      <Footer />
    </>
  );
}
