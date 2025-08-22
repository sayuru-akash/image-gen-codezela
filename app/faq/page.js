import FaqCard from "@/components/FaqCard";
import Footer from "@/components/Footer";
import NavigationBar from "@/components/navigationbar";
import Faqs from "@/data/faqs.json";

export default function Faq() {
  return (
    <>
      <div className="bg-black mb-10">
        <NavigationBar />
      </div>

      <div className="p-4 md:p-10 lg:p-20">
        <div className="bg-white/10 backdrop-blur-xs w-full h-84 rounded-4xl border border-white/30 p-3">
          <div className="bg-[url(/images/image-24.jpg)] bg-center bg-cover to-gold w-full h-full rounded-2xl">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-2 bg-gradient-to-r from-dark-blue/90 from-5% to-gold/80 to-40% w-full h-full rounded-2xl">
              <div className="col-span-3 grid items-center px-2 md:px-10">
                <h3 className="text-5xl md:text-6xl md:leading-16 font-semibold text-white mb-6">
                  Frequently Asked Questions
                </h3>
              </div>

              {/* Images */}
              <div className="hidden lg:block col-span-2 pl-20 pt-4">
                <div className="relative">
                  <div className="z-50 absolute top-16 bg-white/10 border border-white/30 p-2 backdrop-blur-xs rounded-3xl w-30 h-30">
                    <div className="bg-[url(/images/image-25.jpg)] bg-center bg-cover w-full h-full rounded-xl"></div>
                  </div>

                  <div className="z-40 absolute left-25 bg-white/10 border border-white/30 p-2 backdrop-blur-xs rounded-3xl w-40 h-40">
                    <div className="bg-[url(/images/image-24.jpg)] bg-center bg-cover w-full h-full rounded-xl"></div>
                  </div>

                  <div className="z-30 absolute left-20 top-20 bg-white/10 border border-white/30 p-2 backdrop-blur-xs rounded-3xl w-36 h-36">
                    <div className="bg-[url(/images/image-23.jpg)] bg-center bg-cover w-full h-full rounded-xl"></div>
                  </div>

                  <div className="z-30 absolute left-60 top-10 bg-white/10 border border-white/30 p-1 backdrop-blur-xs rounded-3xl w-20 h-20">
                    <div className="bg-[url(/images/image-12.jpg)] bg-center bg-cover w-full h-full rounded-3xl"></div>
                  </div>

                  <div className="z-10 absolute left-45 top-20 bg-white/10 border border-white/30 p-2 backdrop-blur-xs rounded-3xl w-44 h-44">
                    <div className="bg-[url(/images/image-11.jpg)] bg-center bg-cover w-full h-full rounded-2xl"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-20 lg:px-40 md:py-20 lg:py-10 grid gap-4">
        {Faqs.map((faq) => (
          <FaqCard key={faq.id} faq={faq}/>
        ))}
      </div>

      <Footer />
    </>
  );
}
