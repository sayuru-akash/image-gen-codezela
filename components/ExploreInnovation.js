import articles from "@/data/articles";
import { MdOutlineArrowLeft, MdOutlineArrowRight } from "react-icons/md";
import BlogCard from "./BlogCard";

export default function ExploreInnovation() {
  return (
    <div>
      <div className="flex justify-between">
        <h3 className="text-2xl md:text-5xl font-semibold text-left w-full lg:w-8/12 bg-gradient-to-r from-gold from-10% to-white to-90% bg-clip-text text-transparent">
          Fresh ideas from the kAIro AI and Codezela Technologies teams
        </h3>
        <div className="hidden lg:flex justify-end mt-auto">
          <div className="md:flex gap-2">
            <div className="flex justify-center items-center w-12 h-12 bg-gradient-to-r from-gold from-20% to-white/50 to-80% rounded-full hover:from-dark-blue hover:to-gold border border-gold transition-all cursor-pointer">
              <MdOutlineArrowLeft className="w-10 h-10 text-white transition-all duration-300" />
            </div>
            <div className="flex justify-center items-center w-12 h-12 bg-gradient-to-r from-gold from-20% to-white/50 to-80% rounded-full hover:from-dark-blue hover:to-gold border border-gold transition-all cursor-pointer">
              <MdOutlineArrowRight className="w-10 h-10 text-white transition-all duration-300" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-6 lg:py-20">
        {articles.slice(0, 4).map((article) => (
          <BlogCard
            key={article.id}
            href={`/blog/${article.id}`}
            image1={article.image1}
            image2={article.image2}
            title={article.title}
            excerpt={article.excerpt}
            date={article.date}
            author={article.author}
          />
        ))}
      </div>
    </div>
  );
}
