'use client';

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7] px-4 py-12">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden md:flex flex-col justify-center space-y-6 px-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-[#393E46]">
              Welcome Back to<br />
              <span className="text-[#929AAB]">AuctioHub</span>
            </h1>
            <p className="text-lg text-[#393E46]/70">
              Sign in to access exclusive auctions, place bids, and track your winning items.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#393E46] flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#393E46]">Secure Bidding</h3>
                <p className="text-sm text-[#393E46]/60">Protected transactions and verified sellers</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#393E46] flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#393E46]">Real-time Updates</h3>
                <p className="text-sm text-[#393E46]/60">Get instant notifications on your bids</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#393E46] flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#393E46]">Win Amazing Deals</h3>
                <p className="text-sm text-[#393E46]/60">Bid smart and save on premium items</p>
              </div>
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

        {/* Right side - Sign In Form */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-[#EEEEEE]">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/assets/header logo.png"
                alt="AuctioHub Logo"
                width={160}
                height={55}
                className="mx-auto"
              />
            </Link>
            <h2 className="text-3xl font-bold text-[#393E46] mb-2">Sign In</h2>
            <p className="text-[#929AAB]">Welcome back to AuctioHub</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center">
                {error === "Configuration" && "Google OAuth is being configured. Please ensure the redirect URI is set correctly in Google Cloud Console."}
                {error === "OAuthSignin" && "Error starting Google sign in. Please try again."}
                {error === "OAuthCallback" && "Error during Google sign in callback."}
                {error === "OAuthAccountNotLinked" && "This email is already linked to another account."}
                {error === "AccessDenied" && "Access denied. You may not have permission to sign in."}
                {error === "Verification" && "The verification link has expired or has already been used."}
                {!["Configuration", "OAuthSignin", "OAuthCallback", "OAuthAccountNotLinked", "AccessDenied", "Verification", "default"].includes(error) && `An error occurred: ${error}`}
              </p>
              {error === "Configuration" && (
                <p className="text-xs text-red-500 text-center mt-2">
                  Add this redirect URI to Google Cloud Console: <br />
                  <code className="bg-red-100 px-2 py-1 rounded">http://localhost:3000/api/auth/callback/google</code>
                </p>
              )}
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-[#EEEEEE] rounded-xl text-[#393E46] font-semibold hover:bg-[#F7F7F7] hover:border-[#929AAB] transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#EEEEEE]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-[#929AAB]">New to AuctioHub?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <Link
            href="/sign-up"
            className="w-full block text-center px-6 py-4 bg-[#393E46] text-white rounded-xl font-semibold hover:bg-[#929AAB] transition-all duration-300"
          >
            Create an Account
          </Link>

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <p className="text-sm text-[#929AAB]">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="text-[#393E46] hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[#393E46] hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>

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
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#393E46] mx-auto"></div>
          <p className="mt-4 text-[#929AAB]">Loading...</p>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}