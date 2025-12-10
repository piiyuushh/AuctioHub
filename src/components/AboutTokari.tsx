import React from "react";
import { FaDollarSign, FaShieldAlt, FaSearch } from "react-icons/fa";

const AboutPriceRunner: React.FC = () => {
  return (
    <section className="relative bg-white text-black py-16 px-10 rounded-2xl overflow-hidden border border-gray-200 max-w-355 mx-auto mb-5">
      <div className="relative z-10 text-center">
      <h1 className="text-5xl font-bold text-black">About Tokari</h1>
      <p className="text-lg text-gray-700 mt-4 max-w-2xl mx-auto">
        Your ultimate destination for price comparison, helping you make smarter shopping decisions.
      </p>
      </div>
      
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {/** Feature Cards */} 
        <FeatureCard
          icon={<FaSearch className="text-black text-5xl" />}
          title="Best Price Finder"
          description="Compare prices from thousands of stores in Nepal and save money."
        />
        <FeatureCard
          icon={<FaShieldAlt className="text-black text-5xl" />}
          title="Independent & Trustworthy"
          description="We ensure unbiased and accurate comparisons, always."
        />
        <FeatureCard
          icon={<FaDollarSign className="text-black text-5xl" />}
          title="Affordable & Reliable"
          description="Access our platform and Buyer Protection at minimal cost."
        />
      </div>
    </section>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-center text-center p-8 rounded-xl shadow-md transition-transform transform hover:scale-105 bg-white border border-gray-200 hover:border-black"> 
      <div className="p-4 rounded-full bg-gray-100 shadow-lg">{icon}</div>
      <h2 className="text-2xl font-semibold text-black mt-4">{title}</h2>
      <p className="text-gray-700 text-sm mt-2">{description}</p>
    </div>
  );
};

export default AboutPriceRunner;