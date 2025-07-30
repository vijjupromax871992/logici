import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ContactFormPopup from '../ContactFormPopup/ContactFormPopup';
import image1 from '../../assets/Slider1-1.jpg';
import image2 from '../../assets/Software-Solutions2.jpg';

interface ContentData {
  [key: string]: {
    image: string;
    title: string;
    description: string;
    features: string[];
    footer: string;
    redirectPath?: string;
  };
}

const contentData: ContentData = {
  'Warehouse Solutions': {
    image: image1,
    title: 'Smart Warehouse Solutions for Every Business',
    description:
      'Logic-I delivers AI-powered warehousing in India, simplifying supply chains for startups, SMEs, and enterprises with flexible, tech-driven solutions.',
    features: [
      'Real-time Warehouse Booking',
      'Warehouse Management System (WMS)',
      'AI-Powered Solutions',
      'Dark Store Solutions',
      'Inventory Management',
      'Order Management',
      'Analytics & Insights',
      'Industries Served',
    ],
    footer: 'Transform Your Warehousing Today.',
    redirectPath: '/WarehouseSolution',
  },
  'Business Partner Solutions': {
    image: image2,
    title: 'Partner with Logic-I to Grow Your Warehouse Business',
    description:
      'List your warehouse with Logic-I and leverage our digital platform to maximize occupancy, optimize revenue, and transform your business operations.',
    features: [
      'Business Partner Panel',
      'Warehouse CRM',
      'Web & Mobile Dashboard',
      'Booking & Analytics',
      'Artificial Intelligence (AI)',
      'Occupancy Optimization',
      'Revenue Management',
      'End-to-End Digital Solutions',
    ],
    footer: 'Digitally Transform Your Warehouse Business Today.',
    redirectPath: '/SoftwareSolution',
  },
};

const SecondSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('Warehouse Solutions');
  const navigate = useNavigate();
  const [isPopupVisible, setIsPopupVisible] = useState<boolean>(false);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const handleContactClick = () => {
    setIsPopupVisible(true);
  };

  const handlePopupClose = () => {
    setIsPopupVisible(false);
  };

  const handleBookNowClick = () => {
    navigate('/WarehouseSolution');
  };

  const { image, title, description, features, footer } =
    contentData[activeTab];

  return (
    <div className="py-12 px-4 bg-gray-50 text-center">
      <div className="max-w-7xl mx-auto">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-10">
          <div
            className="flex space-x-2 p-2 rounded-full"
            style={{ backgroundColor: 'rgba(219, 178, 105, 0.3)' }}
          >
            {Object.keys(contentData).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`px-6 py-3 text-sm sm:text-base font-semibold rounded-full transition-all duration-300 text-black ${
                  tab === activeTab
                    ? 'bg-[#dbb269] shadow-md'
                    : 'bg-transparent shadow-none'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Image Section */}
          <div className="lg:w-1/2 flex justify-center">
            <div className="w-full max-w-md h-auto rounded-lg overflow-hidden shadow-lg">
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Content Section */}
          <div className="lg:w-1/2 text-left">
            <h3 className="text-2xl md:text-3xl font-bold text-[#00599c] mb-4">
              {title}
            </h3>
            <p className="text-gray-700 mb-6">{description}</p>

            {/* Features with tick icon */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mb-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-5 h-5 mt-1">
                    <svg
                      className="w-5 h-5 text-[#FF7B63]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <p className="text-[#00599c] font-semibold text-lg mb-6">
              {footer}
            </p>

            {/* CTA Buttons - Updated to match HeroSection alignment and functionality */}
            <div className="flex justify-start flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleBookNowClick}
                className="px-6 py-3 bg-[#00599c] text-white font-semibold rounded-lg shadow-md hover:bg-[#dbb269] hover:text-black transition-colors duration-300 text-center"
              >
                Book Now!
              </button>
              <button
                onClick={handleContactClick}
                className="px-6 py-3 bg-[#dbb269] text-black font-semibold rounded-lg shadow-md hover:bg-[#00599c] hover:text-white transition-colors duration-300 text-center"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>
      {isPopupVisible && <ContactFormPopup onClose={handlePopupClose} />}
    </div>
  );
};

export default SecondSection;