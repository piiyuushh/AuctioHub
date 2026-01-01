"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ShoppingBagIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  PhotoIcon,
  ClockIcon,
  CurrencyDollarIcon,
  FireIcon,
  StopIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";

const staticProducts = [
  {
    id: "static-1",
    title: "Premium Wireless Headphones",
    description: "High-quality sound with noise cancellation.",
    imageUrl: "/assets/products/1.png",
    isStatic: true,
  },
  {
    id: "static-2",
    title: "Smart Watch Series X",
    description: "Track your fitness goals with advanced health monitoring.",
    imageUrl: "/assets/products/2.png",
    isStatic: true,
  },
  {
    id: "static-3",
    title: "Professional Camera Kit",
    description: "Capture stunning photos with professional-grade camera.",
    imageUrl: "/assets/products/3.png",
    isStatic: true,
  },
];

interface Product {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  userEmail?: string;
  userId?: string;
  isStatic?: boolean;
  hasAuction?: boolean;
  auctionEndTime?: string;
  startingBid?: number;
  currentBid?: number;
  highestBidder?: string | null;
  highestBidderEmail?: string | null;
  totalBids?: number;
  auctionStatus?: string;
}

export default function CategoryPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"buyer" | "seller">("buyer");
  const [products, setProducts] = useState<Product[]>([]);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    hasAuction: false,
    auctionDurationHours: 24,
    startingBid: 0,
  });
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchProducts();
    if (session) {
      fetchMyProducts();
    }
  }, [session]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProducts((prev) => [...prev]);
      setMyProducts((prev) => [...prev]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data.length > 0 ? data : staticProducts);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts(staticProducts);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyProducts = async () => {
    try {
      const response = await fetch("/api/products/my-products");
      if (response.ok) {
        const data = await response.json();
        setMyProducts(data);
      }
    } catch (error) {
      console.error("Error fetching my products:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image size must be less than 5MB" });
      return;
    }

    setUploading(true);
    const formDataObj = new FormData();
    formDataObj.append("file", file);

    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formDataObj,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({ ...prev, imageUrl: data.url }));
        setMessage({ type: "success", text: "Image uploaded successfully!" });
      } else {
        setMessage({ type: "error", text: "Failed to upload image" });
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage({ type: "error", text: "Error uploading image" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      router.push("/sign-in");
      return;
    }

    if (!formData.title || !formData.description || !formData.imageUrl) {
      setMessage({ type: "error", text: "All fields are required" });
      return;
    }

    try {
      const url = "/api/products";
      const method = editingProduct ? "PUT" : "POST";
      const body = editingProduct
        ? { ...formData, productId: editingProduct._id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: editingProduct ? "Product updated!" : "Product added successfully!",
        });
        setFormData({
          title: "",
          description: "",
          imageUrl: "",
          hasAuction: false,
          auctionDurationHours: 24,
          startingBid: 0,
        });
        setShowAddForm(false);
        setEditingProduct(null);
        fetchProducts();
        fetchMyProducts();
      } else {
        const data = await response.json();
        setMessage({ type: "error", text: data.error || "Failed to save product" });
      }
    } catch (error) {
      console.error("Error saving product:", error);
      setMessage({ type: "error", text: "Error saving product" });
    }
  };

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      router.push("/sign-in");
      return;
    }

    if (!selectedProduct || !bidAmount) {
      setMessage({ type: "error", text: "Please enter a bid amount" });
      return;
    }

    try {
      const response = await fetch("/api/products/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct._id,
          bidAmount: parseFloat(bidAmount),
        }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Bid placed successfully!" });
        setShowBidModal(false);
        setBidAmount("");
        setSelectedProduct(null);
        fetchProducts();
      } else {
        const data = await response.json();
        setMessage({ type: "error", text: data.error || "Failed to place bid" });
      }
    } catch (error) {
      console.error("Error placing bid:", error);
      setMessage({ type: "error", text: "Error placing bid" });
    }
  };

  const handleEndAuction = async (productId: string) => {
    if (!confirm("Are you sure you want to end this auction?")) return;

    try {
      const response = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, endAuction: true }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Auction ended successfully!" });
        fetchProducts();
        fetchMyProducts();
      } else {
        setMessage({ type: "error", text: "Failed to end auction" });
      }
    } catch (error) {
      console.error("Error ending auction:", error);
      setMessage({ type: "error", text: "Error ending auction" });
    }
  };

  const handleExtendAuction = async (productId: string, hours: number) => {
    try {
      const response = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, extendAuction: true, extensionHours: hours }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: `Auction extended by ${hours} hours!` });
        fetchProducts();
        fetchMyProducts();
      } else {
        setMessage({ type: "error", text: "Failed to extend auction" });
      }
    } catch (error) {
      console.error("Error extending auction:", error);
      setMessage({ type: "error", text: "Error extending auction" });
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/products?id=${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Product deleted successfully!" });
        fetchProducts();
        fetchMyProducts();
      } else {
        setMessage({ type: "error", text: "Failed to delete product" });
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      setMessage({ type: "error", text: "Error deleting product" });
    }
  };

  const getTimeRemaining = (endTime: string) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const diff = end - now;

    if (diff <= 0) return "Ended";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingProduct(null);
    setFormData({
      title: "",
      description: "",
      imageUrl: "",
      hasAuction: false,
      auctionDurationHours: 24,
      startingBid: 0,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <section className="bg-gradient-to-r from-black to-gray-800 text-white py-16">
        <div className="container mx-auto px-4 xl:px-8 2xl:px-0 2xl:max-w-[1800px]">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Auction Marketplace</h1>
          <p className="text-lg text-gray-300 max-w-2xl">
            Browse products, join auctions, or list your own items
          </p>
        </div>
      </section>

      <section className="bg-white border-b border-gray-200 sticky top-[73px] z-40">
        <div className="container mx-auto px-4 xl:px-8 2xl:px-0 2xl:max-w-[1800px]">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("buyer")}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
                activeTab === "buyer"
                  ? "text-black border-b-2 border-black"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              <ShoppingBagIcon className="h-5 w-5" />
              Buyer
            </button>
            <button
              onClick={() => {
                if (!session) {
                  router.push("/sign-in");
                  return;
                }
                setActiveTab("seller");
              }}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
                activeTab === "seller"
                  ? "text-black border-b-2 border-black"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              <PlusIcon className="h-5 w-5" />
              Seller
            </button>
          </div>
        </div>
      </section>

      {message && (
        <div className="container mx-auto px-4 xl:px-8 2xl:px-0 2xl:max-w-[1800px] mt-4">
          <div
            className={`p-4 rounded-lg flex items-center justify-between ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)}>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 container mx-auto px-4 xl:px-8 2xl:px-0 2xl:max-w-[1800px] py-8">
        {activeTab === "buyer" && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-black mb-2">Browse Products & Auctions</h2>
              <p className="text-gray-600">
                {products.some((p) => !p.isStatic)
                  ? "Join live auctions or buy products directly"
                  : "Sample products - sellers can add their own!"}
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading products...</p>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => {
                  const timeRemaining = product.hasAuction && product.auctionEndTime 
                    ? getTimeRemaining(product.auctionEndTime)
                    : null;
                  const isEnded = timeRemaining === "Ended" || product.auctionStatus === "ended";
                  const isMyProduct = session?.user?.email === product.userEmail;

                  return (
                    <div
                      key={product._id || product.id}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="relative aspect-square">
                        <Image
                          src={product.imageUrl}
                          alt={product.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                        {product.isStatic && (
                          <div className="absolute top-3 left-3">
                            <span className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded">
                              SAMPLE
                            </span>
                          </div>
                        )}
                        {product.hasAuction && !product.isStatic && (
                          <div className="absolute top-3 left-3">
                            <span className={`text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${
                              isEnded ? "bg-gray-600" : "bg-red-600 animate-pulse"
                            }`}>
                              <FireIcon className="h-3 w-3" />
                              {isEnded ? "ENDED" : "LIVE AUCTION"}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="font-bold text-black text-lg mb-2 line-clamp-2">
                          {product.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                          {product.description}
                        </p>

                        {product.hasAuction && !product.isStatic && (
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Current Bid:</span>
                              <span className="font-bold text-green-600">
                                Rs. {(product.currentBid || product.startingBid || 0).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Total Bids:</span>
                              <span className="font-semibold">{product.totalBids || 0}</span>
                            </div>
                            {timeRemaining && (
                              <div className={`flex items-center gap-2 p-2 rounded ${
                                isEnded ? "bg-gray-100" : "bg-red-50"
                              }`}>
                                <ClockIcon className={`h-4 w-4 ${
                                  isEnded ? "text-gray-600" : "text-red-600"
                                }`} />
                                <span className={`text-sm font-semibold ${
                                  isEnded ? "text-gray-600" : "text-red-600"
                                }`}>
                                  {timeRemaining}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {!product.isStatic && product.userEmail && (
                          <p className="text-xs text-gray-500 mb-3">Seller: {product.userEmail}</p>
                        )}

                        {product.hasAuction && !product.isStatic && !isEnded && !isMyProduct && (
                          <button
                            onClick={() => {
                              if (!session) {
                                router.push("/sign-in");
                                return;
                              }
                              setSelectedProduct(product);
                              setShowBidModal(true);
                            }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                          >
                            <CurrencyDollarIcon className="h-5 w-5" />
                            Place Bid
                          </button>
                        )}

                        {product.hasAuction && isEnded && product.highestBidderEmail && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-800 font-semibold">
                              Winner: {product.highestBidderEmail === session?.user?.email 
                                ? "You won!" 
                                : product.highestBidderEmail}
                            </p>
                            <p className="text-xs text-green-600">
                              Winning bid: Rs. {(product.currentBid || 0).toLocaleString()}
                            </p>
                          </div>
                        )}

                        {isMyProduct && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800 font-semibold">Your Product</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No products available yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "seller" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-black mb-2">My Products</h2>
                <p className="text-gray-600">Manage your product listings and auctions</p>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
                Add Product
              </button>
            </div>

            {myProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {myProducts.map((product) => {
                  const timeRemaining = product.hasAuction && product.auctionEndTime 
                    ? getTimeRemaining(product.auctionEndTime)
                    : null;
                  const isEnded = timeRemaining === "Ended" || product.auctionStatus === "ended";

                  return (
                    <div
                      key={product._id}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                      <div className="relative aspect-square">
                        <Image
                          src={product.imageUrl}
                          alt={product.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                        {product.hasAuction && (
                          <div className="absolute top-3 left-3">
                            <span className={`text-white text-xs font-bold px-2 py-1 rounded ${
                              isEnded ? "bg-gray-600" : "bg-red-600"
                            }`}>
                              {isEnded ? "ENDED" : "LIVE"}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="font-bold text-black text-lg mb-2 line-clamp-2">
                          {product.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                          {product.description}
                        </p>

                        {product.hasAuction && (
                          <div className="space-y-2 mb-4 p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Current Bid:</span>
                              <span className="font-bold text-green-600">
                                Rs. {(product.currentBid || product.startingBid || 0).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Total Bids:</span>
                              <span className="font-semibold">{product.totalBids || 0}</span>
                            </div>
                            {timeRemaining && (
                              <div className={`flex items-center gap-2 p-2 rounded ${
                                isEnded ? "bg-gray-100" : "bg-red-50"
                              }`}>
                                <ClockIcon className={`h-4 w-4 ${
                                  isEnded ? "text-gray-600" : "text-red-600"
                                }`} />
                                <span className={`text-sm font-semibold ${
                                  isEnded ? "text-gray-600" : "text-red-600"
                                }`}>
                                  {timeRemaining}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="space-y-2">
                          {product.hasAuction && !isEnded && (
                            <>
                              <button
                                onClick={() => handleEndAuction(product._id!)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                              >
                                <StopIcon className="h-4 w-4" />
                                End Auction
                              </button>
                              <button
                                onClick={() => handleExtendAuction(product._id!, 24)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-black rounded-lg hover:border-black transition-colors"
                              >
                                <ArrowPathIcon className="h-4 w-4" />
                                Extend +24h
                              </button>
                            </>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDelete(product._id!)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              <TrashIcon className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-black mb-2">No products yet</h3>
                <p className="text-gray-600 mb-6">Start by adding your first product!</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <PlusIcon className="h-5 w-5" />
                  Add Product
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-black">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <button onClick={closeForm} className="p-2 rounded-full hover:bg-gray-100">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Product Image *
                </label>
                {formData.imageUrl ? (
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={formData.imageUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                      sizes="(max-width: 672px) 100vw, 672px"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, imageUrl: "" }))}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-black transition-colors">
                    <PhotoIcon className="h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600 mb-2">Click to upload image</p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    {uploading && (
                      <div className="mt-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                      </div>
                    )}
                  </label>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Product Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter product title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Product Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your product"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black resize-none"
                  required
                />
              </div>

              {/* Auction Settings */}
              <div className="border-t pt-6">
                <label className="flex items-center gap-3 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    checked={formData.hasAuction}
                    onChange={(e) => setFormData((prev) => ({ ...prev, hasAuction: e.target.checked }))}
                    className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <div>
                    <span className="text-sm font-semibold text-black">Enable Auction</span>
                    <p className="text-xs text-gray-500">Allow buyers to bid on this product</p>
                  </div>
                </label>

                {formData.hasAuction && (
                  <div className="space-y-4 pl-8">
                    <div>
                      <label className="block text-sm font-semibold text-black mb-2">
                        Starting Bid (Rs.) *
                      </label>
                      <input
                        type="number"
                        value={formData.startingBid}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, startingBid: parseFloat(e.target.value) || 0 }))
                        }
                        placeholder="0"
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-black mb-2">
                        Auction Duration (hours) *
                      </label>
                      <select
                        value={formData.auctionDurationHours}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            auctionDurationHours: parseInt(e.target.value),
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                      >
                        <option value={1}>1 hour</option>
                        <option value={6}>6 hours</option>
                        <option value={12}>12 hours</option>
                        <option value={24}>24 hours (1 day)</option>
                        <option value={48}>48 hours (2 days)</option>
                        <option value={72}>72 hours (3 days)</option>
                        <option value={168}>168 hours (7 days)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 px-6 py-3 border border-gray-300 text-black rounded-lg hover:border-black transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50"
                >
                  {editingProduct ? "Update Product" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bid Modal */}
      {showBidModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-black">Place Your Bid</h2>
                <button
                  onClick={() => {
                    setShowBidModal(false);
                    setBidAmount("");
                    setSelectedProduct(null);
                  }}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleBid} className="p-6 space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">Product:</p>
                <p className="font-semibold text-black">{selectedProduct.title}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Current Bid:</p>
                <p className="text-2xl font-bold text-green-600">
                  Rs. {(selectedProduct.currentBid || selectedProduct.startingBid || 0).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Your Bid Amount (Rs.) *
                </label>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Minimum: ${((selectedProduct.currentBid || selectedProduct.startingBid || 0) + 1).toLocaleString()}`}
                  min={(selectedProduct.currentBid || selectedProduct.startingBid || 0) + 1}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  required
                />
                <p className="mt-2 text-xs text-gray-500">
                  Minimum bid: Rs. {((selectedProduct.currentBid || selectedProduct.startingBid || 0) + 1).toLocaleString()}
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowBidModal(false);
                    setBidAmount("");
                    setSelectedProduct(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-black rounded-lg hover:border-black transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
                >
                  Place Bid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
