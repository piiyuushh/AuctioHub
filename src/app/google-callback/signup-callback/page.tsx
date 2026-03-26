"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function SignUpCallbackPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [progress, setProgress] = useState(0);
  
  // DB-driven check: user is first-time login if isFirstAppLogin is true
  const isFirstLogin = (session?.user as any)?.isFirstAppLogin ?? false;

  useEffect(() => {
    if (status === "authenticated") {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 2;
        });
      }, 40);

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

  // ── Loading State ──
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center overflow-hidden relative">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Large decorative letters */}
        <span className="absolute text-[22rem] font-black text-black opacity-[0.02] select-none leading-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          A
        </span>

        <div className="relative z-10 flex flex-col items-center gap-10">
          {/* Spinner ring */}
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border border-neutral-200 rounded-full" />
            <div className="absolute inset-0 border-t border-black rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-7 h-7 text-black"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                  strokeLinecap="round"
                />
                <circle cx="9" cy="7" r="4" strokeLinecap="round" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <p className="font-serif text-2xl tracking-tight text-black">
              Setting things up
            </p>
            {/* Animated dots */}
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1 h-1 rounded-full bg-black animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Authenticated State ──
  if (status === "authenticated") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center overflow-hidden relative px-4">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Large decorative background letter */}
        <span className="absolute text-[22rem] font-black text-black opacity-[0.02] select-none leading-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          A
        </span>

        {/* Corner marks */}
        <div className="absolute top-8 left-8 w-6 h-6 border-t border-l border-neutral-300" />
        <div className="absolute top-8 right-8 w-6 h-6 border-t border-r border-neutral-300" />
        <div className="absolute bottom-8 left-8 w-6 h-6 border-b border-l border-neutral-300" />
        <div className="absolute bottom-8 right-8 w-6 h-6 border-b border-r border-neutral-300" />

        <div className="relative z-10 w-full max-w-md">
          <div className="border border-black bg-white p-10 space-y-8 animate-[scaleIn_0.5s_ease-out_both]">

            {/* Check mark */}
            <div className="flex justify-center">
              <div className="relative w-16 h-16 border border-black flex items-center justify-center">
                <svg
                  className="w-7 h-7"
                  viewBox="0 0 28 28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path
                    d="M5 14l6 6L23 8"
                    strokeDasharray="30"
                    strokeDashoffset="0"
                    className="animate-[drawCheck_0.6s_ease-out_0.3s_both]"
                  />
                </svg>
                {/* Corner ticks on the box */}
                <span className="absolute -top-1 -left-1 w-2 h-2 bg-white border-t border-l border-black" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-white border-t border-r border-black" />
                <span className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border-b border-l border-black" />
                <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border-b border-r border-black" />
              </div>
            </div>

            {/* Text */}
            <div className="text-center space-y-2">
              <p className="text-[10px] font-medium tracking-[0.18em] uppercase text-neutral-400">
                {isFirstLogin ? "Registration complete" : "Account verified"}
              </p>
              <h2 className="font-serif text-4xl tracking-tight text-black leading-tight">
                {isFirstLogin ? "Welcome to" : "Welcome back to"}<br />{isFirstLogin ? "the Auction." : "the Auction."}
              </h2>
              {session?.user?.name && (
                <p className="font-mono text-sm text-neutral-500 mt-1">
                  {session.user.name}
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-neutral-200" />
              <span className="text-[10px] tracking-[0.12em] uppercase text-neutral-300">
                your account
              </span>
              <div className="flex-1 h-px bg-neutral-200" />
            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Place bids",
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  ),
                },
                {
                  label: "Watch items",
                  icon: (
                    <>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </>
                  ),
                },
                {
                  label: "Win deals",
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  ),
                },
              ].map(({ label, icon }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 p-3 border border-neutral-200 hover:border-black transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-black"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    {icon}
                  </svg>
                  <p className="text-[10px] font-medium tracking-[0.08em] uppercase text-neutral-500">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="w-full h-px bg-neutral-200 overflow-hidden">
                <div
                  className="h-full bg-black transition-all duration-100 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] tracking-[0.1em] uppercase text-neutral-400">
                  Redirecting you now
                </p>
                <p className="font-mono text-[10px] text-neutral-400">
                  {progress}%
                </p>
              </div>
            </div>
          </div>

          {/* Bottom label */}
          <p className="text-center text-[10px] tracking-[0.14em] uppercase text-neutral-300 mt-4">
            Auction platform — est. 2024
          </p>
        </div>

        <style jsx global>{`
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.96) translateY(8px); }
            to   { opacity: 1; transform: scale(1)    translateY(0); }
          }
          @keyframes drawCheck {
            from { stroke-dashoffset: 30; }
            to   { stroke-dashoffset: 0; }
          }
        `}</style>
      </div>
    );
  }

  return null;
}