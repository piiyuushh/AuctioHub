import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-[#F7F7F7] to-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[#393E46] mb-4">
              Privacy Policy
            </h1>
            <p className="text-[#929AAB] text-lg">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to AuctioHub. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy will inform you about how we look after your personal data when you visit our 
                website and tell you about your privacy rights and how the law protects you.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">Information We Collect</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may collect, use, store and transfer different kinds of personal data about you:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span><strong className="text-[#393E46]">Identity Data:</strong> First name, last name, username, and profile information.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span><strong className="text-[#393E46]">Contact Data:</strong> Email address, phone number, and billing address.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span><strong className="text-[#393E46]">Transaction Data:</strong> Details about payments to and from you and other details of products and services you have purchased from us.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span><strong className="text-[#393E46]">Technical Data:</strong> Internet protocol (IP) address, browser type and version, time zone setting, browser plug-in types and versions, operating system and platform.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span><strong className="text-[#393E46]">Usage Data:</strong> Information about how you use our website, products and services.</span>
                </li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>To register you as a new customer and manage your account</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>To process and deliver your orders including managing payments and collecting money owed to us</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>To manage our relationship with you including notifying you about changes to our terms or privacy policy</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>To administer and protect our business and website including troubleshooting, data analysis, and system testing</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>To deliver relevant website content and advertisements to you and measure the effectiveness of advertising</span>
                </li>
              </ul>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">Data Security</h2>
              <p className="text-gray-700 leading-relaxed">
                We have put in place appropriate security measures to prevent your personal data from being accidentally 
                lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your 
                personal data to those employees, agents, contractors and other third parties who have a business need to 
                know. They will only process your personal data on our instructions and they are subject to a duty of confidentiality.
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, 
                including for the purposes of satisfying any legal, accounting, or reporting requirements. To determine the 
                appropriate retention period for personal data, we consider the amount, nature, and sensitivity of the personal 
                data, the potential risk of harm from unauthorized use or disclosure of your personal data, the purposes for 
                which we process your personal data and whether we can achieve those purposes through other means.
              </p>
            </section>

            {/* Your Legal Rights */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">Your Legal Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Under certain circumstances, you have rights under data protection laws in relation to your personal data:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span><strong className="text-[#393E46]">Request access</strong> to your personal data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span><strong className="text-[#393E46]">Request correction</strong> of your personal data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span><strong className="text-[#393E46]">Request erasure</strong> of your personal data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span><strong className="text-[#393E46]">Object to processing</strong> of your personal data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span><strong className="text-[#393E46]">Request restriction</strong> of processing your personal data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span><strong className="text-[#393E46]">Request transfer</strong> of your personal data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span><strong className="text-[#393E46]">Right to withdraw consent</strong></span>
                </li>
              </ul>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">Cookies</h2>
              <p className="text-gray-700 leading-relaxed">
                Our website uses cookies to distinguish you from other users of our website. This helps us to provide you 
                with a good experience when you browse our website and also allows us to improve our site. A cookie is a 
                small file of letters and numbers that we store on your browser or the hard drive of your computer if you agree. 
                Cookies contain information that is transferred to your computer&apos;s hard drive.
              </p>
            </section>

            {/* Third-Party Links */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">Third-Party Links</h2>
              <p className="text-gray-700 leading-relaxed">
                Our website may include links to third-party websites, plug-ins and applications. Clicking on those links or 
                enabling those connections may allow third parties to collect or share data about you. We do not control these 
                third-party websites and are not responsible for their privacy statements. When you leave our website, we 
                encourage you to read the privacy policy of every website you visit.
              </p>
            </section>

            {/* Contact Us */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about this privacy policy or our privacy practices, please contact us:
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

            {/* Changes to Privacy Policy */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update our privacy policy from time to time. We will notify you of any changes by posting the new 
                privacy policy on this page and updating the &quot;Last updated&quot; date at the top of this privacy policy. 
                You are advised to review this privacy policy periodically for any changes.
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
