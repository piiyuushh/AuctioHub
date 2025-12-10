import React from "react";
import { 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaQuestionCircle,
  FaHeadset,
  FaBug,
  FaLightbulb,
  FaRocket,
  FaCheckCircle
} from "react-icons/fa";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ContactForm = () => {

  // ===== UPDATED FOR AUCTION PLATFORM =====
  const contactReasons = [
    {
      icon: FaQuestionCircle,
      title: "Auction Inquiry",
      description: "Questions related to active or upcoming auctions"
    },
    {
      icon: FaHeadset,
      title: "Bidding Support",
      description: "Issues with bidding, auto-bid, or bidding rules"
    },
    {
      icon: FaBug,
      title: "Report Auction Issue",
      description: "Suspicious activity, fake listings, or technical glitches"
    },
    {
      icon: FaLightbulb,
      title: "Feature Suggestion",
      description: "Recommend improvements for the bidding or selling experience"
    },
    {
      icon: FaRocket,
      title: "Seller Partnership",
      description: "For sellers interested in listing items regularly"
    }
  ];

  const responseTimeInfo = [
    {
      icon: FaCheckCircle,
      title: "Auction Support",
      time: "Within 12–24 hours",
      description: "Help with bidding, payments, seller verification, and disputes"
    },
    {
      icon: FaCheckCircle,
      title: "Seller Verification",
      time: "1–2 business days",
      description: "We verify new sellers to maintain platform trust"
    },
    {
      icon: FaCheckCircle,
      title: "Fraud & Issue Reports",
      time: "Within 48 hours",
      description: "We investigate suspicious activities seriously"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="w-full xl:px-8 2xl:px-0 2xl:max-w-[1800px] 2xl:mx-auto flex-grow">

      {/* Hero Section */}
      <section className="bg-gray-50 py-20 md:py-32 relative overflow-hidden">
        <div className="container mx-auto text-center relative z-10 px-4">
          <div className="inline-block px-6 py-3 bg-black text-white rounded-full text-sm font-medium mb-8">
            🏷 Auction Support Center
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 text-black">
            Need Assistance?
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed mb-12">
            Whether you&apos;re bidding, selling, or exploring auctions — our support 
            team is here to help you every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="bg-white text-black rounded-2xl px-6 py-4 border border-gray-400">
              <div className="text-2xl font-bold">12–24 hrs</div>
              <div className="text-sm text-gray-600">Support Response</div>
            </div>
            <div className="bg-white text-black rounded-2xl px-6 py-4 border border-gray-400">
              <div className="text-2xl font-bold">99%</div>
              <div className="text-sm text-gray-600">User Satisfaction</div>
            </div>
            <div className="bg-white text-black rounded-2xl px-6 py-4 border border-gray-400">
              <div className="text-2xl font-bold">5 Min</div>
              <div className="text-sm text-gray-600">Avg Platform Response</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Contact Us */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <div className="inline-block px-6 py-3 bg-black text-white rounded-full text-sm font-medium mb-6">
              How Can We Help?
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
              Choose the Right Support Option
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Get support for auctions, bidding issues, seller concerns, account 
              verification, or platform-related queries.
            </p>
          </div>

          {/* Reason Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-16">
            {contactReasons.map((reason, index) => {
              const IconComponent = reason.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-500 border-2 border-gray-200 group hover:-translate-y-2 hover:border-black"
                >
                  <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="text-white text-2xl" />
                  </div>
                  <h3 className="text-lg font-bold text-black mb-3">{reason.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{reason.description}</p>
                </div>
              );
            })}
          </div>

          {/* Response Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {responseTimeInfo.map((info, index) => {
              const IconComponent = info.icon;
              return (
                <div 
                  key={index} 
                  className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-black"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                      <IconComponent className="text-white text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-black mb-1">{info.title}</h3>
                      <div className="text-sm font-semibold text-black mb-2">{info.time}</div>
                      <p className="text-gray-600 text-sm">{info.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
                Contact Information
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Having trouble with bidding, listing, account setup, or payments?  
                Our team will make sure your auction journey is smooth and secure.
              </p>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4 p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-black hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                <FaPhone className="text-white text-lg" />
              </div>
              <div>
                <h3 className="font-semibold text-black text-lg mb-1">Phone</h3>
                <p className="text-gray-600">+977 1234567890</p>
                <p className="text-sm text-gray-500">Mon–Fri, 9am–6pm</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4 p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-black hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                <FaEnvelope className="text-white text-lg" />
              </div>
              <div>
                <h3 className="font-semibold text-black text-lg mb-1">Email</h3>
                <p className="text-gray-600">support@auctionplatform.com</p>
                <p className="text-sm text-gray-500">We reply within 24 hours</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-4 p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-black hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                <FaMapMarkerAlt className="text-white text-lg" />
              </div>
              <div>
                <h3 className="font-semibold text-black text-lg mb-1">Office</h3>
                <p className="text-gray-600">Kathmandu, Nepal</p>
                <p className="text-sm text-gray-500">Visit with prior appointment</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-200">
            <h3 className="text-2xl font-bold mb-6 text-black">Send Us a Message</h3>

            <form className="space-y-6">
              
              <div>
                <label className="block text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text"
                  className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email"
                  className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Subject</label>
                <input 
                  type="text"
                  className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                  placeholder="Auction, Bidding, Seller Support..."
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Message</label>
                <textarea 
                  className="w-full p-4 border rounded-lg h-32 resize-none focus:ring-2 focus:ring-black outline-none"
                  placeholder="Write your message..."
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-black text-white rounded-lg font-bold text-lg hover:bg-gray-800 transition"
              >
                Submit Message
              </button>

            </form>

          </div>

        </div>
      </section>

      </main>
      <Footer />
    </div>
  );
};

export default ContactForm;
