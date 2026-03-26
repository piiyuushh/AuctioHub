"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function SignInCallbackPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [progress, setProgress] = useState(0);

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
      router.push("/sign-in");
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

        {/* Large decorative watermark */}
        <span className="absolute text-[22rem] font-black text-black opacity-[0.02] select-none leading-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          A
        </span>

        <div className="relative z-10 flex flex-col items-center gap-10">
          {/* Spinner ring with lock icon */}
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
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="1" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <p className="font-serif text-2xl tracking-tight text-black">
              Authenticating
            </p>
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

        {/* Large decorative watermark */}
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

            {/* Check mark box */}
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
                {/* Corner ticks */}
                <span className="absolute -top-1 -left-1 w-2 h-2 bg-white border-t border-l border-black" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-white border-t border-r border-black" />
                <span className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border-b border-l border-black" />
                <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border-b border-r border-black" />
              </div>
            </div>

            {/* Text */}
            <div className="text-center space-y-2">
              <p className="text-[10px] font-medium tracking-[0.18em] uppercase text-neutral-400">
                Successfully authenticated
              </p>
              <h2 className="font-serif text-4xl tracking-tight text-black leading-tight">
                Welcome<br />back.
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
                your session
              </span>
              <div className="flex-1 h-px bg-neutral-200" />
            </div>

            {/* Live auctions pill */}
            <div className="flex justify-center">
              <div className="flex items-center gap-2 border border-neutral-200 px-5 py-2.5 hover:border-black transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                <svg
                  className="w-4 h-4 text-black"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 3" />
                </svg>
                <span className="text-[11px] font-medium tracking-[0.1em] uppercase text-black">
                  Live auctions active
                </span>
              </div>
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
                  Entering auction hall
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