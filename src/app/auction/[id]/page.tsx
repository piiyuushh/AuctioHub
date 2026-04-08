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
} from "@heroicons/react/24/outline";
import { Header } from "@/components/Header";
import { AlertDialog } from "@/components/ui/AlertDialog";

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
  const [bidAmount, setBidAmount] = useState("");
  const [alertDialog, setAlertDialog] = useState({ open: false, title: '', message: '', variant: 'default' as 'default' | 'destructive' | 'success' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageCreatedAtRef = useRef<string | null>(null);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());

  const appendUniqueMessages = (incomingMessages: ChatMessage[]) => {
    if (!incomingMessages.length) return;

    setMessages((prev) => {
      const next = [...prev];

      for (const message of incomingMessages) {
        if (!message?._id || seenMessageIdsRef.current.has(message._id)) {
          continue;
        }

        seenMessageIdsRef.current.add(message._id);
        next.push(message);
      }

      if (!next.length) return next;

      // Keep local ordering stable even if poll responses arrive out of order.
      next.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      lastMessageCreatedAtRef.current = next[next.length - 1].createdAt;
      return next;
    });
  };

  useEffect(() => {
    setMessages([]);
    seenMessageIdsRef.current = new Set();
    lastMessageCreatedAtRef.current = null;
  }, [productId]);

  useEffect(() => {
    if (!session) {
      router.push("/sign-in");
      return;
    }

    let messageInterval: ReturnType<typeof setInterval> | null = null;

    const initializeAuctionSession = async () => {
      try {
        const accessResponse = await fetch(`/api/auction/${productId}/access`);
        if (!accessResponse.ok) {
          router.push("/category");
          return;
        }

        const productResponse = await fetch(`/api/products?id=${productId}`);
        if (productResponse.ok) {
          const productData = await productResponse.json();
          setProduct(productData);
          if (
            productData.auctionStatus === "ended" &&
            productData.highestBidderEmail === session?.user?.email
          ) {
            setShowWinner(true);
          }
        } else {
          router.push("/category");
          return;
        }

        const fetchSessionMessages = async () => {
          try {
            const lastMessageTime = lastMessageCreatedAtRef.current || undefined;
            const url = lastMessageTime
              ? `/api/auction/${productId}/chat?after=${lastMessageTime}`
              : `/api/auction/${productId}/chat`;
            const response = await fetch(url);
            if (response.ok) {
              const newMessages = await response.json();
              if (newMessages.length > 0) {
                appendUniqueMessages(newMessages);
              }
            }
          } catch (error) {
            console.error("Error fetching messages:", error);
          }
        };

        await fetchSessionMessages();
        messageInterval = setInterval(fetchSessionMessages, 2000);
      } catch (error) {
        console.error("Error initializing auction session:", error);
        router.push("/category");
      }
    };

    initializeAuctionSession();

    return () => {
      if (messageInterval) {
        clearInterval(messageInterval);
      }
    };
  }, [session, productId, router]);

  useEffect(() => {
    if (!product) return;

    const computeTimeRemaining = () => {
      if (!product.auctionEndTime) return "N/A";
      const now = new Date().getTime();
      const end = new Date(product.auctionEndTime).getTime();
      const diff = end - now;
      if (diff <= 0) return "Ended";
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
      if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
      if (minutes > 0) return `${minutes}m ${seconds}s`;
      return `${seconds}s`;
    };

    const timer = setInterval(() => {
      const remaining = computeTimeRemaining();
      setTimeRemaining(remaining);
      if (remaining === "Ended" && !showWinner) {
        void (async () => {
          try {
            const response = await fetch(`/api/products?id=${productId}`);
            if (!response.ok) return;
            const data = await response.json();
            setProduct(data);
            if (data.highestBidderEmail === session?.user?.email) {
              setShowWinner(true);
            }
          } catch (error) {
            console.error("Error fetching product:", error);
          }
        })();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [product, productId, session?.user?.email, showWinner]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products?id=${productId}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
        if (
          data.auctionStatus === "ended" &&
          data.highestBidderEmail === session?.user?.email
        ) {
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

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageToSend = newMessage.trim();
    setSending(true);

    try {
      const response = await fetch(`/api/auction/${productId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend }),
      });

      if (response.ok) {
        const sentMessage: ChatMessage = await response.json();
        setNewMessage("");
        appendUniqueMessages([sentMessage]);
      } else {
        const data = await response.json().catch(() => ({}));
        setAlertDialog({
          open: true,
          title: 'Message Failed',
          message: data.error || 'Failed to send message',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setAlertDialog({
        open: true,
        title: 'Message Failed',
        message: 'Error sending message',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const handleQuickBid = async () => {
    if (!product) return;
    const parsedBidAmount = Number(bidAmount);
    const minimumBid = (product.currentBid || product.startingBid || 0) + 1;

    if (!Number.isInteger(parsedBidAmount) || parsedBidAmount <= 0) {
      setAlertDialog({ open: true, title: 'Invalid Amount', message: 'Please enter a whole number bid amount', variant: 'default' });
      return;
    }

    if (parsedBidAmount < minimumBid) {
      setAlertDialog({
        open: true,
        title: 'Bid Too Low',
        message: `Your bid must be at least Rs. ${minimumBid.toLocaleString()}`,
        variant: 'default',
      });
      return;
    }

    try {
      const response = await fetch("/api/products/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, bidAmount: parsedBidAmount }),
      });
      if (response.ok) {
        setBidAmount("");
        await fetchProduct();
      } else {
        const data = await response.json();
        setAlertDialog({ open: true, title: 'Bid Failed', message: data.error || "Failed to place bid", variant: 'destructive' });
      }
    } catch (error) {
      console.error("Error placing bid:", error);
      setAlertDialog({ open: true, title: 'Error', message: "Error placing bid", variant: 'destructive' });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLeave = () => router.push("/category");
  const handleWinnerProceed = () => router.push(`/payment/${productId}`);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-xs tracking-[0.15em] uppercase text-neutral-400 font-medium">
            Loading session
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-sm tracking-widest uppercase text-neutral-400">
          Product not found
        </p>
      </div>
    );
  }

  const isEnded =
    timeRemaining === "Ended" || product.auctionStatus === "ended";
  const isSeller = session?.user?.email === product.userEmail;
  const currentBidDisplay =
    product.currentBid || product.startingBid || 0;
  const minimumBid = currentBidDisplay + 1;
  const bidPreview = Number(bidAmount);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* ── Winner Modal ── */}
      {showWinner && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white border border-black w-full max-w-sm p-10 text-center">
            {/* Trophy */}
            <div className="flex justify-center mb-6">
              <svg
                className="w-12 h-12"
                viewBox="0 0 48 48"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M24 32v6M16 44h16M12 4h24v16c0 8-4 12-12 12S12 28 12 20V4z" />
                <path d="M12 10H6c0 8 4 12 6 14M36 10h6c0 8-4 12-6 14" />
              </svg>
            </div>
            <h2 className="text-4xl tracking-tight mb-2">
              You won.
            </h2>
            <p className="text-[10px] tracking-[0.16em] uppercase text-neutral-400 mb-6">
              Auction closed
            </p>
            <div className="w-8 h-px bg-neutral-300 mx-auto mb-6" />
            <p className="text-[10px] tracking-[0.14em] uppercase text-neutral-400 mb-2">
              Winning bid
            </p>
            <p className="text-4xl font-medium mb-2">
              Rs. {currentBidDisplay.toLocaleString()}
            </p>
            <p className="text-xs text-neutral-500 mb-8">{product.title}</p>
            <button
              onClick={handleWinnerProceed}
              className="w-full flex items-center justify-center gap-2 bg-black text-white text-[11px] font-semibold tracking-[0.12em] uppercase py-4 hover:opacity-80 transition-opacity"
            >
              Proceed to payment
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-neutral-200">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLeave}
            className="flex items-center gap-1.5 text-[11px] font-medium tracking-[0.08em] uppercase text-neutral-500 border border-neutral-300 px-3 py-1.5 hover:bg-black hover:text-white hover:border-black transition-all"
          >
            <ArrowLeftIcon className="w-3 h-3" />
            Back
          </button>
          <span className="text-lg tracking-tight">
            Auction Session
          </span>
        </div>

        {/* Live badge */}
        <div className="flex items-center gap-2 border border-black px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
          <span className="text-[10px] font-medium tracking-[0.14em] uppercase">
            Live
          </span>
        </div>

        <button
          onClick={handleLeave}
          className="text-[11px] font-medium tracking-[0.08em] uppercase text-neutral-500 border border-neutral-300 px-3 py-1.5 hover:border-black hover:text-black transition-all"
        >
          Leave session
        </button>
      </div>

      {/* ── Main Grid ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200">

        {/* ── LEFT: Product Info ── */}
        <div className="flex flex-col gap-6 p-6 overflow-y-auto max-h-[calc(100vh-120px)]">

          {/* Product Image */}
          <div className="relative w-full aspect-[4/3] overflow-hidden bg-neutral-100">
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute bottom-3 left-3 bg-black text-white text-[10px] tracking-[0.1em] px-2.5 py-1">
              LOT #{product._id.slice(-6).toUpperCase()}
            </div>
          </div>

          {/* Timer */}
          <div
            className={`flex items-center justify-between px-4 py-3.5 border ${
              isEnded ? "border-neutral-300" : "border-black"
            }`}
          >
            <div className="flex items-center gap-2">
              <ClockIcon
                className={`w-4 h-4 ${
                  isEnded ? "text-neutral-400" : "text-black"
                }`}
              />
              <span className="text-[10px] font-medium tracking-[0.14em] uppercase text-neutral-500">
                {isEnded ? "Auction ended" : "Time remaining"}
              </span>
            </div>
            <span
              className={`text-xl font-medium tracking-tight ${
                isEnded ? "text-neutral-400" : "text-black"
              }`}
            >
              {timeRemaining || "—"}
            </span>
          </div>

          {/* Lot Details */}
          <div>
            <p className="text-[10px] font-medium tracking-[0.14em] uppercase text-neutral-400 pb-3 border-b border-neutral-200 mb-1">
              Lot details
            </p>
            {[
              { key: "Title", val: product.title },
              {
                key: "Starting bid",
                val: `Rs. ${(product.startingBid || 0).toLocaleString()}`,
              },
              {
                key: "Current bid",
                val: `Rs. ${currentBidDisplay.toLocaleString()}`,
                highlight: true,
              },
              { key: "Total bids", val: product.totalBids || 0 },
              { key: "Seller", val: product.userEmail },
            ].map(({ key, val, highlight }) => (
              <div
                key={key}
                className="flex items-baseline justify-between py-2.5 border-b border-neutral-100 last:border-0"
              >
                <span className="text-[11px] text-neutral-400 tracking-[0.04em]">
                  {key}
                </span>
                <span
                  className={`text-xs font-medium text-right max-w-[55%] break-all ${
                    highlight ? "text-black text-sm" : "text-neutral-700"
                  }`}
                >
                  {String(val)}
                </span>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="bg-neutral-50 p-4 text-xs leading-relaxed text-neutral-500">
            {product.description}
          </div>
        </div>

        {/* ── RIGHT: Live Chat ── */}
        <div className="flex flex-col max-h-[calc(100vh-120px)]">

          {/* Chat Header */}
          <div className="px-6 py-5 border-b border-neutral-200 shrink-0">
            <h2 className="text-2xl tracking-tight mb-0.5">
              Live conversation
            </h2>
            <p className="text-[11px] tracking-[0.06em] text-neutral-400">
              {messages.length} message{messages.length !== 1 ? "s" : ""} ·
              bidders active
            </p>
          </div>

          {/* Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3"
          >
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-[11px] tracking-[0.1em] uppercase text-neutral-300">
                  No messages yet
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.userEmail === session?.user?.email;
                return (
                  <div
                    key={msg._id}
                    className={`flex flex-col ${
                      isMe ? "items-end" : "items-start"
                    }`}
                  >
                    <span className="text-[10px] tracking-[0.08em] uppercase text-neutral-400 mb-1">
                      {isMe ? "You" : msg.userEmail}
                    </span>
                    <div
                      className={`max-w-[72%] px-4 py-2.5 text-[13px] leading-relaxed ${
                        isMe
                          ? "bg-black text-white"
                          : "bg-neutral-100 text-black border border-neutral-200"
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="px-6 py-4 border-t border-neutral-200 shrink-0 space-y-3">

            {/* Message input */}
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Send a message…"
                maxLength={500}
                disabled={sending || isEnded}
                className="flex-1 text-sm px-4 py-2.5 border border-neutral-300 bg-white text-black placeholder:text-neutral-300 outline-none focus:border-black disabled:bg-neutral-50 disabled:text-neutral-400 transition-colors"
              />
              <button
                type="submit"
                disabled={sending || isEnded || !newMessage.trim()}
                className="px-5 py-2.5 bg-black text-white text-[11px] font-semibold tracking-[0.1em] uppercase hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
              >
                Send
              </button>
            </form>

            {/* Bid row */}
            {!isSeller && !isEnded && (
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={minimumBid}
                    step="1"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="Enter bid amount"
                    className="flex-1 text-sm px-4 py-2.5 border border-neutral-300 bg-white text-black outline-none focus:border-black transition-colors"
                  />
                  <button
                    onClick={handleQuickBid}
                    className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-[11px] font-semibold tracking-[0.1em] uppercase hover:opacity-80 transition-opacity whitespace-nowrap"
                  >
                    <PlusCircleIcon className="w-4 h-4" />
                    Bid
                  </button>
                </div>
                <p className="text-[10px] text-neutral-400 tracking-[0.04em]">
                  Minimum bid Rs.{minimumBid.toLocaleString()} · Enter the full bid amount
                </p>
                {Number.isInteger(bidPreview) && bidPreview > 0 ? (
                  <p className="text-[10px] text-neutral-500 tracking-[0.04em]">
                    Your bid: Rs. {bidPreview.toLocaleString()}
                  </p>
                ) : null}
              </div>
            )}

            {/* Leave / seller note */}
            {isSeller ? (
              <p className="text-[10px] tracking-[0.08em] uppercase text-neutral-400 text-center pt-1 border-t border-neutral-100">
                You cannot bid on your own listing
              </p>
            ) : isEnded ? (
              <p className="text-[10px] tracking-[0.08em] uppercase text-neutral-400 text-center pt-1 border-t border-neutral-100">
                Auction has ended
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <AlertDialog
        open={alertDialog.open}
        onOpenChange={(open) => setAlertDialog({ ...alertDialog, open })}
        title={alertDialog.title}
        description={alertDialog.message}
        confirmText="Close"
        variant={alertDialog.variant as 'default' | 'destructive' | 'success'}
      />
    </div>
  );
}