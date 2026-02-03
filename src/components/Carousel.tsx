"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

interface CarouselImage {
  _id?: string;
  id?: string;
  url: string;
  altText?: string;
  order: number;
  isActive: boolean;
}

// Fallback images in case database is empty or unavailable
const fallbackImages = [
  "/assets/banners/banner 1.png",
  "/assets/banners/banner 2.png",
  "/assets/banners/banner 3.png",
];

const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState<string[]>(fallbackImages);
  const [loading, setLoading] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Touch handlers for swipe functionality
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Swipe left - go to next image
      setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    }
    if (isRightSwipe) {
      // Swipe right - go to previous image
      setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
    }
  };

  // Navigation functions
  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  }, [images.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Pause autoplay on hover/touch
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  useEffect(() => {
    // Fetch carousel images from public API endpoint
    const fetchImages = async () => {
      try {
        const response = await fetch('/api/carousel');
        if (response.ok) {
          const carouselImages: CarouselImage[] = await response.json();
          // API already returns only active images sorted by order
          const imageUrls = carouselImages.map(img => img.url);
          
          if (imageUrls.length > 0) {
            setImages(imageUrls);
          }
        }
      } catch (error) {
        console.log('Using fallback images:', error)
        // Keep using fallback images
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  useEffect(() => {
    if (loading || !isAutoPlaying) return; // Don't start interval while loading or paused
    
    const interval = setInterval(() => {
      goToNext();
    }, 5000); // Reduced to 5 seconds for better mobile experience

    return () => clearInterval(interval);
  }, [images.length, loading, isAutoPlaying, goToNext]);

  if (loading) {
    return (
      <div className="relative w-full h-[25vh] sm:h-[30vh] md:h-[40vh] lg:h-[50vh] xl:h-[60vh] bg-gray-200 rounded-lg sm:rounded-xl flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  return (
    <div 
      ref={carouselRef}
      className="relative w-full overflow-hidden touch-pan-y"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides */}
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px]">
        {images.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              currentIndex === index ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Background Image with Dark Overlay */}
            <div className="absolute inset-0 bg-[#1E293B]">
              <Image
                src={img}
                alt={`Slide ${index + 1}`}
                fill
                className="object-cover opacity-60 select-none"
                priority={index === 0}
                sizes="100vw"
                draggable={false}
              />
            </div>

            {/* Gradient Overlay */}
            {/* <div className="absolute inset-0 bg-gradient-to-r from-[#1E293B]/90 via-[#1E293B]/60 to-transparent" /> */}

            {/* Content */}
            <div className="relative h-full max-w-[1800px] mx-auto px-6 lg:px-16 xl:px-24 flex items-center">
              <div className="max-w-2xl">
                {/* Live Auction Badge */}
                <div className="inline-flex items-center gap-2 bg-[#EF4444]/20 backdrop-blur-sm border border-[#EF4444]/30 rounded-full px-4 py-2 mb-6">
                  <span className="w-2 h-2 bg-[#EF4444] rounded-full animate-pulse" />
                  <span className="text-white text-sm font-medium tracking-wide">
                    LIVE AUCTION
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight">
                  Build Your Collection
                </h1>

                {/* Description */}
                <p className="text-base md:text-lg lg:text-xl text-gray-200 mb-8 leading-relaxed">
                  Discover exclusive vintage watches from top collectors worldwide
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap gap-4">
                  <Link href="/category">
                  <button className="px-6 md:px-8 py-3 md:py-4 bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                    Start Bidding
                  </button>
                  </Link>
                  <button className="px-6 md:px-8 py-3 md:py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-3 rounded-full transition-all duration-300 ${
                currentIndex === index
                  ? "bg-[#F59E0B] w-8"
                  : "bg-white/50 hover:bg-white/80 w-3"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroCarousel;