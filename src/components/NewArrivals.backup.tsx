import React from "react";
import Image from "next/image"; // Import Image from next/image
import Link from "next/link";

const products = [
  {
    title: "PlayStation 5",
    description: "Black and White version of the PS5 coming out on sale.",
    imageUrl: "/assets/new arrivals/ps5.png",
    link: "#",
  },
  {
    title: "Women’s Collections",
    description: "Featured women collections that give you another vibe.",
    imageUrl: "/assets/new arrivals/womens collection.png",
    link: "#",
  },
  {
    title: "Speakers",
    description: "Amazon wireless speakers",
    imageUrl: "/assets/new arrivals/speaker.png",
    link: "#",
  },
  {
    title: "Sneakers",
    description: "GUCCI INTENSE OUD EDP",
    imageUrl: "/assets/new arrivals/shoes.png",
    link: "#",
  },
];

const NewArrival = () => {
  return (
    <section className="py-6 md:py-10 w-full">
      {/* Header */}
      <div className="mb-6">
        <span className="text-red-500 font-semibold uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-6 bg-red-500 rounded"></span> Featured
        </span>
        <h2 className="text-3xl font-bold mt-2">New Arrivals</h2>
      </div>

      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PlayStation 5 (Large Item) */}
        <div className="relative group overflow-hidden rounded-lg md:col-span-2">
          <Image
            src={products[0].imageUrl}
            alt={products[0].title}
            width={600} // Add width for Image
            height={450} // Add height for Image
            className="w-full h-[250px] md:h-[450px] object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Overlay */}
          <div className="absolute inset-0 group-hover:bg-opacity-50 transition duration-300"></div>

          {/* Text & CTA */}
          <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 text-white z-10">
            <h3 className="text-xl md:text-2xl font-bold">{products[0].title}</h3>
            <p className="text-sm md:text-base mt-1">{products[0].description}</p>
            <Link
              href="/category"
              className="mt-3 inline-block px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition"
            >
              Shop Now
            </Link>
          </div>
        </div>

        {/* Other Products (Stacked on Mobile, Grid on Desktop) */}
        <div className="flex flex-col gap-6">
          {/* Women's Collection */}
          <div className="relative group overflow-hidden rounded-lg">
            <Image
              src={products[1].imageUrl}
              alt={products[1].title}
              width={400} // Add width for Image
              height={275} // Add height for Image
              className="w-full h-[200px] md:h-[275px] object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-lg md:text-xl font-semibold">{products[1].title}</h3>
              <p className="text-sm">{products[1].description}</p>
              <Link href="/category" className="underline mt-2 block">
                Shop Now
              </Link>
            </div>
          </div>

          {/* Speakers & Perfume (Single Column on Mobile, Grid on Desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.slice(2).map((product, index) => (
              <div
                key={index}
                className="relative group overflow-hidden rounded-lg"
              >
                <Image
                  src={product.imageUrl}
                  alt={product.title}
                  width={400} // Add width for Image
                  height={150} // Add height for Image
                  className="w-full h-[200px] md:h-[150px] object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-lg md:text-xl font-semibold">{product.title}</h3>
                  <p className="text-sm">{product.description}</p>
                  <Link href="/category" className="underline mt-2 block">
                    Shop Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewArrival;