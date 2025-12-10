"use client"

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface NewArrivalProduct {
  _id?: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  order: number;
  isActive: boolean;
}

const NewArrival = () => {
  const [products, setProducts] = useState<NewArrivalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default fallback products
  const getDefaultProducts = (): NewArrivalProduct[] => [
    {
      title: "PlayStation 5",
      description: "Black and White version of the PS5 coming out on sale.",
      imageUrl: "/assets/new arrivals/ps5.png",
      link: "/category",
      order: 1,
      isActive: true,
    },
    {
      title: "Women's Collections",
      description: "Featured women collections that give you another vibe.",
      imageUrl: "/assets/new arrivals/womens collection.png",
      link: "/category",
      order: 2,
      isActive: true,
    },
    {
      title: "Speakers",
      description: "Amazon wireless speakers",
      imageUrl: "/assets/new arrivals/speaker.png",
      link: "/category",
      order: 3,
      isActive: true,
    },
    {
      title: "Sneakers",
      description: "GUCCI INTENSE OUD EDP",
      imageUrl: "/assets/new arrivals/shoes.png",
      link: "/category",
      order: 4,
      isActive: true,
    },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/new-arrivals');
        
        if (response.ok) {
          const data = await response.json();
          
          // If no products in database, show default products
          if (data.length === 0) {
            setProducts(getDefaultProducts());
          } else {
            setProducts(data);
          }
          setError(null);
        } else {
          console.error('Failed to fetch new arrival products');
          setError('Failed to load products');
          // Fallback to static data if API fails
          setProducts(getDefaultProducts());
        }
      } catch (error) {
        console.error('Error fetching new arrival products:', error);
        setError('Failed to load products');
        // Fallback to static data if API fails
        setProducts(getDefaultProducts());
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-6 md:py-10 w-full">
        <div className="mb-6">
          <span className="text-red-500 font-semibold uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-6 bg-red-500 rounded"></span> Featured
          </span>
          <h2 className="text-3xl font-bold mt-2">New Arrivals</h2>
        </div>
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          <span className="ml-2 text-gray-600">Loading products...</span>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 md:py-10 w-full">
      {/* Header */}
      <div className="mb-6">
        <span className="text-red-500 font-semibold uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-6 bg-red-500 rounded"></span> Featured
        </span>
        <h2 className="text-3xl font-bold mt-2">New Arrivals</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          {error} - Showing default products
        </div>
      )}

      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* First Product (Large Item) */}
        {products[0] && (
          <div className="relative group overflow-hidden rounded-lg md:col-span-2">
            <Image
              src={products[0].imageUrl}
              alt={products[0].title}
              width={600}
              height={450}
              className="w-full h-[250px] md:h-[450px] object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Overlay */}
            <div className="absolute inset-0 group-hover:bg-opacity-50 transition duration-300"></div>

            {/* Text & CTA */}
            <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 text-white z-10">
              <h3 className="text-xl md:text-2xl font-bold">{products[0].title}</h3>
              <p className="text-sm md:text-base mt-1">{products[0].description}</p>
              <Link
                href={products[0].link}
                className="mt-3 inline-block px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition"
              >
                Shop Now
              </Link>
            </div>
          </div>
        )}

        {/* Other Products (Stacked on Mobile, Grid on Desktop) */}
        <div className="flex flex-col gap-6">
          {/* Second Product */}
          {products[1] && (
            <div className="relative group overflow-hidden rounded-lg">
              <Image
                src={products[1].imageUrl}
                alt={products[1].title}
                width={400}
                height={275}
                className="w-full h-[200px] md:h-[275px] object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-lg md:text-xl font-semibold">{products[1].title}</h3>
                <p className="text-sm">{products[1].description}</p>
                <Link href={products[1].link} className="underline mt-2 block">
                  Shop Now
                </Link>
              </div>
            </div>
          )}

          {/* Remaining Products (Single Column on Mobile, Grid on Desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.slice(2).map((product, index) => (
              <div
                key={product._id || index}
                className="relative group overflow-hidden rounded-lg"
              >
                <Image
                  src={product.imageUrl}
                  alt={product.title}
                  width={400}
                  height={150}
                  className="w-full h-[200px] md:h-[150px] object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-lg md:text-xl font-semibold">{product.title}</h3>
                  <p className="text-sm">{product.description}</p>
                  <Link href={product.link} className="underline mt-2 block">
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
