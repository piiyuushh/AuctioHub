"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

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
  "/assets/banners/banner 4.png",
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
      <div className="relative w-full h-[25vh] sm:h-[30vh] md:h-[40vh] lg:h-[50vh] xl:h-[60vh]">
        {images.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              currentIndex === index ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={img}
              alt={`Slide ${index + 1}`}
              fill
              className="object-cover rounded-lg sm:rounded-xl select-none"
              priority={index === 0}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, 100vw"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Navigation arrows - hidden on mobile, visible on desktop */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 sm:p-2 transition-all duration-200 opacity-0 sm:opacity-100 focus:opacity-100"
        aria-label="Previous slide"
      >
        <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={goToNext}
        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 sm:p-2 transition-all duration-200 opacity-0 sm:opacity-100 focus:opacity-100"
        aria-label="Next slide"
      >
        <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots - Hidden on mobile, visible on larger screens */}
      <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 hidden sm:flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 touch-manipulation ${
              currentIndex === index 
                ? "bg-white" 
                : "bg-white/60 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Mobile swipe indicator - only show on first load */}
      {images.length > 1 && (
        <div className="absolute top-2 right-2 sm:hidden">
          <div className="bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            Swipe
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroCarousel;