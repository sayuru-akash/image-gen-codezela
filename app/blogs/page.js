import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import NavigationBar from "@/components/navigationbar";
import Articles from "@/data/articles.json";

export default function Blogs() {
  return (
    <>
      <div className="bg-black mb-10">
        <NavigationBar />
      </div>
      <div className="p-4 md:p-10 lg:p-20">
        <div className="bg-white/10 backdrop-blur-xs w-full h-84 rounded-4xl border border-white/30 p-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 bg-gradient-to-r from-dark-blue/90 from-5% to-gold/80 to-40% w-full h-full rounded-2xl">
            <div className="lg:col-span-1 flex items-center px-4 md:px-10">
              <h3 className="text-4xl md:text-5xl font-semibold text-white mb-6">
                Discover New Horizons with Advanced Models
              </h3>
            </div>

            <div className="hidden lg:block lg:col-span-1">
              <div className="relative w-full h-full overflow-hidden">
                <div className="absolute z-10 h-50 w-50 -bottom-10 left-35">
                  <BlogCard
                    image1="/images/image-12.jpg"
                    image2="/images/image-14.jpg"
                    title="Style Transfer"
                    body="Transform your photos by applying artistic styles from renowned paintings and artworks. Give your images a unique flair with just one click."
                    date="13 August 2025"
                    author="Rishad Ahamed"
                  />
                </div>
                <div className="absolute h-80 w-80 right-10 top-15">
                  <BlogCard
                    image1="/images/image-2.jpg"
                    image2="/images/image-14.jpg"
                    title="Style Transfer"
                    body="Transform your photos by applying artistic styles from renowned paintings and artworks. Give your images a unique flair with just one click."
                    date="13 August 2025"
                    author="Rishad Ahamed"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 md:px-10 lg:px-20 mb-10">
        {Articles.map((article) => (
          <BlogCard
            key={article.id}
            href={`/blogs/${article.id}`}
            image1={article.image1}
            image2={article.image2}
            title={article.title}
            body={article.body}
            date={article.date}
            author={article.author}
          />
        ))}
      </div>
      <Footer />
    </>
  );
}
