import React, { useState } from 'react';
import ContactFormPopup from '../ContactFormPopup/ContactFormPopup';
import heartImage from '../../assets/heart-icon.png';

const ThirdSection: React.FC = () => {
  const [isPopupVisible, setIsPopupVisible] = useState<boolean>(false);

  const handleContactClick = () => {
    setIsPopupVisible(true);
  };

  const handlePopupClose = () => {
    setIsPopupVisible(false);
  };

  return (
    <div className="bg-gray-50 py-12 px-4 md:px-8 text-center relative overflow-hidden w-full">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#00599c] mb-2 animate-[fadeIn_1s_ease-out]">
          Why Logic-i Stands Out
        </h2>
        
        <div className="flex flex-col md:flex-row justify-between gap-6 lg:gap-8 py-4 mt-6 animate-[fadeIn_1.5s_ease-in]">
          {/* Feature 1 */}
          <div className="flex-1 min-w-[220px] bg-white bg-opacity-80 p-4 md:p-6 rounded-xl backdrop-blur-sm shadow-md text-center relative transition-all duration-300 ease-in-out hover:transform hover:-translate-y-2 hover:shadow-xl hover:bg-gradient-to-br hover:from-[#00599c] hover:to-[#0077cc] hover:text-white group">
            <h3 className="text-lg md:text-xl text-[#00599c] font-bold my-2 group-hover:text-white">
              Proven Results
            </h3>
            <p className="text-sm md:text-base text-gray-700 group-hover:text-white">
              Clients cut costs by up to 30% with real-time analytics.
            </p>
          </div>
          
          {/* Feature 2 */}
          <div className="flex-1 min-w-[220px] bg-white bg-opacity-80 p-4 md:p-6 rounded-xl backdrop-blur-sm shadow-md text-center relative transition-all duration-300 ease-in-out hover:transform hover:-translate-y-2 hover:shadow-xl hover:bg-gradient-to-br hover:from-[#00599c] hover:to-[#0077cc] hover:text-white group">
            <h3 className="text-lg md:text-xl text-[#00599c] font-bold my-2 group-hover:text-white">
              Tailored Solutions
            </h3>
            <p className="text-sm md:text-base text-gray-700 group-hover:text-white">
              Customized for retail, healthcare, logistics, and more.
            </p>
          </div>
          
          {/* Feature 3 */}
          <div className="flex-1 min-w-[220px] bg-white bg-opacity-80 p-4 md:p-6 rounded-xl backdrop-blur-sm shadow-md text-center relative transition-all duration-300 ease-in-out hover:transform hover:-translate-y-2 hover:shadow-xl hover:bg-gradient-to-br hover:from-[#00599c] hover:to-[#0077cc] hover:text-white group">
            <h3 className="text-lg md:text-xl text-[#00599c] font-bold my-2 group-hover:text-white">
              Scalable AI
            </h3>
            <p className="text-sm md:text-base text-gray-700 group-hover:text-white">
              Solutions that grow with your business.
            </p>
          </div>
        </div>
        
        {/* CTA Button - using the same styling as HeroSection */}
        <button 
          className="mt-6 md:mt-8 px-6 py-3 bg-[#00599c] text-white font-semibold rounded-lg shadow-md hover:bg-[#dbb269] hover:text-black transition-colors duration-300"
          onClick={handleContactClick}
        >
          Book a Free Consultation
        </button>
        
        {/* Loved by businesses worldwide */}
        <div className="flex flex-col sm:flex-row items-center justify-center text-xl sm:text-2xl lg:text-3xl font-bold mt-6 md:mt-8 gap-2 sm:gap-0">
          <span className="text-[#dbb269]">Loved</span>
          <span className="mx-2">
            <img src={heartImage} alt="Heart Icon" className="w-8 h-8 sm:w-10 sm:h-10" />
          </span>
          <span className="text-[#00599c]">by businesses worldwide</span>
        </div>
      </div>
      
      {isPopupVisible && <ContactFormPopup onClose={handlePopupClose} />}
    </div>
  );
};

export default ThirdSection;