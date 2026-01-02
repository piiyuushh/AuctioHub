"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import {
  CreditCardIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";

interface Product {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  currentBid?: number;
  highestBidderEmail?: string;
}

type PaymentMethod = "card" | "mobile" | null;

export default function PaymentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push("/sign-in");
      return;
    }
    fetchProduct();
  }, [session, productId]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products?id=${productId}`);
      if (response.ok) {
        const data = await response.json();
        
        // Verify user is the winner
        if (data.highestBidderEmail !== session?.user?.email) {
          router.push("/category");
          return;
        }
        
        setProduct(data);
      } else {
        router.push("/category");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      router.push("/category");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      alert("Please select a payment method");
      return;
    }

    setProcessing(true);

    try {
      if (selectedMethod === "card") {
        // Stripe payment
        const response = await fetch("/api/payment/create-checkout-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: product?._id,
            productTitle: product?.title,
            productImage: product?.imageUrl,
            amount: product?.currentBid || 0,
          }),
        });

        const data = await response.json();

        if (response.ok && data.url) {
          // Redirect to Stripe checkout
          window.location.href = data.url;
        } else {
          alert(data.error || "Failed to create checkout session");
          setProcessing(false);
        }
      } else if (selectedMethod === "mobile") {
        // Mobile payment (demo)
        setTimeout(() => {
          setProcessing(false);
          alert("Mobile payment successful! Thank you for your purchase.");
          router.push("/");
        }, 2000);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("An error occurred while processing payment");
      setProcessing(false);
    }
  };

  const paymentMethods = [
    {
      id: "card" as PaymentMethod,
      name: "Credit/Debit Card",
      icon: CreditCardIcon,
      description: "Pay securely with Stripe",
    },
    {
      id: "mobile" as PaymentMethod,
      name: "Mobile Payment",
      icon: DevicePhoneMobileIcon,
      description: "Pay with mobile wallet (Demo)",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="flex-1 container mx-auto px-4 xl:px-8 2xl:px-0 2xl:max-w-[1400px] py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Complete Your Payment</h1>
          <p className="text-gray-600">Finalize your winning bid payment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Product Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-black mb-6">Order Summary</h2>

            <div className="space-y-6">
              {/* Product Image */}
              <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={product.imageUrl}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

              {/* Product Details */}
              <div>
                <h3 className="font-bold text-lg text-black mb-2">{product.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{product.description}</p>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Winning Bid:</span>
                  <span className="font-semibold text-black">
                    Rs. {(product.currentBid || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing Fee:</span>
                  <span className="font-semibold text-black">Rs. 0</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="text-lg font-bold text-black">Total Amount:</span>
                  <span className="text-2xl font-bold text-green-600">
                    Rs. {(product.currentBid || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Winner Badge */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-800">
                    Congratulations on winning this auction!
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Complete payment to claim your item
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Methods */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-black mb-6">Choose Payment Method</h2>

            <div className="space-y-4 mb-8">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedMethod === method.id
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        selectedMethod === method.id ? "bg-black" : "bg-gray-100"
                      }`}
                    >
                      <method.icon
                        className={`h-6 w-6 ${
                          selectedMethod === method.id ? "text-white" : "text-gray-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-black">{method.name}</h3>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedMethod === method.id
                          ? "border-black bg-black"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedMethod === method.id && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Payment Info */}
            {selectedMethod === "card" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Secure Stripe Payment:</strong> You will be redirected to Stripe's secure checkout page to complete your payment.
                </p>
              </div>
            )}
            {selectedMethod === "mobile" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Mobile payment is a demo feature. In production, this would integrate with local mobile payment providers.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handlePayment}
                disabled={!selectedMethod || processing}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-6 w-6" />
                    Proceed to Payment
                  </>
                )}
              </button>

              <button
                onClick={() => router.push("/")}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 border-2 border-gray-300 text-black rounded-lg hover:border-black transition-colors font-semibold"
              >
                <HomeIcon className="h-5 w-5" />
                Return to Home
              </button>
            </div>

            {/* Security Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-black mb-1">Secure Payment</p>
                  <p className="text-xs text-gray-600">
                    Your payment information is encrypted and secure. We never store your card details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
