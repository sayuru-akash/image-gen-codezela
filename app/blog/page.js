import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import NavigationBar from "@/components/navigationbar";
import Signup from "@/components/Signup";
import { getPaginatedArticles } from "@/lib/articles";
import Link from "next/link";

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

export const revalidate = 60;

const PAGE_SIZE = 6;

function createPagePath(page) {
  return page === 1 ? "/blog" : `/blog?page=${page}`;
}

export default async function BlogIndex({ searchParams }) {
  const requestedPage = Number.parseInt(searchParams?.page ?? "1", 10);
  const initialPage =
    Number.isNaN(requestedPage) || requestedPage < 1 ? 1 : requestedPage;

  let pageData = await getPaginatedArticles({
    page: initialPage,
    pageSize: PAGE_SIZE,
  });

  if (
    pageData.pagination.totalPages > 0 &&
    initialPage > pageData.pagination.totalPages
  ) {
    pageData = await getPaginatedArticles({
      page: pageData.pagination.totalPages,
      pageSize: PAGE_SIZE,
    });
  }

  const { articles, pagination } = pageData;
  const safePage = pagination.page;
  const totalPages = pagination.totalPages;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

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
            Articles from Codezela Technologies covering AI image design, governance, and the workflows that help teams scale brand storytelling with confidence.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16 md:px-10 lg:px-20">
        {articles.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/70">
            No articles published yet. Check back soon for the latest from the kAIro AI team.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
              {articles.map((article) => (
                <BlogCard
                  key={article.id}
                  href={`/blog/${article.id}`}
                  image1={article.image1}
                  image2={article.image2}
                  title={article.title}
                  excerpt={article.excerpt}
                  date={article.date}
                  author={
                    article.readTime
                      ? `${article.author} · ${article.readTime}`
                      : article.author
                  }
                  maxExcerptLength={220}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                className="mt-14 flex flex-wrap items-center justify-center gap-3 text-sm"
                aria-label="Blog pagination"
              >
                {pagination.hasPreviousPage ? (
                  <Link
                    href={createPagePath(Math.max(1, safePage - 1))}
                    className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-white transition-all hover:border-gold hover:text-gold"
                  >
                    Previous
                  </Link>
                ) : (
                  <span className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-white/30">
                    Previous
                  </span>
                )}
                {pages.map((page) => {
                  const isActive = page === safePage;
                  return (
                    <Link
                      key={page}
                      href={createPagePath(page)}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all ${
                        isActive
                          ? "border-gold text-white shadow-[0_0_20px_rgba(212,175,55,0.35)]"
                          : "border-white/15 text-white/70 hover:border-gold hover:text-white"
                      }`}
                    >
                      {page}
                    </Link>
                  );
                })}
                {pagination.hasNextPage ? (
                  <Link
                    href={createPagePath(Math.min(totalPages, safePage + 1))}
                    className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-white transition-all hover:border-gold hover:text-gold"
                  >
                    Next
                  </Link>
                ) : (
                  <span className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-white/30">
                    Next
                  </span>
                )}
              </nav>
            )}
          </>
        )}
      </section>

      <div id="contact" className="scroll-mt-24">
        <Signup />
      </div>

      <Footer />
    </>
  );
}
