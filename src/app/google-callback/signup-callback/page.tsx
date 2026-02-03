"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function SignUpCallbackPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status === "authenticated") {
      // Animate progress bar
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 2;
        });
      }, 40);

      // Redirect after animation completes
      const timer = setTimeout(() => {
        router.push("/");
      }, 2200);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    } else if (status === "unauthenticated") {
      router.push("/sign-up");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #F6F4EB 0%, #91C8E4 100%)' }}>
        {/* Animated auction elements */}
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full opacity-30 animate-float" style={{ backgroundColor: '#749BC2' }}></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full opacity-20 animate-float-delayed" style={{ backgroundColor: '#4682A9' }}></div>
        <div className="absolute top-1/2 left-10 w-48 h-48 rounded-full opacity-25 animate-float-slow" style={{ backgroundColor: '#91C8E4' }}></div>
        
        <div className="relative z-10 text-center space-y-8">
          {/* Registration icon with loading animation */}
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 rounded-full opacity-20 animate-pulse" style={{ backgroundColor: '#4682A9' }}></div>
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-20 h-20 animate-bounce-slow" viewBox="0 0 24 24" fill="none" stroke="#4682A9" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="absolute inset-0 border-4 rounded-full border-t-transparent animate-spin" style={{ borderColor: '#4682A9', borderTopColor: 'transparent' }}></div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-3xl font-bold" style={{ color: '#4682A9' }}>Creating Your Account</h3>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#749BC2' }}></div>
              <div className="w-2 h-2 rounded-full animate-bounce animation-delay-200" style={{ backgroundColor: '#4682A9' }}></div>
              <div className="w-2 h-2 rounded-full animate-bounce animation-delay-400" style={{ backgroundColor: '#749BC2' }}></div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-20px) scale(1.05); }
          }
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
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
          .animate-bounce-slow {
            animation: bounce-slow 2s ease-in-out infinite;
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

  if (status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4" style={{ background: 'linear-gradient(135deg, #F6F4EB 0%, #91C8E4 100%)' }}>
        {/* Animated auction elements */}
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full opacity-30 animate-float" style={{ backgroundColor: '#749BC2' }}></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full opacity-20 animate-float-delayed" style={{ backgroundColor: '#4682A9' }}></div>
        <div className="absolute top-1/2 left-10 w-48 h-48 rounded-full opacity-25 animate-float-slow" style={{ backgroundColor: '#91C8E4' }}></div>
        
        <div className="relative z-10 max-w-lg w-full">
          <div className="backdrop-blur-md rounded-3xl shadow-2xl p-10 space-y-8 border-2 animate-scale-in" 
               style={{ 
                 backgroundColor: 'rgba(246, 244, 235, 0.95)',
                 borderColor: '#91C8E4'
               }}>
            
            {/* Success Icon - Welcome/User Badge */}
            <div className="relative mx-auto w-28 h-28">
              <div className="absolute inset-0 rounded-full animate-ping opacity-40" style={{ backgroundColor: '#4682A9' }}></div>
              <div className="relative w-28 h-28 rounded-full flex items-center justify-center shadow-xl animate-scale-in" 
                   style={{ 
                     background: 'linear-gradient(135deg, #749BC2 0%, #4682A9 100%)'
                   }}>
                <svg className="w-14 h-14 text-white animate-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                </svg>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="text-center space-y-3">
              <div className="inline-block px-4 py-1 rounded-full text-sm font-semibold" 
                   style={{ 
                     backgroundColor: '#91C8E4',
                     color: '#4682A9'
                   }}>
                Registration Complete
              </div>
              <h2 className="text-4xl font-bold" style={{ color: '#4682A9' }}>
                Welcome to the Auction!
              </h2>
              {session?.user?.name && (
                <p className="text-2xl font-medium" style={{ color: '#749BC2' }}>
                  {session.user.name}
                </p>
              )}
              <p className="text-gray-600 text-lg">
                Your bidding journey starts here
              </p>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-xl" style={{ backgroundColor: '#91C8E4' }}>
                <svg className="w-8 h-8 mx-auto mb-2" style={{ color: '#4682A9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                </svg>
                <p className="text-xs font-semibold" style={{ color: '#4682A9' }}>Place Bids</p>
              </div>
              <div className="text-center p-3 rounded-xl" style={{ backgroundColor: '#91C8E4' }}>
                <svg className="w-8 h-8 mx-auto mb-2" style={{ color: '#4682A9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <p className="text-xs font-semibold" style={{ color: '#4682A9' }}>Watch Items</p>
              </div>
              <div className="text-center p-3 rounded-xl" style={{ backgroundColor: '#91C8E4' }}>
                <svg className="w-8 h-8 mx-auto mb-2" style={{ color: '#4682A9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p className="text-xs font-semibold" style={{ color: '#4682A9' }}>Win Deals</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="w-full rounded-full h-3 overflow-hidden shadow-inner" style={{ backgroundColor: '#91C8E4' }}>
                <div
                  className="h-full rounded-full transition-all duration-100 ease-out relative overflow-hidden"
                  style={{ 
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #749BC2 0%, #4682A9 50%, #749BC2 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s infinite'
                  }}
                >
                  <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
                </div>
              </div>
              <p className="text-center text-sm font-medium" style={{ color: '#4682A9' }}>
                Taking you to explore auctions...
              </p>
            </div>

            {/* Decorative elements */}
            <div className="flex justify-center items-center space-x-3">
              <div className="w-3 h-3 rounded-full animate-ping" style={{ backgroundColor: '#749BC2' }}></div>
              <div className="w-3 h-3 rounded-full animate-ping animation-delay-300" style={{ backgroundColor: '#4682A9' }}></div>
              <div className="w-3 h-3 rounded-full animate-ping animation-delay-600" style={{ backgroundColor: '#749BC2' }}></div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-20px) scale(1.05); }
          }
          @keyframes scale-in {
            0% {
              transform: scale(0.8);
              opacity: 0;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          @keyframes check {
            0% {
              stroke-dasharray: 0, 100;
            }
            100% {
              stroke-dasharray: 100, 0;
            }
          }
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
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
          .animate-scale-in {
            animation: scale-in 0.6s ease-out;
          }
          .animate-check {
            animation: check 0.6s ease-in-out 0.3s both;
          }
          .animation-delay-200 {
            animation-delay: 0.2s;
          }
          .animation-delay-300 {
            animation-delay: 0.3s;
          }
          .animation-delay-400 {
            animation-delay: 0.4s;
          }
          .animation-delay-600 {
            animation-delay: 0.6s;
          }
        `}</style>
      </div>
    );
  }

  return null;
}