"use client";
import Image from "next/image";
import { useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const products = [
  { id: 1, name: "Wireless Bluetooth Headphones", currentPrice: "Rs 2,999", originalPrice: "Rs 4,999", discount: "40% OFF", image: "/assets/products/1.png" },
  { id: 2, name: "DSLR Camera Professional", currentPrice: "Rs 45,999", originalPrice: "Rs 65,999", discount: "30% OFF", image: "/assets/products/2.png" },
  { id: 3, name: "Gaming Console Latest Gen", currentPrice: "Rs 35,999", originalPrice: "Rs 45,999", discount: "22% OFF", image: "/assets/products/3.png" },
  { id: 4, name: "Smart TV 55 Inch 4K", currentPrice: "Rs 25,999", originalPrice: "Rs 35,999", discount: "28% OFF", image: "/assets/products/5.png" },
  { id: 5, name: "Desktop Monitor 27 Inch", currentPrice: "Rs 15,999", originalPrice: "Rs 22,999", discount: "30% OFF", image: "/assets/products/6.png" },
  { id: 6, name: "Mechanical Keyboard RGB", currentPrice: "Rs 6,499", originalPrice: "Rs 8,499", discount: "24% OFF", image: "/assets/products/6.png" },
  { id: 7, name: "Smartphone Flagship Model", currentPrice: "Rs 65,999", originalPrice: "Rs 79,999", discount: "17% OFF", image: "/assets/products/6.png" },
  { id: 8, name: "Smartphone Flagship Model", currentPrice: "Rs 65,999", originalPrice: "Rs 79,999", discount: "17% OFF", image: "/assets/products/6.png" },
];

export default function Products() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-full my-8 relative">
      {/* Section Header */}
      <h2 className="text-3xl font-bold mb-6 border-b pb-3 border-gray-200 px-4 xl:px-8 2xl:px-4">
        Featured Section
      </h2>

      {/* Arrows */}
      <button
        onClick={() => scroll("left")}
        className="hidden md:flex items-center justify-center absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow hover:scale-105 transition"
      >
        <FaChevronLeft />
      </button>
      <button
        onClick={() => scroll("right")}
        className="hidden md:flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow hover:scale-105 transition"
      >
        <FaChevronRight />
      </button>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="overflow-x-auto px-4 xl:px-8 2xl:px-4 scrollbar-hide scroll-smooth"
      >
        <div className="flex gap-5 w-max">
          {products.map((product) => (
            <div
              key={product.id}
              className="min-w-[230px] max-w-[230px] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="relative w-full h-48 bg-gray-50 flex items-center justify-center p-4">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={160}
                  height={160}
                  className="object-contain max-w-full max-h-full"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    {product.discount}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <h3 className="text-sm font-medium text-gray-800 leading-tight line-clamp-2">
                  {product.name}
                </h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-orange-600">{product.currentPrice}</span>
                  </div>
                  <div className="text-sm text-gray-500 line-through">{product.originalPrice}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}