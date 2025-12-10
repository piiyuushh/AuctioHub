"use client";
import React, { useState } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/solid";

interface SearchResult {
  id: string | number;
  name: string;
  image?: string;
  category?: string;
  rating?: number;
  price?: number;
  discount?: number;
  originalPrice?: number;
  inStock?: boolean;
  [key: string]: string | number | boolean | null | undefined;
}

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  size?: "small" | "medium" | "large";
  
  showResults?: boolean;
  results?: SearchResult[];
  onResultClick?: (result: SearchResult) => void;
  renderResult?: (result: SearchResult) => React.ReactNode;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search products...",
  className = "",
  size = "medium",
  showResults = false,
  results = [],
  onResultClick,
  renderResult,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const sizeClasses = {
    small: {
      input: "pl-10 pr-10 py-2 text-sm",
      icon: "h-4 w-4 left-3",
      clearIcon: "h-4 w-4 right-3",
      container: "text-sm"
    },
    medium: {
      input: "pl-12 pr-10 py-3 text-base",
      icon: "h-5 w-5 left-4",
      clearIcon: "h-4 w-4 right-3",
      container: "text-base"
    },
    large: {
      input: "pl-12 pr-12 py-4 text-lg",
      icon: "h-6 w-6 left-4",
      clearIcon: "h-5 w-5 right-4",
      container: "text-lg"
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`relative ${className}`}>
      <div className={`relative transition-all duration-300 ${isFocused ? "scale-105" : ""}`}>
        <MagnifyingGlassIcon 
          className={`absolute ${currentSize.icon} top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
            isFocused ? "text-black" : "text-gray-400"
          }`} 
        />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full ${currentSize.input} border-2 bg-white rounded-xl placeholder-gray-500 focus:outline-none transition-all duration-300 ${
            isFocused ? "border-black shadow-lg" : "border-gray-200 hover:border-gray-300"
          }`}
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className={`absolute ${currentSize.clearIcon} top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black transition-colors`}
          >
            <XMarkIcon />
          </button>
        )}
        {isFocused && (
          <div className="absolute inset-0 bg-black/5 rounded-xl blur animate-pulse"></div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && isFocused && value && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <p className="text-sm text-gray-600">
              <span className="font-bold text-black">{results.length}</span> results for 
              <span className="font-bold text-black"> &quot;{value}&quot;</span>
            </p>
          </div>
          {results.map((result, index) => (
            <div
              key={index}
              onClick={() => onResultClick?.(result)}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
            >
              {renderResult ? renderResult(result) : (
                <div className="flex items-center gap-3">
                  <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{result.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
