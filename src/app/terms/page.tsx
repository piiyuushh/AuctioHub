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
              Terms of Use
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
                Welcome to AuctioHub, an online auction platform for browsing listings, placing bids, managing seller listings, and completing auction payments. By accessing or using the platform, you agree to these Terms of Use and to follow all applicable laws and platform rules.
              </p>
            </section>

            {/* Account Registration */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">2. Account Registration</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Some features are public, but bidding, selling, notifications, and dashboard access require an account:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>You must provide accurate and current information when creating or updating your profile</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>You are responsible for keeping your account credentials secure</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>You are responsible for activity performed through your account</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>You must notify us if you suspect unauthorized access or account misuse</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Admin pages and admin APIs are reserved for users with the ADMIN role</span>
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
                  <span>Bids are binding once submitted and cannot be withdrawn</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>You may only bid on active auctions that have not ended</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>The server validates auction status and end time before accepting bids</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>You must not place bids to manipulate prices, interfere with fairness, or disrupt auction activity</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>If you win an auction, you are expected to complete the required payment flow in time</span>
                </li>
              </ul>
            </section>

            {/* Seller Responsibilities */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">4. Seller Responsibilities</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you create or manage listings on AuctioHub, you agree to:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Provide accurate titles, descriptions, pricing, and images for each listing</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Only list products you own or are authorized to sell</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Honor valid winning bids and follow the auction outcome generated by the platform</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Use seller controls responsibly, including ending or extending only your own active auctions when permitted</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Comply with all applicable laws and platform rules for the goods you list</span>
                </li>
              </ul>
            </section>

            {/* Buyer Responsibilities */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">5. Buyer Responsibilities</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you place bids or win items on AuctioHub, you agree to:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Complete payment when required after winning an auction</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Review product details, auction timing, and bid values before submitting offers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Keep your profile details up to date so account and payment flows work correctly</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Use the platform in good faith and do not interfere with other users&apos; bidding activity</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Report suspicious listings, bid abuse, or technical issues through the contact channels provided</span>
                </li>
              </ul>
            </section>

            {/* Payment and Fees */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">6. Payment and Fees</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Payment and order finalization depend on the auction flow used in the app:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Winning bids may need to be completed through the platform&apos;s payment process</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Once payment is processed, the system finalizes the auction and updates the product state</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Any platform service charges, if introduced, will be shown before you confirm a transaction</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>All fee-related changes will be communicated in advance where applicable</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Payment disputes or failed completions may affect your access to auction features</span>
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
                  <span>List counterfeit, stolen, illegal, or misleading items</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Engage in fraudulent bidding, fake listings, or deceptive practices</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Harass, threaten, or abuse other users or support staff</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Violate laws, regulations, or third-party rights</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Interfere with the platform&apos;s operation or security</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Use bots, scripts, or automated tools to manipulate bidding or scrape content</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Attempt unauthorized access to accounts, admin routes, or backend systems</span>
                </li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">8. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed">
                All platform content, including the homepage carousel, new arrivals, UI text, and software, belongs to AuctioHub or its licensors and is protected by applicable intellectual property laws. Listing images, descriptions, and other user-submitted content remain your responsibility, but by uploading them you grant AuctioHub permission to host, display, and process them for platform operation.
              </p>
            </section>

            {/* Notifications and Support */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">9. Notifications and Support</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The platform may send notifications about bids, winning auctions, account actions, and other important events:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Notifications may be delivered through in-app or account-based channels</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>You are responsible for checking your account and contact details regularly</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Support may review reports involving suspicious activity, bidding issues, or listing problems</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Support requests should be submitted through the contact page or other published channels</span>
                </li>
              </ul>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">10. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                AuctioHub is a marketplace platform connecting buyers, sellers, and administrators. We do not guarantee that every auction will end in a sale, every payment will succeed, or every listing will be error-free. To the maximum extent permitted by law, AuctioHub is not liable for indirect, incidental, or consequential damages arising from your use of the service.
              </p>
            </section>

            {/* Warranty Disclaimer */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">11. Warranty Disclaimer</h2>
              <p className="text-gray-700 leading-relaxed">
                AuctioHub is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind. We do not guarantee uninterrupted uptime, error-free bidding, or uninterrupted payment processing. You use the service at your own risk.
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
                  <span>Suspend or terminate accounts that violate these Terms or abuse the platform</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Remove listings, bids, or content that violate our policies</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>Restrict access to auction features, admin areas, or notifications when necessary for safety or integrity</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#929AAB] mr-3 mt-1">•</span>
                  <span>You may request account closure through the support contact channels</span>
                </li>
              </ul>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">13. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms of Use are governed by the laws of Nepal. Any disputes arising from your use of AuctioHub are subject to the jurisdiction of the courts of Nepal.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">14. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update these Terms of Use when the platform changes, including features such as auctions, seller tools, notifications, or payment flow. Continued use of AuctioHub after an update means you accept the revised terms.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-[#393E46] mb-4">15. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms of Use, please contact us:
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
                By using AuctioHub, you acknowledge that you have read, understood, and agree to these Terms of Use.
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
