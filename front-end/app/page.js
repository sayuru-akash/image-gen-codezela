import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ServiceCard from "./components/ServiceCard";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col gradient-bg text-white">
      <Navbar />

      <div className="flex-grow flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-7xl mx-auto w-full text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
            Create Amazing Images with AI
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Unleash your creativity with our powerful image generation services
          </p>
        </div>

        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <ServiceCard
            title="Text to Image"
            description="Transform your ideas into stunning visuals with our AI-powered text-to-image generation"
            imageSrc="/images/img2.jpg"
            altText="Text to Image visualization"
            linkHref="/text-to-image"
            gradient="blue"
          />

          <ServiceCard
            title="Image Update"
            description="Enhance and modify existing images with text prompts for amazing transformations"
            imageSrc="/images/img1.jpg"
            altText="Image update visualization"
            linkHref="/image-update"
            gradient="pink"
          />
        </div>

        <div className="mt-16 max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Professional-Grade AI Image Generation
          </h2>
          <p className="text-gray-300">
            Whether you&apos;re creating marketing materials, concept art, or
            unique visuals for your project, our advanced AI tools deliver
            high-quality results in seconds.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
