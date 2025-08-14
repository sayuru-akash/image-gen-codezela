import Image from "next/image";

export default function Gallery() {
  return (
    <div className="grid gap-3">
      {/* 1st Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="rounded-2xl h-72 w-full overflow-hidden group cursor-pointer">
          <Image
            alt="image"
            src="/images/image-15.jpg"
            width={600}
            height={600}
            className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
          />
        </div>
        <div className="rounded-2xl h-72 w-full overflow-hidden group cursor-pointer">
          <Image
            alt="image"
            src="/images/image-9.jpg"
            width={600}
            height={600}
            className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
          />
        </div>
        <div className="md:col-span-2 rounded-2xl h-72 w-full overflow-hidden group cursor-pointer">
          <Image
            alt="image"
            src="/images/image-11.jpg"
            width={600}
            height={600}
            className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
          />
        </div>
      </div>

      {/* 2nd Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-2xl h-110 w-full overflow-hidden group cursor-pointer">
          <Image
            alt="image"
            src="/images/image-16.jpg"
            width={600}
            height={600}
            className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
          />
        </div>
        <div className="grid gap-4">
          <div className="rounded-2xl h-53 w-full overflow-hidden group cursor-pointer">
            <Image
              alt="image"
              src="/images/image-17.jpg"
              width={600}
              height={600}
              className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
            />
          </div>
          <div className="rounded-2xl h-53 w-full overflow-hidden group cursor-pointer">
            <Image
              alt="image"
              src="/images/image-18.jpg"
              width={600}
              height={600}
              className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
            />
          </div>
        </div>
        <div className="rounded-2xl h-110 w-full overflow-hidden group cursor-pointer">
          <Image
            alt="image"
            src="/images/image-19.jpg"
            width={600}
            height={600}
            className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
          />
        </div>
      </div>

      {/* 3rd Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2 rounded-2xl h-72 w-full overflow-hidden group cursor-pointer">
          <Image
            alt="image"
            src="/images/image-14.jpg"
            width={600}
            height={600}
            className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
          />
        </div>
        <div className="rounded-2xl h-72 w-full overflow-hidden group cursor-pointer">
          <Image
            alt="image"
            src="/images/image-20.jpg"
            width={600}
            height={600}
            className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
          />
        </div>
        <div className="rounded-2xl h-72 w-full overflow-hidden group cursor-pointer">
          <Image
            alt="image"
            src="/images/image-12.jpg"
            width={600}
            height={600}
            className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
          />
        </div>
      </div>
    </div>
  );
}
