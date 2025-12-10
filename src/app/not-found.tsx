"use client";
import Link from "next/link";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { FaHome, FaArrowLeft } from "react-icons/fa";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F7] text-gray-800">
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <h1 className="text-[120px] font-extrabold text-gray-300 leading-none">
          404
        </h1>

        <h2 className="text-2xl font-semibold mt-4">Page Not Found</h2>
        <p className="text-gray-600 mt-2 text-center max-w-md">
          The page you’re searching for doesn’t exist or may have been moved.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-lg bg-[#393E46] text-white text-sm font-medium hover:bg-[#292d33] transition"
          >
            <FaHome /> Go Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-100 transition"
          >
            <FaArrowLeft /> Go Back
          </button>
        </div>

        {/* Suggested Links */}
        <div className="mt-10">
          <p className="text-sm text-gray-500 text-center mb-3">
            Quick links:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href="/browse-auctions"
              className="px-3 py-1 text-xs rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
            >
              Browse Auctions
            </Link>
            <Link
              href="/categories"
              className="px-3 py-1 text-xs rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
            >
              Categories
            </Link>
            <Link
              href="/contact"
              className="px-3 py-1 text-xs rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
            >
              Contact
            </Link>
            <Link
              href="/faq"
              className="px-3 py-1 text-xs rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
            >
              FAQ
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
