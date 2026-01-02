"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircleIcon, HomeIcon } from "@heroicons/react/24/outline";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const productId = searchParams.get("product_id");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate verification
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="flex-1 container mx-auto px-4 xl:px-8 2xl:px-0 2xl:max-w-[1400px] py-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 rounded-full p-6">
                <CheckCircleIcon className="h-16 w-16 text-green-600" />
              </div>
            </div>

            {/* Success Message */}
            <h1 className="text-3xl font-bold text-black mb-4">
              Payment Successful!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Thank you for your purchase. Your payment has been processed successfully.
            </p>

            {/* Payment Details */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h2 className="text-lg font-semibold text-black mb-4">
                Payment Details
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-semibold text-black">Credit/Debit Card</span>
                </div>
                {sessionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono text-xs text-black">
                      {sessionId.slice(0, 20)}...
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold text-green-600">Completed</span>
                </div>
              </div>
            </div>

            {/* Info Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
              <p className="text-sm text-blue-800">
                <strong>What's Next?</strong> You will receive a confirmation email shortly. 
                The seller will be notified to prepare your item for delivery.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push("/")}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
              >
                <HomeIcon className="h-5 w-5" />
                Return to Home
              </button>
              <button
                onClick={() => router.push("/user-dashboard")}
                className="flex items-center justify-center gap-2 px-8 py-3 border-2 border-gray-300 text-black rounded-lg hover:border-black transition-colors font-semibold"
              >
                View My Purchases
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
