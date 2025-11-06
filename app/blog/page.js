import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import NavigationBar from "@/components/navigationbar";
import Signup from "@/components/Signup";
import articles from "@/data/articles";

export const metadata = {
  title: "Insights | kAIro AI Blog by Codezela Technologies",
  description:
    "Explore how brands use kAIro AI and Codezela Technologies to automate creative operations, launch personalised campaigns, and govern AI responsibly.",
  keywords: [
    "kAIro AI blog",
    "Codezela Technologies insights",
    "AI creative operations",
    "marketing automation case studies",
  ],
};

export default function BlogIndex() {
  return (
    <>
      <div className="bg-black">
        <NavigationBar />
      </div>

      <section className="px-4 pb-12 pt-16 md:px-10 lg:px-20">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-gold/80">
            Insights & resources
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
            Strategies for launching intelligent visuals with kAIro AI.
          </h1>
          <p className="mt-4 text-sm text-white/70 sm:text-base">
            Articles from Codezela Technologies covering creative automation, AI governance, and
            the workflows that help teams scale brand storytelling with confidence.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16 md:px-10 lg:px-20">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {articles.map((article) => (
            <BlogCard
              key={article.id}
              href={`/blog/${article.id}`}
              image1={article.image1}
              image2={article.image2}
              title={article.title}
              excerpt={article.excerpt}
              date={article.date}
              author={`${article.author} · ${article.readTime}`}
              maxExcerptLength={160}
            />
          ))}
        </div>
      </section>

      <div id="contact" className="scroll-mt-24">
        <Signup />
      </div>

      <Footer />
    </>
  );
}
