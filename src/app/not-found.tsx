"use client";
import Link from "next/link";
import { FaHome, FaArrowLeft, FaGavel, FaSearch } from "react-icons/fa";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F6F4EB' }}>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-20 animate-float" style={{ backgroundColor: '#91C8E4' }}></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full opacity-15 animate-float-delayed" style={{ backgroundColor: '#749BC2' }}></div>
        <div className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full opacity-10 animate-float-slow" style={{ backgroundColor: '#4682A9' }}></div>

        <div className="relative z-10 text-center">
          {/* Auction Gavel Icon */}
          <div className="mb-8 inline-block">
            <div className="relative">
              <div className="absolute inset-0 animate-ping opacity-20 rounded-full" style={{ backgroundColor: '#4682A9' }}></div>
              <div className="relative w-24 h-24 mx-auto rounded-full flex items-center justify-center" 
                   style={{ background: 'linear-gradient(135deg, #91C8E4 0%, #4682A9 100%)' }}>
                <FaGavel className="text-4xl text-white animate-swing" />
              </div>
            </div>
          </div>

          {/* 404 Text */}
          <div className="relative">
            <h1 className="text-[140px] font-extrabold leading-none animate-fade-in"
                style={{ 
                  background: 'linear-gradient(135deg, #749BC2 0%, #4682A9 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
              404
            </h1>
            <div className="absolute inset-0 text-[140px] font-extrabold leading-none opacity-10"
                 style={{ color: '#91C8E4' }}>
              404
            </div>
          </div>

          <h2 className="text-3xl font-bold mt-6 mb-3" style={{ color: '#4682A9' }}>
            Auction Not Found
          </h2>
          <p className="text-gray-600 mt-2 text-center max-w-md mx-auto text-lg">
            This item has been removed from bidding or the page you&apos;re looking for doesn&apos;t exist.
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
            <Link
              href="/"
              className="flex items-center justify-center gap-3 flex-1 px-6 py-4 rounded-xl text-white text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #749BC2 0%, #4682A9 100%)' }}
            >
              <FaHome className="text-lg" /> Return Home
            </Link>

            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center gap-3 flex-1 px-6 py-4 rounded-xl text-base font-semibold border-2 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
              style={{ 
                borderColor: '#91C8E4',
                color: '#4682A9',
                backgroundColor: 'rgba(145, 200, 228, 0.1)'
              }}
            >
              <FaArrowLeft className="text-lg" /> Go Back
            </button>
          </div>

          {/* Search Suggestion */}
          <div className="mt-12 p-6 rounded-2xl backdrop-blur-sm max-w-md mx-auto border-2"
               style={{ 
                 backgroundColor: 'rgba(255, 255, 255, 0.8)',
                 borderColor: '#91C8E4'
               }}>
            <div className="flex items-center justify-center gap-2 mb-3">
              <FaSearch style={{ color: '#4682A9' }} />
              <p className="text-sm font-semibold" style={{ color: '#4682A9' }}>
                Looking for something specific?
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                href="/browse-auctions"
                className="px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 hover:scale-105 shadow-sm"
                style={{ 
                  backgroundColor: '#91C8E4',
                  color: '#4682A9'
                }}
              >
                Browse Auctions
              </Link>
              <Link
                href="/categories"
                className="px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 hover:scale-105 shadow-sm"
                style={{ 
                  backgroundColor: '#91C8E4',
                  color: '#4682A9'
                }}
              >
                Categories
              </Link>
              <Link
                href="/contact"
                className="px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 hover:scale-105 shadow-sm"
                style={{ 
                  backgroundColor: '#91C8E4',
                  color: '#4682A9'
                }}
              >
                Contact Us
              </Link>
              <Link
                href="/faq"
                className="px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 hover:scale-105 shadow-sm"
                style={{ 
                  backgroundColor: '#91C8E4',
                  color: '#4682A9'
                }}
              >
                FAQ
              </Link>
            </div>
          </div>

          {/* Decorative dots */}
          <div className="flex justify-center items-center space-x-2 mt-8">
            <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#749BC2' }}></div>
            <div className="w-2 h-2 rounded-full animate-bounce animation-delay-200" style={{ backgroundColor: '#4682A9' }}></div>
            <div className="w-2 h-2 rounded-full animate-bounce animation-delay-400" style={{ backgroundColor: '#749BC2' }}></div>
          </div>
        </div>
      </main>


      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes swing {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(10deg); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 8s ease-in-out infinite;
          animation-delay: 1s;
        }
        .animate-float-slow {
          animation: float 10s ease-in-out infinite;
          animation-delay: 2s;
        }
        .animate-swing {
          animation: swing 2s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
}