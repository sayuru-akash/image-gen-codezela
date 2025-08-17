import Footer from "@/components/Footer";
import InnovationCard from "@/components/InnovationCard";
import NavigationBar from "@/components/navigationbar";

export default function Blog() {
  const Innvoations = [
    {
      id: "1",
      image1: "/images/image-2.jpg",
      image2: "/images/image-14.jpg",
      title: "Style Transfer",
      body: "Transform your photos by applying artistic styles from renowned paintings and artworks. Give your images a unique flair with just one click.",
      date: "13 August 2025",
      author: "Rishad Ahamed",
    },
    {
      id: "2",
      image1: "/images/image-11.jpg",
      image2: "/images/image-14.jpg",
      title: "Style Transfer",
      body: "Transform your photos by applying artistic styles from renowned paintings and artworks. Give your images a unique flair with just one click.",
      date: "13 August 2025",
      author: "Rishad Ahamed",
    },
    {
      id: "3",
      image1: "/images/image-12.jpg",
      image2: "/images/image-14.jpg",
      title: "Style Transfer",
      body: "Transform your photos by applying artistic styles from renowned paintings and artworks. Give your images a unique flair with just one click.",
      date: "13 August 2025",
      author: "Rishad Ahamed",
    },
    {
      id: "4",
      image1: "/images/image-13.png",
      image2: "/images/image-14.jpg",
      title: "Style Transfer",
      body: "Transform your photos by applying artistic styles from renowned paintings and artworks. Give your images a unique flair with just one click.",
      date: "13 August 2025",
      author: "Rishad Ahamed",
    },
    {
      id: "5",
      image1: "/images/image-2.jpg",
      image2: "/images/image-14.jpg",
      title: "Style Transfer",
      body: "Transform your photos by applying artistic styles from renowned paintings and artworks. Give your images a unique flair with just one click.",
      date: "13 August 2025",
      author: "Rishad Ahamed",
    },
    {
      id: "6",
      image1: "/images/image-11.jpg",
      image2: "/images/image-14.jpg",
      title: "Style Transfer",
      body: "Transform your photos by applying artistic styles from renowned paintings and artworks. Give your images a unique flair with just one click.",
      date: "13 August 2025",
      author: "Rishad Ahamed",
    },
    {
      id: "7",
      image1: "/images/image-12.jpg",
      image2: "/images/image-14.jpg",
      title: "Style Transfer",
      body: "Transform your photos by applying artistic styles from renowned paintings and artworks. Give your images a unique flair with just one click.",
      date: "13 August 2025",
      author: "Rishad Ahamed",
    },
    {
      id: "8",
      image1: "/images/image-13.png",
      image2: "/images/image-14.jpg",
      title: "Style Transfer",
      body: "Transform your photos by applying artistic styles from renowned paintings and artworks. Give your images a unique flair with just one click.",
      date: "13 August 2025",
      author: "Rishad Ahamed",
    },
    {
      id: "9",
      image1: "/images/image-2.jpg",
      image2: "/images/image-14.jpg",
      title: "Style Transfer",
      body: "Transform your photos by applying artistic styles from renowned paintings and artworks. Give your images a unique flair with just one click.",
      date: "13 August 2025",
      author: "Rishad Ahamed",
    },
    {
      id: "10",
      image1: "/images/image-11.jpg",
      image2: "/images/image-14.jpg",
      title: "Style Transfer",
      body: "Transform your photos by applying artistic styles from renowned paintings and artworks. Give your images a unique flair with just one click.",
      date: "13 August 2025",
      author: "Rishad Ahamed",
    },
    {
      id: "11",
      image1: "/images/image-12.jpg",
      image2: "/images/image-14.jpg",
      title: "Style Transfer",
      body: "Transform your photos by applying artistic styles from renowned paintings and artworks. Give your images a unique flair with just one click.",
      date: "13 August 2025",
      author: "Rishad Ahamed",
    },
    {
      id: "12",
      image1: "/images/image-13.png",
      image2: "/images/image-14.jpg",
      title: "Style Transfer",
      body: "Transform your photos by applying artistic styles from renowned paintings and artworks. Give your images a unique flair with just one click.",
      date: "13 August 2025",
      author: "Rishad Ahamed",
    },
    {
      id: "13",
      image1: "/images/image-2.jpg",
      image2: "/images/image-14.jpg",
      title: "Style Transfer",
      body: "Transform your photos by applying artistic styles from renowned paintings and artworks. Give your images a unique flair with just one click.",
      date: "13 August 2025",
      author: "Rishad Ahamed",
    },
    {
      id: "14",
      image1: "/images/image-11.jpg",
      image2: "/images/image-14.jpg",
      title: "Style Transfer",
      body: "Transform your photos by applying artistic styles from renowned paintings and artworks. Give your images a unique flair with just one click.",
      date: "13 August 2025",
      author: "Rishad Ahamed",
    },
    {
      id: "15",
      image1: "/images/image-12.jpg",
      image2: "/images/image-14.jpg",
      title: "Style Transfer",
      body: "Transform your photos by applying artistic styles from renowned paintings and artworks. Give your images a unique flair with just one click.",
      date: "13 August 2025",
      author: "Rishad Ahamed",
    },
    {
      id: "16",
      image1: "/images/image-13.png",
      image2: "/images/image-14.jpg",
      title: "Style Transfer",
      body: "Transform your photos by applying artistic styles from renowned paintings and artworks. Give your images a unique flair with just one click.",
      date: "13 August 2025",
      author: "Rishad Ahamed",
    },
  ];

  return (
    <>
      <div className="bg-black mb-10">
        <NavigationBar />
      </div>
      <div className="p-4 md:p-20">
        <div className="bg-white/10 backdrop-blur-xs w-full h-84 rounded-4xl border border-white/30 p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gradient-to-r from-dark-blue/90 from-5% to-gold/80 to-40% w-full h-full rounded-2xl">
            <div className="md:col-span-1 flex items-center px-4 md:px-10">
              <h3 className="text-4xl md:text-5xl font-semibold text-white mb-6">
                Discover New Horizons with Advanced Models
              </h3>
            </div>

            {/* Images */}
            <div className="hidden md:block md:col-span-1">
              <div className="relative w-full h-full overflow-hidden">
                <div className="absolute z-10 h-50 w-50 -bottom-10 left-35">
                  <InnovationCard
                    image1="/images/image-12.jpg"
                    image2="/images/image-14.jpg"
                    title="Style Transfer"
                    body="Transform your photos by applying artistic styles from renowned paintings and artworks. Give your images a unique flair with just one click."
                    date="13 August 2025"
                    author="Rishad Ahamed"
                  />
                </div>
                <div className="absolute h-80 w-80 right-10 top-15">
                  <InnovationCard
                    image1="/images/image-2.jpg"
                    image2="/images/image-14.jpg"
                    title="Style Transfer"
                    body="Transform your photos by applying artistic styles from renowned paintings and artworks. Give your images a unique flair with just one click."
                    date="13 August 2025"
                    author="Rishad Ahamed"
                  />
                </div>
                {/* <InnovationCard
                  image1="/images/image-2.jpg"
                  image2="/images/image-14.jpg"
                  title="Style Transfer"
                  body="Transform your photos by applying artistic styles from renowned paintings and artworks. Give your images a unique flair with just one click."
                  date="13 August 2025"
                  author="Rishad Ahamed"
                /> */}

                {/* {Innvoations.map((innovation) => (
                  <InnovationCard
                    key={innovation.id}
                    image1={innovation.image1}
                    image2={innovation.image2}
                    title={innovation.title}
                    body={innovation.body}
                    date={innovation.date}
                    author={innovation.author}
                  />
                ))} */}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 md:px-20 mb-10">
        {Innvoations.map((innovation) => (
          <InnovationCard
            key={innovation.id}
            image1={innovation.image1}
            image2={innovation.image2}
            title={innovation.title}
            body={innovation.body}
            date={innovation.date}
            author={innovation.author}
          />
        ))}
      </div>
      <Footer />
    </>
  );
}
