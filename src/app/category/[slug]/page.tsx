"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ShoppingCartIcon, StarIcon } from "@heroicons/react/24/solid";
import { ChevronDownIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { notFound } from 'next/navigation';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

const filters = {
  ratings: [5, 4, 3, 2, 1],
  discounts: ["0-10%", "10-20%", "20-30%", "30% and above"],
  brands: ["Brand A", "Brand B", "Brand C", "Brand D"],
  priceRanges: ["Under Rs. 1,000", "Rs. 1,000 - 5,000", "Rs. 5,000 - 10,000", "Above Rs. 10,000"],
};

// Category mapping with their display names and products
const categoryData: Record<string, { name: string; products: Product[] }> = {
  'home': {
    name: 'Home & Interior',
    products: [
      { id: 1, name: 'Modern Sofa Set', description: 'Comfortable 3-seater sofa perfect for modern homes', price: 45000, image: '/assets/products/1.png' },
      { id: 2, name: 'Dining Table', description: 'Elegant wooden dining table for 6 people', price: 32000, image: '/assets/products/2.png' },
      { id: 3, name: 'Floor Lamp', description: 'Stylish floor lamp with adjustable brightness', price: 8500, image: '/assets/products/3.png' },
      { id: 4, name: 'Wall Art Set', description: 'Beautiful canvas wall art collection', price: 5500, image: '/assets/products/4.png' },
    ]
  },
  'garden': {
    name: 'Garden & Outdoor',
    products: [
      { id: 5, name: 'Garden Chair Set', description: 'Weather-resistant outdoor furniture set', price: 25000, image: '/assets/products/5.png' },
      { id: 6, name: 'Plant Pot Collection', description: 'Ceramic pots for indoor and outdoor plants', price: 3500, image: '/assets/products/6.png' },
      { id: 7, name: 'Garden Tools Kit', description: 'Complete gardening tools for beginners', price: 4500, image: '/assets/products/1.png' },
      { id: 8, name: 'Outdoor Umbrella', description: 'Large patio umbrella with UV protection', price: 12000, image: '/assets/products/2.png' },
    ]
  },
  'shop': {
    name: 'General Shopping',
    products: [
      { id: 9, name: 'Shopping Bags Set', description: 'Reusable eco-friendly shopping bags', price: 1200, image: '/assets/products/3.png' },
      { id: 10, name: 'Storage Boxes', description: 'Stackable storage solution for home organization', price: 2800, image: '/assets/products/4.png' },
    ]
  },
  'gaming': {
    name: 'Gaming',
    products: [
      { id: 11, name: 'Gaming Chair', description: 'Ergonomic gaming chair with RGB lighting', price: 35000, image: '/assets/products/5.png' },
      { id: 12, name: 'Gaming Headset', description: 'Professional gaming headset with surround sound', price: 8500, image: '/assets/products/6.png' },
      { id: 13, name: 'Mechanical Keyboard', description: 'RGB mechanical keyboard for gaming', price: 12000, image: '/assets/products/1.png' },
    ]
  },
  'electronics': {
    name: 'Electronics',
    products: [
      { id: 14, name: 'Wireless Charger', description: 'Fast wireless charging pad for smartphones', price: 3500, image: '/assets/products/2.png' },
      { id: 15, name: 'Bluetooth Speaker', description: 'Portable Bluetooth speaker with premium sound', price: 7500, image: '/assets/products/3.png' },
    ]
  },
  'phones': {
    name: 'Phones & Accessories',
    products: [
      { id: 16, name: 'Phone Case', description: 'Protective case with wireless charging support', price: 2500, image: '/assets/products/4.png' },
      { id: 17, name: 'Screen Protector', description: 'Tempered glass screen protector', price: 800, image: '/assets/products/5.png' },
    ]
  },
  'sound-tv': {
    name: 'Sound & TV',
    products: [
      { id: 18, name: 'Soundbar', description: 'Premium soundbar with wireless subwoofer', price: 28000, image: '/assets/products/6.png' },
      { id: 19, name: 'TV Mount', description: 'Adjustable wall mount for TVs up to 65 inches', price: 4500, image: '/assets/products/1.png' },
    ]
  },
  'photography': {
    name: 'Photography',
    products: [
      { id: 20, name: 'Camera Tripod', description: 'Professional camera tripod with adjustable height', price: 8500, image: '/assets/products/2.png' },
      { id: 21, name: 'Camera Bag', description: 'Waterproof camera bag with multiple compartments', price: 5500, image: '/assets/products/3.png' },
    ]
  },
  'clothing': {
    name: 'Clothing & Fashion',
    products: [
      { id: 22, name: 'Winter Jacket', description: 'Warm winter jacket with weather protection', price: 6500, image: '/assets/products/4.png' },
      { id: 23, name: 'Casual Shirt', description: 'Comfortable cotton casual shirt', price: 2800, image: '/assets/products/5.png' },
    ]
  },
  'health': {
    name: 'Health & Wellness',
    products: [
      { id: 24, name: 'Yoga Mat', description: 'Non-slip yoga mat for exercise and meditation', price: 3200, image: '/assets/products/6.png' },
      { id: 25, name: 'Water Bottle', description: 'Insulated water bottle keeps drinks cold/hot', price: 1800, image: '/assets/products/1.png' },
    ]
  },
  'diy': {
    name: 'DIY & Tools',
    products: [
      { id: 26, name: 'Tool Kit', description: 'Complete tool kit for home repairs', price: 5500, image: '/assets/products/2.png' },
      { id: 27, name: 'Drill Set', description: 'Electric drill with various bits', price: 12000, image: '/assets/products/3.png' },
    ]
  },
  'sports': {
    name: 'Sports & Recreation',
    products: [
      { id: 28, name: 'Soccer Ball', description: 'Professional quality soccer ball', price: 2500, image: '/assets/products/4.png' },
      { id: 29, name: 'Tennis Racket', description: 'Lightweight tennis racket for beginners', price: 4500, image: '/assets/products/5.png' },
    ]
  },
  'automobiles': {
    name: 'Automobiles & Accessories',
    products: [
      { id: 30, name: 'Car Phone Mount', description: 'Magnetic car phone mount for dashboard', price: 1500, image: '/assets/products/6.png' },
      { id: 31, name: 'Car Charger', description: 'Fast charging car charger with dual USB ports', price: 2200, image: '/assets/products/1.png' },
    ]
  },
};

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const CategoryPage: React.FC<CategoryPageProps> = ({ params }) => {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedDiscount, setSelectedDiscount] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<number>(0);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [slug, setSlug] = useState<string>('');

  useEffect(() => {
    params.then(({ slug }) => setSlug(slug));
  }, [params]);

  const categoryInfo = categoryData[slug];
  
  if (!slug) {
    return <div>Loading...</div>;
  }
  
  if (!categoryInfo) {
    notFound();
  }

  const products = categoryInfo.products;

  const clearAllFilters = () => {
    setSelectedRating(null);
    setSelectedDiscount(null);
    setSelectedPrice(0);
    setSelectedBrand(null);
  };

  const filteredProducts = products.filter(product => {
    const matchesPrice = selectedPrice === 0 || product.price <= selectedPrice;
    // Add more filter logic here as needed
    return matchesPrice;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-black">{categoryInfo.name}</h1>
              <p className="text-gray-600 mt-1">{filteredProducts.length} products found</p>
            </div>
            
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
              <ChevronDownIcon className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside className={`${
            showFilters ? "block" : "hidden"
          } lg:block lg:w-80 flex-shrink-0`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-black">Filters</h2>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-gray-600 hover:text-black transition-colors"
                >
                  Clear All
                </button>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-black mb-4">Price Range</h3>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="1000"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    value={selectedPrice}
                    onChange={(e) => setSelectedPrice(Number(e.target.value))}
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Rs. 0</span>
                    <span className="font-medium text-black">Rs. {selectedPrice.toLocaleString()}</span>
                    <span>Rs. 50,000</span>
                  </div>
                </div>
              </div>

              {/* Brands */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-black mb-4">Brands</h3>
                <div className="space-y-3">
                  {filters.brands.map((brand) => (
                    <label key={brand} className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="brand"
                        className="w-4 h-4 text-black bg-gray-100 border-gray-300 focus:ring-black focus:ring-2"
                        checked={selectedBrand === brand}
                        onChange={() => setSelectedBrand(brand)}
                      />
                      <span className="ml-3 text-gray-700 group-hover:text-black transition-colors">
                        {brand}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Ratings */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-black mb-4">Ratings</h3>
                <div className="space-y-3">
                  {filters.ratings.map((rating) => (
                    <label key={rating} className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="rating"
                        className="w-4 h-4 text-black bg-gray-100 border-gray-300 focus:ring-black focus:ring-2"
                        checked={selectedRating === rating}
                        onChange={() => setSelectedRating(rating)}
                      />
                      <div className="ml-3 flex items-center">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-4 w-4 ${
                                i < rating ? "text-black" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600 group-hover:text-black transition-colors">
                          & above
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Discounts */}
              <div>
                <h3 className="text-lg font-medium text-black mb-4">Discounts</h3>
                <div className="space-y-3">
                  {filters.discounts.map((discount) => (
                    <label key={discount} className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="discount"
                        className="w-4 h-4 text-black bg-gray-100 border-gray-300 focus:ring-black focus:ring-2"
                        checked={selectedDiscount === discount}
                        onChange={() => setSelectedDiscount(discount)}
                      />
                      <span className="ml-3 text-gray-700 group-hover:text-black transition-colors">
                        {discount}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => {
                const matchesPrice = selectedPrice === 0 || product.price <= selectedPrice;
                const isHighlighted = selectedPrice > 0 && product.price <= selectedPrice;
                
                return (
                  <div
                    key={product.id}
                    className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group ${
                      !matchesPrice ? 'opacity-50' : ''
                    } ${isHighlighted ? 'ring-2 ring-black' : ''}`}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      {isHighlighted && (
                        <div className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded-full">
                          In Range
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-black mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-black">
                            Rs. {product.price.toLocaleString()}
                          </span>
                        </div>
                        
                        <button className="flex items-center justify-center w-10 h-10 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors group-hover:scale-105">
                          <ShoppingCartIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <ShoppingCartIcon className="text-2xl text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your filters to see more results.</p>
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CategoryPage;
