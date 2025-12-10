"use client"
import Link from 'next/link'
import { Header } from '@/components/Header'
import Footer from '@/components/Footer'
import { FaHome, FaSearch, FaArrowLeft } from 'react-icons/fa'
 
export default function CategoryNotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      {/* Main Content - Takes up remaining space */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          {/* Category Not Found Animation */}
          <div className="relative mb-8">
            <div className="text-6xl font-bold text-gray-200 select-none">
              CATEGORY
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-2xl font-bold text-gray-800">
                NOT FOUND
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-8 space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Category Not Found
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              The category you&apos;re looking for doesn&apos;t exist or has been moved. 
              Explore our available categories instead!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link 
              href="/"
              className="inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-all duration-300 group"
            >
              <FaHome className="mr-2 group-hover:animate-bounce" />
              Go Back Home
            </Link>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                href="/category"
                className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300"
              >
                <FaSearch className="mr-2" />
                Browse Categories
              </Link>
              
              <button 
                onClick={() => window.history.back()}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300"
              >
                <FaArrowLeft className="mr-2" />
                Go Back
              </button>
            </div>
          </div>

          {/* Available Categories */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">
              Popular categories:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link 
                href="/category/home"
                className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                Home & Interior
              </Link>
              <Link 
                href="/category/electronics"
                className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                Electronics
              </Link>
              <Link 
                href="/category/gaming"
                className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                Gaming
              </Link>
              <Link 
                href="/category/clothing"
                className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                Clothing
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
