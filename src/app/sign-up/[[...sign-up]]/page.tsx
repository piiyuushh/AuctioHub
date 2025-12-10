'use client';

import { SignUp } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function SignUpPage() {
  const [isClerkAvailable, setIsClerkAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if Clerk publishable key is available
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    setIsClerkAvailable(!!publishableKey);
    setIsLoading(false);
  }, []);


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isClerkAvailable) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Setup Required</h2>
            <p className="text-gray-600 mb-6">
              The authentication service needs to be configured. This happens when environment variables aren&apos;t properly set in the deployment platform.
            </p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
            <h3 className="font-semibold text-blue-900 mb-2">For Administrators:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Set environment variables in your deployment platform</li>
              <li>Configure Clerk dashboard with your domain</li>
              <li>Redeploy the application</li>
            </ol>
          </div>

          <div className="space-y-3">
            <Link 
              href="/"
              className="block w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Return to Home
            </Link>
            <Link 
              href="/contact"
              className="block w-full px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <style jsx global>{`
        /* Hide Clerk development mode text */
        .cl-footer,
        .cl-footerAction,
        .cl-footerActionText,
        [data-testid="footer"],
        div[style*="color: rgb(255, 133, 27)"],
        div[style*="color: #ff851b"],
        div[style*="color: orange"],
        span:contains("Development mode"),
        div:contains("Development mode") {
          display: none !important;
        }
        
        /* Hide any orange colored text in Clerk components */
        .cl-card div[style*="color: rgb(255, 133, 27)"],
        .cl-card div[style*="color: #ff851b"] {
          display: none !important;
        }

        /* Custom Clerk styling for AuctioHub */
        .cl-rootBox {
          width: 100%;
        }
        .cl-card {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border: 1px solid #EEEEEE;
        }
        .cl-headerTitle {
          color: #393E46 !important;
        }
        .cl-formButtonPrimary {
          background-color: #393E46 !important;
        }
        .cl-formButtonPrimary:hover {
          background-color: #929AAB !important;
        }
        .cl-footerActionLink {
          color: #929AAB !important;
        }
      `}</style>
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7] px-4 py-12">
        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Branding */}
          <div className="hidden md:flex flex-col justify-center space-y-6 px-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-[#393E46]">
                Join<br />
                <span className="text-[#929AAB]">AuctioHub</span> Today
              </h1>
              <p className="text-lg text-[#393E46]/70">
                Create your account and start bidding on exclusive items. Win big with smart bidding!
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#393E46] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[#393E46]">Free Registration</h3>
                  <p className="text-sm text-[#393E46]/60">Sign up in seconds, no credit card required</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#393E46] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[#393E46]">Exclusive Access</h3>
                  <p className="text-sm text-[#393E46]/60">Get early access to premium auctions</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#393E46] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[#393E46]">Track Your Bids</h3>
                  <p className="text-sm text-[#393E46]/60">Monitor all your auctions in one place</p>
                </div>
              </div>
            </div>
            <div className="bg-[#393E46] text-white p-6 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Active Users</span>
                <span className="text-2xl font-bold">1,000+</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Items Sold</span>
                <span className="text-2xl font-bold">5,000+</span>
              </div>
            </div>
            <div className="pt-6">
              <Link
                href="/"
                className="inline-flex items-center text-[#929AAB] hover:text-[#393E46] transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
            </div>
          </div>

          {/* Right side - Sign Up Form */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-[#EEEEEE]">
            <div className="mb-6 md:hidden">
              <h2 className="text-3xl font-bold text-[#393E46] mb-2">Create Account</h2>
              <p className="text-[#929AAB]">Start your bidding journey</p>
            </div>
            <SignUp 
              path="/sign-up" 
              routing="path" 
              signInUrl="/sign-in"
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-[#393E46] hover:bg-[#929AAB] text-white',
                  card: 'shadow-none',
                  headerTitle: 'text-[#393E46]',
                  headerSubtitle: 'text-[#929AAB]',
                  socialButtonsBlockButton: 'border-[#EEEEEE] hover:bg-[#F7F7F7]',
                  formFieldInput: 'border-[#EEEEEE] focus:border-[#929AAB]',
                  footerActionLink: 'text-[#929AAB] hover:text-[#393E46]',
                }
              }}
            />
            <div className="mt-6 pt-6 border-t border-[#EEEEEE] text-center md:hidden">
              <Link
                href="/"
                className="inline-flex items-center text-sm text-[#929AAB] hover:text-[#393E46] transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}