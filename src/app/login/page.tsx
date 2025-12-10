"use client";
import { useState } from "react";
import Link from "next/link";
import { FaEnvelope, FaLock } from "react-icons/fa";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Logging in with:", { email, password });
    // Add your login logic here
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        {/* Logo */}
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Tokari Login</h2>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">Email</label>
            <div className="flex items-center border rounded-md px-3 py-2 mt-1">
              <FaEnvelope className="text-gray-500" />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full pl-2 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Password</label>
            <div className="flex items-center border rounded-md px-3 py-2 mt-1">
              <FaLock className="text-gray-500" />
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full pl-2 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md font-medium hover:bg-gray-900 transition-all"
          >
            Login
          </button>
        </form>

        {/* OR Divider */}
        <div className="relative text-center my-4">
          <span className="bg-white px-3 text-gray-600 text-sm">OR</span>
        </div>

        {/* Don't Have an Account */}
        <div className="text-center mt-4">
          <p className="text-sm">
            Dont have an account?{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              Register here
            </Link>
          </p>
        </div>

        {/* Back to Home Button */}
        <div className="text-center mt-4">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            <button className="w-full bg-gray-200 text-black py-2 rounded-md font-medium hover:bg-gray-300 transition-all">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}