// src/components/WarehouseSolution/ws-section-1/ws-section-1.tsx
import React from 'react';

interface WSSection1Props {
  onContactClick: () => void;
}

const WSSection1: React.FC<WSSection1Props> = ({ onContactClick }) => {
  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContactClick();
  };

  return (
    <section className="relative w-full bg-gray-50 min-h-[600px] flex items-center">
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Main Headline */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#00599c] leading-tight">
            Warehouse Booking Solutions
          </h1>
          
          {/* Subheadline */}
          <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-700 leading-relaxed">
            Empower Your Warehouse with Next-Gen AI Solutions: Boost Efficiency,
            Optimize Inventory, and Maximize Space Utilization
          </h2>
          
          {/* Description */}
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8 mx-auto text-left max-w-3xl">
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
              At Logic-i, we drive efficiency, optimize inventory, and elevate
              logistics management with our cutting-edge AI-powered platform.
              Our advanced solutions empower warehouse operations through
              real-time insights and intelligent automation, streamlining
              processes, reducing costs, and maximizing space utilization. With
              Logic-i, you gain the tools to transform your logistics into a
              high-performing, future-ready operation. Our commitment to
              innovation and excellence means you can trust us to support your
              growth with scalable solutions tailored to your unique needs.
              Partner with Logic-i and experience a smarter, more efficient way
              to manage your supply chain.
            </p>
          </div>

          <div className="pt-4">
            <button
              className="px-6 py-3 bg-[#00599c] text-white font-semibold rounded-lg shadow-md hover:bg-[#dbb269] hover:text-black transition-colors duration-300 text-center"
              onClick={handleButtonClick}
              type="button"
            >
              Book Now!
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-2xl font-bold text-[#00599c]">500+</div>
              <div className="text-sm text-gray-600">Warehouses Listed</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-2xl font-bold text-[#00599c]">24/7</div>
              <div className="text-sm text-gray-600">AI-Powered Support</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-2xl font-bold text-[#00599c]">99%</div>
              <div className="text-sm text-gray-600">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </div>


    </section>
  );
};

export default WSSection1;