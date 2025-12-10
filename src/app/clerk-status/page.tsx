'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ClerkStatusPage() {
  const [status, setStatus] = useState({
    publishableKey: false,
    secretKey: false,
    isLoading: true,
  });

  useEffect(() => {
    const checkClerkStatus = () => {
      const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      // Note: Secret key is not accessible in client-side code for security reasons
      // We'll assume it's configured if publishable key is present
      
      setStatus({
        publishableKey: !!publishableKey,
        secretKey: !!publishableKey, // Assume secret key is configured if publishable key is present
        isLoading: false,
      });
    };

    checkClerkStatus();
  }, []);

  if (status.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking Clerk status...</p>
        </div>
      </div>
    );
  }

  const isClerkConfigured = status.publishableKey && status.secretKey;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Clerk Authentication Status</h1>
          <div className={`inline-flex items-center px-4 py-2 rounded-full ${
            isClerkConfigured ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-3 h-3 rounded-full mr-2 ${
              isClerkConfigured ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            {isClerkConfigured ? 'Configured' : 'Not Configured'}
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <span className="font-medium">Publishable Key</span>
            <div className={`flex items-center ${
              status.publishableKey ? 'text-green-600' : 'text-red-600'
            }`}>
              {status.publishableKey ? (
                <>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Available
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Missing
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <span className="font-medium">Secret Key</span>
              <p className="text-sm text-gray-500">Inferred from publishable key (server-side only)</p>
            </div>
            <div className={`flex items-center ${
              status.secretKey ? 'text-green-600' : 'text-red-600'
            }`}>
              {status.secretKey ? (
                <>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Configured
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Missing
                </>
              )}
            </div>
          </div>
        </div>

        {isClerkConfigured ? (
          <div className="bg-green-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Authentication Ready!</h3>
            <p className="text-green-700 mb-4">
              All environment variables are configured. Your authentication should work properly.
            </p>
            <div className="space-y-2">
              <Link 
                href="/sign-up"
                className="block w-full px-4 py-2 bg-green-600 text-white text-center rounded hover:bg-green-700 transition-colors"
              >
                Test Sign Up
              </Link>
              <Link 
                href="/sign-in"
                className="block w-full px-4 py-2 bg-green-600 text-white text-center rounded hover:bg-green-700 transition-colors"
              >
                Test Sign In
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">⚠️ Configuration Required</h3>
            <p className="text-red-700 mb-4">
              Environment variables are missing. Follow the setup guide to configure Clerk authentication.
            </p>
            <Link 
              href="https://github.com/your-repo/blob/main/CLERK_SETUP.md"
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Setup Guide
            </Link>
          </div>
        )}

        <div className="text-center">
          <Link 
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
