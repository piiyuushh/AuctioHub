"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FaGavel, FaHeart, FaListAlt, FaTrophy, FaChartLine, FaDollarSign, FaClock, FaStar } from "react-icons/fa";
import Image from "next/image";

interface UserStats {
  activeBids: number;
  watchlist: number;
  activeListings: number;
  auctionsWon: number;
  totalSpent: string;
  successRate: string;
  avgBidTime: string;
  rating: string;
}

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const [userStats] = useState<UserStats>({
    activeBids: 12,
    watchlist: 8,
    activeListings: 12,
    auctionsWon: 2,
    totalSpent: "$2,450",
    successRate: "75%",
    avgBidTime: "2.5 hrs",
    rating: "4.8",
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#393E46] mx-auto"></div>
          <p className="mt-4 text-[#929AAB]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7]">
        <div className="text-center">
          <p className="text-[#393E46] text-xl">Please sign in to view your dashboard</p>
        </div>
      </div>
    );
  }

  const user = session.user;

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F7]">
      <Header />
      
      <main className="flex-1 w-full xl:px-8 2xl:px-0 2xl:max-w-[1800px] 2xl:mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#393E46] mb-2">User Dashboard</h1>
            <p className="text-[#929AAB]">Manage your auctions and track your activity</p>
          </div>

          {/* User Profile Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#EEEEEE] p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[#EEEEEE]">
                  <Image
                    src={user?.image || "/assets/profiles/default-avatar.png"}
                    alt={user?.name || "User"}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-[#393E46] mb-2">
                  {user?.name || "User"}
                </h2>
                <p className="text-[#929AAB] mb-4">
                  {user?.email}
                </p>
                
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <div className="bg-[#F7F7F7] px-4 py-2 rounded-lg">
                    <span className="text-sm text-[#929AAB]">Member Since</span>
                    <p className="text-[#393E46] font-semibold">
                      {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="bg-[#F7F7F7] px-4 py-2 rounded-lg">
                    <span className="text-sm text-[#929AAB]">User ID</span>
                    <p className="text-[#393E46] font-semibold">
                      {user?.id?.slice(0, 8)}...
                    </p>
                  </div>
                  <div className="bg-[#F7F7F7] px-4 py-2 rounded-lg flex items-center gap-2">
                    <FaStar className="text-yellow-500" />
                    <div>
                      <span className="text-sm text-[#929AAB]">Rating</span>
                      <p className="text-[#393E46] font-semibold">{userStats.rating}/5.0</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Profile Button */}
              <div className="flex-shrink-0">
                <button className="px-6 py-3 bg-[#393E46] text-white rounded-lg hover:bg-[#929AAB] transition-all duration-300 font-medium">
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-[#EEEEEE] p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaGavel className="text-blue-600 text-xl" />
                </div>
                <span className="text-[#929AAB] text-sm">Active</span>
              </div>
              <h3 className="text-3xl font-bold text-[#393E46] mb-1">{userStats.activeBids}</h3>
              <p className="text-[#929AAB] text-sm">Active Bids</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#EEEEEE] p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <FaHeart className="text-red-600 text-xl" />
                </div>
                <span className="text-[#929AAB] text-sm">Saved</span>
              </div>
              <h3 className="text-3xl font-bold text-[#393E46] mb-1">{userStats.watchlist}</h3>
              <p className="text-[#929AAB] text-sm">Watchlist</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#EEEEEE] p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FaListAlt className="text-purple-600 text-xl" />
                </div>
                <span className="text-[#929AAB] text-sm">Listed</span>
              </div>
              <h3 className="text-3xl font-bold text-[#393E46] mb-1">{userStats.activeListings}</h3>
              <p className="text-[#929AAB] text-sm">Active Listings</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#EEEEEE] p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FaTrophy className="text-green-600 text-xl" />
                </div>
                <span className="text-[#929AAB] text-sm">Won</span>
              </div>
              <h3 className="text-3xl font-bold text-[#393E46] mb-1">{userStats.auctionsWon}</h3>
              <p className="text-[#929AAB] text-sm">Auctions Won</p>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Statistics Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-[#EEEEEE] p-6">
                <h2 className="text-2xl font-bold text-[#393E46] mb-6">Statistics</h2>
                
                <div className="space-y-4">
                  {/* Total Spent */}
                  <div className="flex items-center justify-between p-4 bg-[#F7F7F7] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#393E46] rounded-lg flex items-center justify-center">
                        <FaDollarSign className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-[#929AAB]">Total Spent</p>
                        <p className="text-xl font-bold text-[#393E46]">{userStats.totalSpent}</p>
                      </div>
                    </div>
                    <div className="text-green-600 text-sm font-medium">+12%</div>
                  </div>

                  {/* Success Rate */}
                  <div className="flex items-center justify-between p-4 bg-[#F7F7F7] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#393E46] rounded-lg flex items-center justify-center">
                        <FaChartLine className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-[#929AAB]">Success Rate</p>
                        <p className="text-xl font-bold text-[#393E46]">{userStats.successRate}</p>
                      </div>
                    </div>
                    <div className="text-green-600 text-sm font-medium">Excellent</div>
                  </div>

                  {/* Average Bid Time */}
                  <div className="flex items-center justify-between p-4 bg-[#F7F7F7] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#393E46] rounded-lg flex items-center justify-center">
                        <FaClock className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-[#929AAB]">Avg. Bid Time</p>
                        <p className="text-xl font-bold text-[#393E46]">{userStats.avgBidTime}</p>
                      </div>
                    </div>
                    <div className="text-blue-600 text-sm font-medium">Fast</div>
                  </div>

                  {/* Win Rate Chart Placeholder */}
                  <div className="p-4 bg-[#F7F7F7] rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[#393E46] rounded-lg flex items-center justify-center">
                        <FaTrophy className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-[#929AAB]">Win Rate Progress</p>
                      </div>
                    </div>
                    <div className="w-full bg-[#EEEEEE] rounded-full h-4">
                      <div className="bg-gradient-to-r from-[#393E46] to-[#929AAB] h-4 rounded-full" style={{ width: userStats.successRate }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-sm border border-[#EEEEEE] p-6">
                <h2 className="text-xl font-bold text-[#393E46] mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button className="w-full py-3 bg-[#393E46] text-white rounded-lg hover:bg-[#929AAB] transition-all duration-300 font-medium">
                    Browse Auctions
                  </button>
                  <button className="w-full py-3 bg-[#F7F7F7] text-[#393E46] rounded-lg hover:bg-[#EEEEEE] transition-all duration-300 font-medium">
                    View My Bids
                  </button>
                  <button className="w-full py-3 bg-[#F7F7F7] text-[#393E46] rounded-lg hover:bg-[#EEEEEE] transition-all duration-300 font-medium">
                    Manage Listings
                  </button>
                </div>
              </div>

              {/* Recent Alerts */}
              <div className="bg-white rounded-2xl shadow-sm border border-[#EEEEEE] p-6">
                <h2 className="text-xl font-bold text-[#393E46] mb-4">Recent Alerts</h2>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <p className="text-sm font-medium text-[#393E46]">Outbid on Item #1234</p>
                    <p className="text-xs text-[#929AAB] mt-1">2 hours ago</p>
                  </div>
                  <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded">
                    <p className="text-sm font-medium text-[#393E46]">You won Item #5678</p>
                    <p className="text-xs text-[#929AAB] mt-1">1 day ago</p>
                  </div>
                  <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                    <p className="text-sm font-medium text-[#393E46]">Auction ending soon</p>
                    <p className="text-xs text-[#929AAB] mt-1">3 hours left</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
