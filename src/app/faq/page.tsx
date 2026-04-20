"use client";
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { FiChevronDown, FiChevronUp, FiSearch, FiHelpCircle } from 'react-icons/fi';
import Link from 'next/link';

const FAQPage = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqCategories = [
    {
      title: 'Getting Started',
      items: [
        {
          question: 'What is AuctioHub?',
          answer:
            'AuctioHub is a Next.js auction marketplace where users can browse featured items, view new arrivals, join timed auctions, and manage their own listings from a single dashboard.'
        },
        {
          question: 'Do I need an account to use the platform?',
          answer:
            'You can browse the homepage, categories, and public auction pages without signing in, but you need an account to place bids, create auctions, and access your dashboard.'
        },
        {
          question: 'Where do I find products and featured items?',
          answer:
            'The homepage shows the carousel banner and the latest new arrival products, while category pages and search help you explore active auction listings.'
        }
      ]
    },
    {
      title: 'Bidding & Auction Flow',
      items: [
        {
          question: 'How do I place a bid?',
          answer:
            'Open an auction detail page, review the current bid and remaining time, enter a higher amount, and submit the bid after signing in.'
        },
        {
          question: 'How does the auction timer work?',
          answer:
            'Each auction has a fixed end time. The page shows a live countdown, and the server also checks the end time when bids are submitted so expired auctions cannot be bid on.'
        },
        {
          question: 'What happens when an auction ends?',
          answer:
            'When time runs out, the highest bidder becomes the winner. The auction is marked ended and the winner can continue through the payment flow if the listing requires it.'
        }
      ]
    },
    {
      title: 'Selling & Listings',
      items: [
        {
          question: 'How do I create an auction listing?',
          answer:
            'Sellers can add a product, upload images, set the starting bid, choose an auction end time, and publish the listing from the seller flow in the app.'
        },
        {
          question: 'Can I end or extend my own auction?',
          answer:
            'Yes. The seller controls support ending an active auction early and extending it when the listing still has time remaining, subject to the app rules.'
        },
        {
          question: 'Can I change a listing after bidding starts?',
          answer:
            'You can update some listing details, but the auction price and active bidding state are protected once bidding has started to keep the process fair.'
        }
      ]
    },
    {
      title: 'Payments & Notifications',
      items: [
        {
          question: 'What happens after I win an item?',
          answer:
            'You receive the winning status in your account flow and must complete the required payment step before the order is finalized.'
        },
        {
          question: 'How are payment completions handled?',
          answer:
            'The app finalizes the auction after the payment completion route runs, which updates the product state and records the result of the auction lifecycle.'
        },
        {
          question: 'Will I get updates about my bids?',
          answer:
            'Yes. The project includes a notification system so users can be informed about auction activity, winning bids, and important account events.'
        }
      ]
    },
    {
      title: 'Account & Support',
      items: [
        {
          question: 'Where can I view my activity?',
          answer:
            'Signed-in users can use the user dashboard to check their profile, auction activity, and other account-related information.'
        },
        {
          question: 'Who can manage the admin pages?',
          answer:
            'Admin routes are restricted to users with the ADMIN role. They can manage carousel content, users, new arrivals, auction stats, and utility tools.'
        },
        {
          question: 'How do I contact support?',
          answer:
            'Use the Contact page to reach the support team for bidding issues, seller questions, account help, or suspicious activity reports.'
        }
      ]
    }
  ];


  const filteredCategories = faqCategories.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      {/* Main Content - Takes up remaining space */}
      <main className="flex-1 py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <FiHelpCircle className="text-3xl text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find answers about auctions, bidding, selling, payments, and account features in AuctioHub
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-10 max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400 text-lg" />
            </div>
            <input
              type="text"
              placeholder="Search FAQs..."
              className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* FAQ Content */}
          {filteredCategories.length > 0 ? (
            <div className="space-y-6">
              {filteredCategories.map((category, catIndex) => (
                <div key={catIndex} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                  <h2 className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 text-lg font-semibold text-gray-900 border-b border-gray-200">
                    {category.title}
                  </h2>
                  <div className="divide-y divide-gray-100">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="px-6 py-4 transition-all duration-200 hover:bg-gray-50">
                        <button
                          className="flex justify-between items-center w-full text-left focus:outline-none group"
                          onClick={() => toggleAccordion(catIndex * 100 + itemIndex)}
                        >
                          <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200 pr-4">
                            {item.question}
                          </h3>
                          <div className="flex-shrink-0">
                            {activeIndex === catIndex * 100 + itemIndex ? (
                              <FiChevronUp className="text-blue-600 text-xl transition-transform duration-200" />
                            ) : (
                              <FiChevronDown className="text-gray-500 text-xl transition-transform duration-200 group-hover:text-blue-600" />
                            )}
                          </div>
                        </button>
                        <div 
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            activeIndex === catIndex * 100 + itemIndex 
                              ? 'max-h-96 opacity-100 mt-4' 
                              : 'max-h-0 opacity-0'
                          }`}
                        >
                          <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                            <p className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.answer }}></p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <FiSearch className="text-2xl text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">Try different search terms or browse all categories</p>
            </div>
          )}

          {/* Contact Support Section */}
          <div className="mt-16 bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <FiHelpCircle className="text-2xl text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Still need help?</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
            </p>
            <Link 
              href="/contact" 
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-all duration-300 group"
            >
              <FiHelpCircle className="mr-2 group-hover:animate-pulse" />
              Contact Support
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQPage;
