import Link from "next/link";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { FaShieldAlt, FaExclamationTriangle } from "react-icons/fa";

export default function AdminAccessDenied() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F7]">
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        
        {/* Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <FaShieldAlt className="text-3xl text-red-500" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-semibold text-gray-900">Access Denied</h1>

        {/* Message */}
        <p className="text-gray-600 mt-3 max-w-md">
          You are not authorized to access the admin dashboard.  
          This section is restricted to administrators only.
        </p>

        {/* Optional small support note */}
        <div className="flex items-center justify-center mt-6 text-sm text-gray-500">
          <FaExclamationTriangle className="text-yellow-600 mr-2" />
          <p>If you think this is a mistake, please contact support.</p>
        </div>

        {/* Back to Home */}
        <Link
          href="/"
          className="mt-8 px-6 py-3 text-sm font-medium bg-[#393E46] text-white rounded-lg hover:bg-[#2e3238] transition"
        >
          Return to Home
        </Link>
      </main>

      <Footer />
    </div>
  );
}
