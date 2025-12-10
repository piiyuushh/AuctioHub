"use client";
import { useState } from "react";
import Link from "next/link";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Registering with:", { name, email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-[#EEEEEE]">
          {/* Logo */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#393E46] mb-2">Join AuctioHub</h2>
            <p className="text-[#929AAB]">Create your account to start bidding</p>
          </div>

        {/* Register Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Name Input */}
          <div>
            <label className="block text-[#393E46] font-medium mb-2">Full Name</label>
            <div className="flex items-center border border-[#EEEEEE] rounded-lg px-4 py-3 focus-within:border-[#929AAB] transition-colors">
              <FaUser className="text-[#929AAB]" />
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full pl-3 outline-none text-[#393E46] placeholder-[#929AAB]/50"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-[#393E46] font-medium mb-2">Email</label>
            <div className="flex items-center border border-[#EEEEEE] rounded-lg px-4 py-3 focus-within:border-[#929AAB] transition-colors">
              <FaEnvelope className="text-[#929AAB]" />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full pl-3 outline-none text-[#393E46] placeholder-[#929AAB]/50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-[#393E46] font-medium mb-2">Password</label>
            <div className="flex items-center border border-[#EEEEEE] rounded-lg px-4 py-3 focus-within:border-[#929AAB] transition-colors">
              <FaLock className="text-[#929AAB]" />
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full pl-3 outline-none text-[#393E46] placeholder-[#929AAB]/50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-[#393E46] font-medium mb-2">Confirm Password</label>
            <div className="flex items-center border border-[#EEEEEE] rounded-lg px-4 py-3 focus-within:border-[#929AAB] transition-colors">
              <FaLock className="text-[#929AAB]" />
              <input
                type="password"
                placeholder="Confirm your password"
                className="w-full pl-3 outline-none text-[#393E46] placeholder-[#929AAB]/50"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="w-full bg-[#393E46] text-white py-3 rounded-lg font-semibold hover:bg-[#929AAB] transition-all duration-300 shadow-sm"
          >
            Create Account
          </button>
        </form>

        {/* Already Have an Account */}
        <div className="text-center mt-6 pt-6 border-t border-[#EEEEEE]">
          <p className="text-sm text-[#393E46]">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-[#929AAB] hover:text-[#393E46] font-medium transition-colors">
              Sign in here
            </Link>
          </p>
        </div>

        {/* Back to Home Button */}
        <div className="text-center mt-4">
          <Link href="/" className="inline-flex items-center text-sm text-[#929AAB] hover:text-[#393E46] transition-colors">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-[#929AAB]">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}