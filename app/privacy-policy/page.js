import Footer from "@/components/Footer";
import NavigationBar from "@/components/navigationbar";
import Signup from "@/components/Signup";
import Image from "next/image";

export default function PrivacyPolicy() {
  return (
    <>
      <div className="bg-black mb-10">
        <NavigationBar />
      </div>
      <div className="p-4 md:p-10 lg:p-20">
        <div className="bg-white/10 backdrop-blur-xs w-full h-84 rounded-4xl border border-white/30 p-3">
          <div className="relative w-full h-full rounded-2xl overflow-hidden">
            <Image
              alt=""
              src="/images/image-21.jpg"
              fill
              className="object-cover"
              sizes="100vw"
              quality={60}
              priority
            />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 p-2 bg-gradient-to-r from-dark-blue/90 from-5% to-gold/80 to-40% w-full h-full rounded-2xl relative z-10">
              <div className="lg:col-span-3 flex items-center px-10">
                <div>
                  <h3 className="text-4xl font-semibold text-white mb-6">
                    Privacy & Policies
                  </h3>
                  <p className="text-sm text-off-white">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua.
                  </p>
                </div>
              </div>

              {/* Images */}
              <div className="hidden lg:block col-span-2 pl-20 pt-4">
                <div className="relative">
                  <div className="z-50 absolute top-16 bg-white/10 border border-white/30 p-2 backdrop-blur-xs rounded-3xl w-30 h-30">
                    <div className="relative w-full h-full">
                      <Image
                        alt=""
                        src="/images/image-21.jpg"
                        fill
                        className="rounded-xl object-cover"
                        sizes="15rem"
                        quality={60}
                      />
                    </div>
                  </div>

                  <div className="z-40 absolute left-25 bg-white/10 border border-white/30 p-2 backdrop-blur-xs rounded-3xl w-40 h-40">
                    <div className="relative w-full h-full">
                      <Image
                        alt=""
                        src="/images/image-22.jpg"
                        fill
                        className="rounded-xl object-cover"
                        sizes="20rem"
                        quality={60}
                      />
                    </div>
                  </div>

                  <div className="z-30 absolute left-20 top-20 bg-white/10 border border-white/30 p-2 backdrop-blur-xs rounded-3xl w-36 h-36">
                    <div className="relative w-full h-full">
                      <Image
                        alt=""
                        src="/images/image-23.jpg"
                        fill
                        className="rounded-xl object-cover"
                        sizes="18rem"
                        quality={60}
                      />
                    </div>
                  </div>

                  <div className="z-30 absolute left-60 top-10 bg-white/10 border border-white/30 p-1 backdrop-blur-xs rounded-3xl w-20 h-20">
                    <div className="relative w-full h-full">
                      <Image
                        alt=""
                        src="/images/image-12.jpg"
                        fill
                        className="rounded-3xl object-cover"
                        sizes="10rem"
                        quality={60}
                      />
                    </div>
                  </div>

                  <div className="z-10 absolute left-45 top-20 bg-white/10 border border-white/30 p-2 backdrop-blur-xs rounded-3xl w-44 h-44">
                    <div className="relative w-full h-full">
                      <Image
                        alt=""
                        src="/images/image-11.jpg"
                        fill
                        className="rounded-2xl object-cover"
                        sizes="22rem"
                        quality={60}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-10 lg:px-20 py-10 mb-20">
        <div className="bg-white/10 backdrop-blur-xs w-full rounded-4xl border border-white/30 p-3">
          <div className="bg-dark-blue rounded-2xl h-fit p-6">
            <h3 className="text-3xl font-semibold text-white mb-4">
              Privacy & Policies
            </h3>
            <p className="text-sm text-off-white md:w-1/2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>

            <div className="border border-secondary-accent rounded-2xl mt-6 p-4">
              <h3 className="text-xl font-semibold text-white mb-4">
                Privacy & Policies
              </h3>
              <p className="text-sm text-off-white mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
                in ex sodales, semper lectus eget, vestibulum magna. Nulla eu
                arcu id diam facilisis vehicula vestibulum vitae turpis.
                Phasellus turpis nisi, sagittis id nisi at, consectetur porta
                quam. Quisque et sapien leo. Mauris quis convallis nibh, vitae
                dictum leo. Morbi et est vulputate, feugiat leo quis, congue
                libero. Class aptent taciti sociosqu ad litora torquent per
                conubia nostra, per inceptos himenaeos. Nullam maximus
                consectetur gravida. Aliquam orci enim, ornare quis ante ut,
                aliquet blandit quam.
              </p>

              <h3 className="text-xl font-semibold text-white mb-4">
                Privacy & Policies
              </h3>
              <p className="text-sm text-off-white mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
                in ex sodales, semper lectus eget, vestibulum magna. Nulla eu
                arcu id diam facilisis vehicula vestibulum vitae turpis.
                Phasellus turpis nisi, sagittis id nisi at, consectetur porta
                quam. Quisque et sapien leo. Mauris quis convallis nibh, vitae
                dictum leo. Morbi et est vulputate, feugiat leo quis, congue
                libero. Class aptent taciti sociosqu ad litora torquent per
                conubia nostra, per inceptos himenaeos. Nullam maximus
                consectetur gravida. Aliquam orci enim, ornare quis ante ut,
                aliquet blandit quam.
              </p>
              <ul className="text-sm text-off-white list-disc px-4 mb-4">
                <li className="mb-2">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.{" "}
                </li>
                <li className="mb-2">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.{" "}
                </li>
                <li className="mb-2">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.{" "}
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-4">
                Privacy & Policies
              </h3>
              <p className="text-sm text-off-white mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
                in ex sodales, semper lectus eget, vestibulum magna. Nulla eu
                arcu id diam facilisis vehicula vestibulum vitae turpis.
                Phasellus turpis nisi, sagittis id nisi at, consectetur porta
                quam. Quisque et sapien leo. Mauris quis convallis nibh, vitae
                dictum leo. Morbi et est vulputate, feugiat leo quis, congue
                libero. Class aptent taciti sociosqu ad litora torquent per
                conubia nostra, per inceptos himenaeos. Nullam maximus
                consectetur gravida. Aliquam orci enim, ornare quis ante ut,
                aliquet blandit quam.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Signup />
      <Footer />
    </>
  );
}
