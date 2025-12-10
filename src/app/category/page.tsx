"use client";
import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { 
  ShoppingCartIcon, 
  StarIcon, 
  MagnifyingGlassIcon,
  XMarkIcon,
  HeartIcon,
  EyeIcon,
  Bars3Icon
} from "@heroicons/react/24/solid";
import { 
  Squares2X2Icon,
  ListBulletIcon
} from "@heroicons/react/24/outline";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";

const filters = {
  categories: ["Home & Interior", "Garden", "Technology", "Toys", "Gaming", "Fashion", "Books", "Sports"],
  ratings: [5, 4, 3, 2, 1],
  discounts: ["0-10%", "10-20%", "20-30%", "30% and above"],
  sortOptions: [
    { value: "relevance", label: "Most Relevant" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "name", label: "Name A-Z" },
    { value: "rating", label: "Highest Rated" }
  ]
};

const products = [...Array(12)].map((_, index) => ({
  id: index + 1,
  name: `Premium Product ${index + 1}`,
  description: `High-quality product with excellent features and modern design. Perfect for daily use.`,
  price: 1000 + (index * 500),
  originalPrice: 1200 + (index * 600),
  image: `/assets/products/${(index % 6) + 1}.png`,
  rating: 3 + Math.floor(Math.random() * 3),
  discount: Math.floor(Math.random() * 40) + 10,
  inStock: Math.random() > 0.2,
  category: filters.categories[index % filters.categories.length],
  isNew: index < 3,
  isFeatured: index % 4 === 0
}));

const CategoryPage: React.FC = () => {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedDiscount, setSelectedDiscount] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<number>(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);

  // Prevent body scroll when filter menu is open
  useEffect(() => {
    if (showFilters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showFilters]);

  // Enhanced search and filter logic
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product =>
        selectedCategories.includes(product.category)
      );
    }

    // Price filter
    if (selectedPrice > 0) {
      filtered = filtered.filter(product => product.price <= selectedPrice);
    }

    // Rating filter
    if (selectedRating) {
      filtered = filtered.filter(product => product.rating >= selectedRating);
    }

    // Discount filter
    if (selectedDiscount) {
      const [min, max] = selectedDiscount.split('-').map(s => parseInt(s.replace('%', '').replace(' and above', '')));
      filtered = filtered.filter(product => {
        if (selectedDiscount.includes('and above')) {
          return product.discount >= min;
        }
        return product.discount >= min && product.discount <= (max || min + 10);
      });
    }

    // Stock filter
    if (showOnlyInStock) {
      filtered = filtered.filter(product => product.inStock);
    }

    // Sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Keep original order for relevance
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategories, selectedPrice, selectedRating, selectedDiscount, showOnlyInStock, sortBy]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearAllFilters = () => {
    setSelectedRating(null);
    setSelectedDiscount(null);
    setSelectedPrice(0);
    setSelectedCategories([]);
    setSearchQuery("");
    setShowOnlyInStock(false);
  };

  const activeFiltersCount = 
    (selectedRating ? 1 : 0) +
    (selectedDiscount ? 1 : 0) +
    (selectedPrice > 0 ? 1 : 0) +
    selectedCategories.length +
    (showOnlyInStock ? 1 : 0);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero Section with Enhanced Search */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="container mx-auto px-4 xl:px-8 2xl:px-0 2xl:max-w-[1800px] 2xl:mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-black mb-4">
              Explore Our Products
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Find exactly what you&apos;re looking for from our curated collection of quality products
            </p>
            
            {/* Enhanced Search Bar - Using SearchBar Component */}
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search products, categories, or brands..."
              size="large"
              className="max-w-2xl mx-auto"
              showResults={true}
              results={searchQuery.length > 0 ? filteredProducts.slice(0, 5) : []}
              renderResult={(product) => (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 relative flex-shrink-0">
                    <Image
                      src={product.image || '/assets/products/1.png'}
                      alt={product.name || 'Product'}
                      fill
                      className="object-cover rounded-lg"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-black text-sm truncate">{product.name}</p>
                    <p className="text-xs text-gray-500 truncate">{product.category || ''}</p>
                    <div className="flex items-center mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-3 w-3 ${
                              i < (product.rating || 0) ? "text-black" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-1 text-xs text-gray-500">({product.rating || 0})</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-black text-sm">Rs. {(product.price || 0).toLocaleString()}</p>
                    {(product.discount || 0) > 0 && (
                      <p className="text-xs text-gray-500 line-through">
                        Rs. {(product.originalPrice || 0).toLocaleString()}
                      </p>
                    )}
                    {product.inStock === false && (
                      <p className="text-xs text-red-500 font-medium">Out of Stock</p>
                    )}
                  </div>
                </div>
              )}
            />
          </div>
        </div>
      </section>

      {/* Enhanced Filter & Sort Bar */}
      <section className="bg-white border-b border-gray-200 sticky top-[73px] z-40">
        <div className="container mx-auto px-4 xl:px-8 2xl:px-0 2xl:max-w-[1800px] 2xl:mx-auto py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Hamburger Filter Menu Button - Works on both PC and Mobile */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 group shadow-sm"
              >
                <Bars3Icon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="ml-2 bg-white text-black text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Quick Filter Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                {selectedCategories.map((category) => (
                  <span key={category} className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full border">
                    {category}
                    <button
                      onClick={() => toggleCategory(category)}
                      className="ml-2 text-gray-600 hover:text-black transition-colors"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                
                {selectedRating && (
                  <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full border">
                    {selectedRating}+ Stars
                    <button
                      onClick={() => setSelectedRating(null)}
                      className="ml-2 text-gray-600 hover:text-black transition-colors"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                
                {selectedDiscount && (
                  <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full border">
                    {selectedDiscount} off
                    <button
                      onClick={() => setSelectedDiscount(null)}
                      className="ml-2 text-gray-600 hover:text-black transition-colors"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                
                {selectedPrice > 0 && (
                  <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full border">
                    Under Rs. {selectedPrice.toLocaleString()}
                    <button
                      onClick={() => setSelectedPrice(0)}
                      className="ml-2 text-gray-600 hover:text-black transition-colors"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                
                {showOnlyInStock && (
                  <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full border">
                    In Stock Only
                    <button
                      onClick={() => setShowOnlyInStock(false)}
                      className="ml-2 text-gray-600 hover:text-black transition-colors"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-gray-600 hover:text-black underline font-medium"
                  >
                    Clear all ({activeFiltersCount})
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-colors ${
                    viewMode === "grid" ? "bg-black text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Squares2X2Icon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-colors ${
                    viewMode === "list" ? "bg-black text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <ListBulletIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white text-black text-sm min-w-0"
              >
                {filters.sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Results Count */}
              <span className="text-sm text-gray-600 whitespace-nowrap hidden lg:block">
                {filteredProducts.length} of {products.length}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 xl:px-8 2xl:px-0 2xl:max-w-[1800px] 2xl:mx-auto py-8">
        <div className="relative">
          {/* Enhanced Hamburger Filter Menu Overlay - Works on PC and Mobile */}
          <div
            className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
              showFilters ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setShowFilters(false)}
          >
            {/* Filter Panel - Responsive width */}
            <div
              className={`absolute top-0 left-0 w-full sm:w-96 lg:w-[400px] max-w-[90vw] h-full bg-white shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto ${
                showFilters ? "translate-x-0" : "-translate-x-full"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Filter Menu Header */}
              <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-black">Filters</h2>
                  <p className="text-sm text-gray-600">
                    {activeFiltersCount} active filter{activeFiltersCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 rounded-full hover:bg-gray-200 transition-colors touch-manipulation"
                  aria-label="Close filters"
                >
                  <XMarkIcon className="h-6 w-6 text-gray-600" />
                </button>
              </div>

              {/* Filter Menu Content */}
              <div className="p-4 lg:p-6 space-y-6 lg:space-y-8">
                {/* Quick Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={clearAllFilters}
                    disabled={activeFiltersCount === 0}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:border-black hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium touch-manipulation"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex-1 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium touch-manipulation"
                  >
                    Apply Filters
                  </button>
                </div>

                {/* In Stock Toggle */}
                <div className="pb-6 border-b border-gray-100">
                  <label className="flex items-center justify-between cursor-pointer group touch-manipulation">
                    <div>
                      <span className="text-black font-semibold text-base lg:text-lg">Show only in stock</span>
                      <p className="text-sm text-gray-500">Hide out of stock items</p>
                    </div>
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 lg:w-6 lg:h-6 text-black bg-white border-2 border-gray-300 rounded focus:ring-black focus:ring-2"
                      checked={showOnlyInStock}
                      onChange={(e) => setShowOnlyInStock(e.target.checked)}
                    />
                  </label>
                </div>

                {/* Categories */}
                <div className="pb-6 border-b border-gray-100">
                  <h3 className="font-bold text-black mb-6 text-lg">Categories</h3>
                  <div className="space-y-4 max-h-48 overflow-y-auto">
                    {filters.categories.map((category, index) => (
                      <label key={index} className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            className="w-5 h-5 text-black bg-white border-2 border-gray-300 rounded focus:ring-black focus:ring-2"
                            checked={selectedCategories.includes(category)}
                            onChange={() => toggleCategory(category)}
                          />
                          <span className="ml-3 text-gray-700 group-hover:text-black transition-colors font-medium">
                            {category}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {products.filter(p => p.category === category).length}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="pb-6 border-b border-gray-100">
                  <h3 className="font-bold text-black mb-6 text-lg">Price Range</h3>
                  <div className="space-y-4">
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="500"
                      className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      value={selectedPrice}
                      onChange={(e) => setSelectedPrice(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-600">Rs. 0</span>
                      <span className="px-3 py-1 bg-black text-white rounded-lg text-sm">
                        Rs. {selectedPrice === 0 ? "Any" : selectedPrice.toLocaleString()}
                      </span>
                      <span className="text-gray-600">Rs. 10,000+</span>
                    </div>
                    {selectedPrice > 0 && (
                      <p className="text-sm text-gray-600 text-center">
                        Showing products up to Rs. {selectedPrice.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Customer Rating */}
                <div className="pb-6 border-b border-gray-100">
                  <h3 className="font-bold text-black mb-6 text-lg">Customer Rating</h3>
                  <div className="space-y-4">
                    {filters.ratings.map((rating) => (
                      <label key={rating} className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="rating"
                            className="w-5 h-5 text-black bg-white border-2 border-gray-300 focus:ring-black focus:ring-2"
                            checked={selectedRating === rating}
                            onChange={() => setSelectedRating(rating)}
                          />
                          <div className="ml-3 flex items-center">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon
                                  key={i}
                                  className={`h-5 w-5 ${
                                    i < rating ? "text-black" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="ml-2 text-gray-700 text-sm font-medium">& up</span>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {products.filter(p => p.rating >= rating).length}
                        </span>
                      </label>
                    ))}
                    {selectedRating && (
                      <button
                        onClick={() => setSelectedRating(null)}
                        className="text-sm text-gray-600 hover:text-black underline"
                      >
                        Clear rating filter
                      </button>
                    )}
                  </div>
                </div>

                {/* Discount Range */}
                <div className="pb-6">
                  <h3 className="font-bold text-black mb-6 text-lg">Discount Range</h3>
                  <div className="space-y-4">
                    {filters.discounts.map((discount) => (
                      <label key={discount} className="flex items-center cursor-pointer group">
                        <input
                          type="radio"
                          name="discount"
                          className="w-5 h-5 text-black bg-white border-2 border-gray-300 focus:ring-black focus:ring-2"
                          checked={selectedDiscount === discount}
                          onChange={() => setSelectedDiscount(discount)}
                        />
                        <span className="ml-3 text-gray-700 group-hover:text-black transition-colors font-medium">
                          {discount} off
                        </span>
                      </label>
                    ))}
                    {selectedDiscount && (
                      <button
                        onClick={() => setSelectedDiscount(null)}
                        className="text-sm text-gray-600 hover:text-black underline"
                      >
                        Clear discount filter
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Filter Menu Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
                  >
                    Show {filteredProducts.length} Products
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <main className="w-full">
            {/* Search Results Info */}
            {searchQuery && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-black mb-1">
                  Search results for &quot;{searchQuery}&quot;
                </h3>
                <p className="text-sm text-gray-600">
                  {filteredProducts.length} products found
                </p>
              </div>
            )}

            {/* Products */}
            {filteredProducts.length > 0 ? (
              <div className={`${
                viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6" 
                  : "space-y-4"
              }`}>
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-300 group ${
                      viewMode === "list" ? "flex" : ""
                    }`}
                  >
                    {/* Product Image */}
                    <div className={`relative ${
                      viewMode === "list" ? "w-48 h-48 flex-shrink-0" : "aspect-square"
                    }`}>
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes={viewMode === "list" ? "192px" : "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"}
                      />
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.isNew && (
                          <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded">
                            NEW
                          </span>
                        )}
                        {product.discount > 0 && (
                          <span className="bg-white text-black text-xs font-bold px-2 py-1 rounded border border-gray-300">
                            -{product.discount}%
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-md border border-gray-200">
                          <HeartIcon className="h-4 w-4 text-gray-600" />
                        </button>
                        <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-md border border-gray-200">
                          <EyeIcon className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>

                      {/* Out of Stock Overlay */}
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                          <span className="bg-white text-black text-sm font-bold px-4 py-2 rounded-lg">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-4 flex-1">
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">{product.category}</p>
                        <h3 className="font-bold text-black text-sm mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors">
                          {product.name}
                        </h3>
                        {viewMode === "list" && (
                          <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                            {product.description}
                          </p>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="flex items-center mb-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-4 w-4 ${
                                i < product.rating ? "text-black" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-xs text-gray-600 font-medium">({product.rating})</span>
                      </div>
                      
                      {/* Price and Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-black">
                              Rs. {product.price.toLocaleString()}
                            </span>
                            {product.discount > 0 && (
                              <span className="text-sm text-gray-500 line-through">
                                Rs. {product.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {product.inStock ? (
                              <span className="text-xs text-green-600 font-medium">✓ In Stock</span>
                            ) : (
                              <span className="text-xs text-red-600 font-medium">✗ Out of Stock</span>
                            )}
                            {product.discount > 0 && (
                              <span className="text-xs text-green-600 font-medium">
                                Save Rs. {(product.originalPrice - product.price).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <button 
                          disabled={!product.inStock}
                          className="w-10 h-10 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center group-hover:scale-105 ml-3"
                        >
                          <ShoppingCartIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Enhanced No Results State */
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <MagnifyingGlassIcon className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">
                  No products found
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {searchQuery 
                    ? `No results for &quot;${searchQuery}&quot;. Try different keywords or adjust your filters.`
                    : "No products match your current filters. Try adjusting them to see more results."
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                    >
                      Clear Search
                    </button>
                  )}
                  <button
                    onClick={clearAllFilters}
                    className="px-6 py-3 border-2 border-gray-300 text-black rounded-lg hover:border-black transition-colors font-medium"
                  >
                    Clear All Filters
                  </button>
                </div>
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
