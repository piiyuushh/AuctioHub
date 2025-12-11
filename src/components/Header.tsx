"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { FaTimes, FaRegBookmark, FaShoppingBag, FaUser } from "react-icons/fa";
import Image from "next/image";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { AdminLink } from "./AdminLink";
import { UserLink } from "./UserLink";

// Conditional UserButton component
function ConditionalUserButton() {
  return (
    <>
      <SignedOut>
        <Link href="/sign-in" className="flex items-center justify-center w-10 h-10 rounded-full bg-black text-white hover:bg-gray-800 transition-all duration-300">
          <FaUser className="text-sm" />
        </Link>
      </SignedOut>
      <SignedIn>
        <UserButton 
          appearance={{
            elements: {
              userButtonAvatarBox: {
                width: "40px",
                height: "40px"
              },
              userButtonPopoverCard: {
                pointerEvents: "auto"
              },
              // Hide development mode text in user menu
              userButtonPopoverFooter: {
                display: "none"
              }
            },
            variables: {
              colorPrimary: "#000000"
            }
          }}
        />
      </SignedIn>
    </>
  );
}

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/category", label: "Browse" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  // Handle menu closing with animation
  const handleCloseMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    
    // Check initial scroll position
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mounted]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm"
          : "bg-white border-b border-gray-100"
      }`}
    >
      {/* Top Bar */}
      <div className="w-full bg-[#4682A9] text-white text-center text-sm py-2 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
        <div className="relative z-10 font-medium">
          Welcome to auctiohub.com.np | Bid Smart. Win Big
        </div>
      </div>

      {/* Header Container */}
      <div className="container mx-auto h-16 lg:h-20 px-4 lg:px-6 w-full xl:px-8 2xl:px-0 2xl:max-w-[1800px] 2xl:mx-auto">
        {/* Mobile Layout */}
        <div className="lg:hidden flex items-center justify-between h-full">
          {/* Mobile Menu Button */}
          <button
            className="relative p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-300 group touch-manipulation"
            onClick={() => isOpen ? handleCloseMenu() : setIsOpen(true)}
            aria-label="Toggle navigation menu"
          >
            <div className="relative w-5 h-5">
              <span
                className={`absolute top-0 left-0 w-full h-0.5 bg-gray-700 group-hover:bg-black transition-all duration-300 ${
                  isOpen ? "rotate-45 translate-y-2" : ""
                }`}
              ></span>
              <span
                className={`absolute top-2 left-0 w-full h-0.5 bg-gray-700 group-hover:bg-black transition-all duration-300 ${
                  isOpen ? "opacity-0" : ""
                }`}
              ></span>
              <span
                className={`absolute top-4 left-0 w-full h-0.5 bg-gray-700 group-hover:bg-black transition-all duration-300 ${
                  isOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              ></span>
            </div>
          </button>

          {/* Mobile Logo - Center */}
          <Link href="/" className="transform transition-all duration-300 hover:scale-105 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gray-800 rounded-lg blur opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <Image 
                src="/assets/header logo.png" 
                alt="AuctioHub Logo" 
                width={120} 
                height={45} 
                className="relative z-10" 
              />
            </div>
          </Link>

          {/* Mobile Icons */}
          <div className="flex items-center space-x-2">
            <button 
              className="relative p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-300 touch-manipulation"
              aria-label="Shopping cart"
            >
              <FaShoppingBag className="text-lg text-gray-600" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-xs rounded-full flex items-center justify-center font-bold">
                3
              </div>
            </button>
            <div className="touch-manipulation">
              <ConditionalUserButton />
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center justify-between h-full">
          {/* Desktop Logo */}
          <Link href="/" className="transform transition-all duration-300 hover:scale-105 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gray-800 rounded-lg blur opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <Image 
                src="/assets/header logo.png" 
                alt="AuctioHub Logo" 
                width={140} 
                height={52} 
                className="relative z-10" 
              />
            </div>
          </Link>

          {/* Desktop Navigation - Centered */}
          <nav className="flex items-center justify-center space-x-10 flex-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-lg font-semibold transition-all duration-300 group ${
                  isActive(link.href) ? "text-black" : "text-gray-700 hover:text-black"
                }`}
              >
                <span className="relative z-10">{link.label}</span>
                <div
                  className={`absolute -bottom-2 left-0 w-full h-0.5 bg-black transition-transform duration-300 ${
                    isActive(link.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                ></div>
                <div className="absolute inset-0 bg-gray-200 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-300 -m-2"></div>
              </Link>
            ))}
          </nav>

          {/* Desktop Icons */}
          <div className="flex items-center space-x-4">
            <button className="relative p-3 rounded-full bg-gray-50 hover:bg-gray-100 transition-all duration-300 group hover:scale-110">
              <FaRegBookmark className="text-xl text-gray-600 group-hover:text-black transition-colors duration-300" />
              <div className="absolute top-0 right-0 w-2 h-2 bg-black rounded-full animate-pulse"></div>
            </button>

            <button className="relative p-3 rounded-full bg-gray-50 hover:bg-gray-100 transition-all duration-300 group hover:scale-110">
              <FaShoppingBag className="text-xl text-gray-600 group-hover:text-black transition-colors duration-300" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center font-bold">
                3
              </div>
            </button>

            <AdminLink />
            <UserLink />

            <div className="flex justify-between">
              <ConditionalUserButton />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Navigation */}
      {isOpen && (
        <div
          className={`mobile-menu-overlay fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden ${isClosing ? 'closing' : ''}`}
          onClick={handleCloseMenu}
        >
          <div
            className={`mobile-menu-content absolute top-0 left-0 w-[320px] max-w-[90vw] h-full bg-white shadow-2xl flex flex-col ${isClosing ? 'closing' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Header */}
            <div className="mobile-menu-section header-section flex justify-between items-center p-4 border-b border-gray-100 bg-white flex-shrink-0">
              <Image src="/assets/header logo.png" alt="AuctioHub" width={100} height={38} />
              <button
                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                onClick={handleCloseMenu}
                aria-label="Close navigation menu"
              >
                <FaTimes className="text-lg text-gray-600" />
              </button>
            </div>

            {/* User Info Section */}
            <div className="mobile-menu-section user-section p-4 border-b border-gray-100 bg-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <ConditionalUserButton />
                  </div>
                  <div className="flex-1 min-w-0">
                    <SignedIn>
                      <p className="text-sm font-semibold text-gray-900 truncate">Welcome back!</p>
                      <p className="text-xs text-gray-500">Manage your account</p>
                    </SignedIn>
                    <SignedOut>
                      <p className="text-sm font-medium text-gray-700">Sign in for deals</p>
                      <p className="text-xs text-gray-500">Access exclusive offers</p>
                    </SignedOut>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AdminLink />
                  <UserLink />
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="mobile-menu-scrollable flex-1 overflow-y-auto min-h-0">
              {/* Navigation Links */}
              <div className="mobile-menu-section nav-section p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Navigation</p>
                <div className="space-y-2">
                  {navLinks.map((link, index) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={handleCloseMenu}
                      className={`mobile-menu-item flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                        isActive(link.href)
                          ? "bg-black text-white"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                      }`}
                      style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                    >
                      <span className="text-base font-medium">{link.label}</span>
                      <span className="text-sm">→</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mobile-menu-section action-section p-4 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</p>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex flex-col items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                    <FaRegBookmark className="text-xl text-gray-600 mb-1" />
                    <span className="text-xs font-medium text-gray-600">Saved</span>
                  </button>
                  <button className="flex flex-col items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200 relative">
                    <FaShoppingBag className="text-xl text-gray-600 mb-1" />
                    <span className="text-xs font-medium text-gray-600">Cart</span>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="mobile-menu-section footer-section p-4 border-t border-gray-100 bg-gray-50 mt-auto">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">© 2025 Tokari.com.np</p>
                  <p className="text-xs text-gray-500 mt-1">Find your best deal here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;