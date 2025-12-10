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
    title: 'General Questions',
    items: [
      {
        question: 'What is this auction platform?',
        answer:
          'Our platform is a modern online auction marketplace where users can browse listings, place bids, and sell their own items through timed auctions. It is designed to provide a secure, transparent, and seamless bidding experience.'
      },
      {
        question: 'Is the platform free to use?',
        answer:
          'Yes, browsing and bidding are completely free. Sellers may only be charged small service fees when listing or selling items, depending on the category and selling type.'
      },
      {
        question: 'How do auctions work?',
        answer:
          'Auctions run for a fixed duration. During this time, bidders place increasing bids. The highest bidder at the end of the auction wins the item, provided they meet all seller requirements.'
      }
    ]
  },
  {
    title: 'Bidding & Buying',
    items: [
      {
        question: 'How do I place a bid?',
        answer:
          'Simply open any auction listing, enter your bid amount, and confirm. If your bid meets or exceeds the minimum increment, it will be accepted.'
      },
      {
        question: 'What happens if I win an auction?',
        answer:
          'You will receive a confirmation message on your dashboard and via email. You must complete payment within the specified time. After payment, the seller will ship or hand over the item.'
      },
      {
        question: 'Can I cancel a bid?',
        answer:
          'No, bids cannot be canceled once placed. Please review your bid carefully before submitting to maintain fairness for all participants.'
      }
    ]
  },
  {
    title: 'Selling & Listings',
    items: [
      {
        question: 'How can I list an item for auction?',
        answer:
          'Go to the "My Listings" section and click "Create Auction". Provide item details, photos, starting price, reserve price (optional), and auction duration.'
      },
      {
        question: 'What is a reserve price?',
        answer:
          'A reserve price is the minimum amount you are willing to accept for your item. If the bidding does not reach this amount, the item will not be sold.'
      },
      {
        question: 'Can I edit my listing after it goes live?',
        answer:
          'Certain details like title and description can be edited, but changes to the starting price or reserve price are restricted once bidding begins.'
      }
    ]
  },
  {
    title: 'Payments & Transactions',
    items: [
      {
        question: 'What payment methods are supported?',
        answer:
          'We support multiple payment methods including digital wallets (eSewa, Khalti), bank transfer, and cash on delivery depending on the seller’s preferences.'
      },
      {
        question: 'When do I pay for an item I won?',
        answer:
          'Winning bidders must complete payment within the payment window stated in the auction rules. Failure to do so may result in penalties or account restrictions.'
      },
      {
        question: 'Does the platform charge any transaction fee?',
        answer:
          'Buyers are not charged extra fees. Sellers may be charged a platform service fee after a successful sale, which varies by category.'
      }
    ]
  },
  {
    title: 'Account & Technical Issues',
    items: [
      {
        question: 'Do I need an account to participate in auctions?',
        answer:
          'Yes, you must create an account to place bids and list items. Browsing auctions is open to all users.'
      },
      {
        question: 'Why is my bid not being accepted?',
        answer:
          'This may happen due to slow internet, the bid being below the minimum increment, or another user placing a higher bid simultaneously. Try refreshing and placing your bid again.'
      },
      {
        question: 'How can I report a problem or suspicious activity?',
        answer:
          'You can report any issue using the "Report" button on item pages or contact our support team directly through the help section.'
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
              Find answers about our price comparison service for Nepali online shopping platforms
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
