import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function TermsAndConditions() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-[#F7F7F7] to-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[#393E46] mb-4">
              Terms and Conditions
            </h1>
            <p className="text-[#929AAB] text-lg">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to AuctioHub. These Terms and Conditions govern your use of our website and services. 
                By accessing or using AuctioHub, you agree to be bound by these Terms and Conditions. If you 
                disagree with any part of these terms, you may not access our service.
              </p>
            </section>

            {/* Account Registration */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">2. Account Registration</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To use certain features of AuctioHub, you must register for an account:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>You must provide accurate, current, and complete information during the registration process</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>You must be at least 18 years old to create an account</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>You are responsible for maintaining the confidentiality of your account credentials</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>You are responsible for all activities that occur under your account</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>You must notify us immediately of any unauthorized use of your account</span>
                </li>
              </ul>
            </section>

            {/* Bidding Rules */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">3. Bidding Rules</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                When participating in auctions on AuctioHub, the following rules apply:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>All bids are binding and cannot be retracted once placed</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>You agree to purchase items you win at the final bid price</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Bidding must be done in good faith without intent to manipulate auction outcomes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Shill bidding, bid manipulation, or fraudulent activity will result in account termination</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>AuctioHub reserves the right to cancel any bid or auction at its discretion</span>
                </li>
              </ul>
            </section>

            {/* Seller Responsibilities */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">4. Seller Responsibilities</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you are selling items on AuctioHub, you agree to:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Provide accurate and complete descriptions of items listed for auction</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Only sell items that you legally own or have authorization to sell</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Honor all winning bids and complete transactions in a timely manner</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Ship items promptly and package them securely</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Comply with all applicable laws and regulations regarding the sale of goods</span>
                </li>
              </ul>
            </section>

            {/* Buyer Responsibilities */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">5. Buyer Responsibilities</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you are purchasing items on AuctioHub, you agree to:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Complete payment for items won within the specified timeframe</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Provide accurate shipping and contact information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Communicate promptly with sellers regarding transactions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Review item descriptions carefully before placing bids</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Report any issues or disputes through proper channels</span>
                </li>
              </ul>
            </section>

            {/* Payment and Fees */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">6. Payment and Fees</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                AuctioHub may charge fees for certain services:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Listing fees may apply when posting items for auction</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Commission fees may be charged on successful sales</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Payment processing fees may apply to transactions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>All fees will be clearly disclosed before you incur them</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>We reserve the right to modify our fee structure with advance notice</span>
                </li>
              </ul>
            </section>

            {/* Prohibited Activities */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">7. Prohibited Activities</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may not use AuctioHub to:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Sell counterfeit, stolen, or illegal items</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Engage in fraudulent or deceptive practices</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Harass, threaten, or abuse other users</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Violate any laws, regulations, or third-party rights</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Interfere with or disrupt the platform&apos;s operation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Use automated systems to manipulate bidding or scrape data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Attempt to gain unauthorized access to accounts or systems</span>
                </li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">8. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed">
                All content on AuctioHub, including text, graphics, logos, images, and software, is the property 
                of AuctioHub or its content suppliers and is protected by international copyright laws. You may not 
                reproduce, distribute, modify, or create derivative works from any content on our platform without 
                express written permission. User-generated content remains the property of the user, but by posting 
                content, you grant AuctioHub a worldwide, non-exclusive, royalty-free license to use, display, and 
                distribute that content on our platform.
              </p>
            </section>

            {/* Disputes and Resolution */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">9. Disputes and Resolution</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                In the event of disputes between users:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Users are encouraged to resolve disputes directly and amicably</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>AuctioHub may provide dispute resolution assistance but is not obligated to do so</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>We reserve the right to suspend accounts involved in disputes pending resolution</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Users may report disputes through our support system</span>
                </li>
              </ul>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">10. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                AuctioHub acts as a marketplace platform connecting buyers and sellers. We are not responsible for 
                the quality, safety, legality, or accuracy of items listed. We do not guarantee that transactions 
                will be completed successfully. To the maximum extent permitted by law, AuctioHub shall not be liable 
                for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or 
                revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other 
                intangible losses resulting from your use of our services.
              </p>
            </section>

            {/* Warranty Disclaimer */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">11. Warranty Disclaimer</h2>
              <p className="text-gray-700 leading-relaxed">
                AuctioHub is provided &quot;as is&quot; and &quot;as available&quot; without any warranties of any kind, either 
                express or implied. We do not warrant that the service will be uninterrupted, timely, secure, or 
                error-free. We do not warrant the accuracy or reliability of any information obtained through the 
                service. You use the service at your own risk.
              </p>
            </section>

            {/* Account Termination */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">12. Account Termination</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                AuctioHub reserves the right to:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Suspend or terminate your account for violation of these Terms</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Remove any content that violates our policies</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Refuse service to anyone for any reason at any time</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>You may terminate your account at any time by contacting support</span>
                </li>
              </ul>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">13. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms and Conditions shall be governed by and construed in accordance with the laws of Nepal. 
                Any disputes arising from these terms or your use of AuctioHub shall be subject to the exclusive 
                jurisdiction of the courts of Nepal.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">14. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms and Conditions at any time. We will notify users of any 
                material changes by posting the new Terms on this page and updating the &quot;Last updated&quot; date. Your 
                continued use of AuctioHub after any changes constitutes acceptance of the new Terms and Conditions.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">15. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms and Conditions, please contact us:
              </p>
              <div className="bg-[#F7F7F7] rounded-xl p-6 space-y-2">
                <p className="text-gray-700">
                  <strong className="text-[#393E46]">Email:</strong>{' '}
                  <a href="mailto:piyushkarn76@gmail.com" className="text-[#929AAB] hover:underline">
                    piyushkarn76@gmail.com
                  </a>
                </p>
                <p className="text-gray-700">
                  <strong className="text-[#393E46]">Location:</strong> Kathmandu, Nepal
                </p>
                <p className="text-gray-700">
                  <strong className="text-[#393E46]">Phone:</strong>{' '}
                  <a href="tel:+9779812345678" className="text-[#929AAB] hover:underline">
                    +977 98-12345678
                  </a>
                </p>
              </div>
            </section>

            {/* Acceptance */}
            <section className="border-t-2 border-[#EEEEEE] pt-6">
              <p className="text-gray-700 leading-relaxed text-center font-medium">
                By using AuctioHub, you acknowledge that you have read, understood, and agree to be bound by these 
                Terms and Conditions.
              </p>
            </section>
          </div>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#393E46] to-[#4a4e56] text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
