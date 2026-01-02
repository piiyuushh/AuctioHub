"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import {
  ClockIcon,
  ArrowRightIcon,
  PlusCircleIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";

interface Product {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  userEmail: string;
  hasAuction?: boolean;
  auctionEndTime?: string;
  startingBid?: number;
  currentBid?: number;
  highestBidder?: string | null;
  highestBidderEmail?: string | null;
  totalBids?: number;
  auctionStatus?: string;
}

interface ChatMessage {
  _id: string;
  productId: string;
  userId: string;
  userEmail: string;
  message: string;
  createdAt: string;
}

export default function AuctionSessionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [showWinner, setShowWinner] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session) {
      router.push("/sign-in");
      return;
    }
    fetchProduct();
    fetchMessages();
    const messageInterval = setInterval(fetchMessages, 2000);
    return () => clearInterval(messageInterval);
  }, [session, productId]);

  useEffect(() => {
    if (!product) return;
    
    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);
      
      if (remaining === "Ended" && !showWinner) {
        fetchProduct(); // Refresh product to check winner
        if (product.highestBidderEmail === session?.user?.email) {
          setShowWinner(true);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [product, session]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products?id=${productId}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
        
        // Check if auction ended and user is winner
        if (data.auctionStatus === 'ended' && data.highestBidderEmail === session?.user?.email) {
          setShowWinner(true);
        }
      } else {
        router.push("/category");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const lastMessageTime = messages.length > 0 
        ? messages[messages.length - 1].createdAt 
        : undefined;
      
      const url = lastMessageTime 
        ? `/api/auction/${productId}/chat?after=${lastMessageTime}`
        : `/api/auction/${productId}/chat`;
      
      const response = await fetch(url);
      if (response.ok) {
        const newMessages = await response.json();
        if (newMessages.length > 0) {
          setMessages(prev => [...prev, ...newMessages]);
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch(`/api/auction/${productId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage }),
      });

      if (response.ok) {
        setNewMessage("");
        await fetchMessages();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleQuickBid = async () => {
    if (!product) return;

    const bidAmount = (product.currentBid || product.startingBid || 0) + 10;
    
    try {
      const response = await fetch("/api/products/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, bidAmount }),
      });

      if (response.ok) {
        await fetchProduct();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to place bid");
      }
    } catch (error) {
      console.error("Error placing bid:", error);
      alert("Error placing bid");
    }
  };

  const calculateTimeRemaining = () => {
    if (!product?.auctionEndTime) return "N/A";
    
    const now = new Date().getTime();
    const end = new Date(product.auctionEndTime).getTime();
    const diff = end - now;

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLeave = () => {
    router.push("/category");
  };

  const handleWinnerProceed = () => {
    router.push(`/payment/${productId}`);
  };

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

  const isEnded = timeRemaining === "Ended" || product.auctionStatus === "ended";
  const isSeller = session?.user?.email === product.userEmail;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Winner Modal */}
      {showWinner && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center animate-bounce-in">
            <div className="mb-6">
              <TrophyIcon className="h-24 w-24 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-black mb-2">Congratulations!</h2>
              <p className="text-lg text-gray-600">You won the auction!</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Winning Bid</p>
              <p className="text-3xl font-bold text-green-600">
                Rs. {(product.currentBid || 0).toLocaleString()}
              </p>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Product:</p>
              <p className="font-semibold text-black">{product.title}</p>
            </div>

            <button
              onClick={handleWinnerProceed}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold text-lg"
            >
              Proceed to Payment
              <ArrowRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 xl:px-8 2xl:px-0 2xl:max-w-[1800px] py-8">
        <button
          onClick={handleLeave}
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Browse
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-250px)]">
          {/* Left Column - Product Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col">
            <div className="flex-1 flex flex-col">
              {/* Product Image */}
              <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-gray-200 mb-6">
                <Image
                  src={product.imageUrl}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

              {/* Facts about Product */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-bold text-black mb-3 text-lg">Facts about Product</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Title:</span>
                    <span className="font-semibold text-black">{product.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Starting Bid:</span>
                    <span className="font-semibold text-black">
                      Rs. {(product.startingBid || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Bid:</span>
                    <span className="font-semibold text-green-600">
                      Rs. {(product.currentBid || product.startingBid || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Bids:</span>
                    <span className="font-semibold text-black">{product.totalBids || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Seller:</span>
                    <span className="font-semibold text-black text-sm">{product.userEmail}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Description:</p>
                  <p className="text-black">{product.description}</p>
                </div>
              </div>

              {/* Timer */}
              <div className={`p-4 rounded-lg flex items-center justify-between ${
                isEnded ? "bg-gray-100" : "bg-red-50"
              }`}>
                <div className="flex items-center gap-2">
                  <ClockIcon className={`h-6 w-6 ${
                    isEnded ? "text-gray-600" : "text-red-600"
                  }`} />
                  <span className={`text-sm font-semibold ${
                    isEnded ? "text-gray-600" : "text-red-600"
                  }`}>
                    {isEnded ? "Auction Ended" : "Time Remaining"}
                  </span>
                </div>
                <span className={`text-2xl font-bold ${
                  isEnded ? "text-gray-600" : "text-red-600"
                }`}>
                  {timeRemaining}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - Live Conversation */}
          <div className="bg-white rounded-lg border border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-black">Live Conversation</h2>
              <p className="text-sm text-gray-600 mt-1">
                {messages.length} message{messages.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Messages Area */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
              style={{ maxHeight: "calc(100% - 180px)" }}
            >
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMyMessage = msg.userEmail === session?.user?.email;
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isMyMessage
                            ? "bg-black text-white"
                            : "bg-gray-100 text-black"
                        }`}
                      >
                        <p className="text-xs opacity-75 mb-1">
                          {isMyMessage ? "You" : msg.userEmail}
                        </p>
                        <p className="text-sm break-words">{msg.message}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200">
              <form onSubmit={sendMessage} className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type to send"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  disabled={sending || isEnded}
                  maxLength={500}
                />
                <button
                  type="submit"
                  disabled={sending || isEnded || !newMessage.trim()}
                  className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
              </form>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                {!isSeller && !isEnded && (
                  <button
                    onClick={handleQuickBid}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    <PlusCircleIcon className="h-5 w-5" />
                    +10 $
                  </button>
                )}
                <button
                  onClick={handleLeave}
                  className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 text-black rounded-lg hover:border-black transition-colors font-semibold ${
                    isSeller || isEnded ? "col-span-2" : ""
                  }`}
                >
                  Leave
                </button>
              </div>

              {isSeller && (
                <p className="text-xs text-gray-500 text-center mt-3">
                  You cannot bid on your own product
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
