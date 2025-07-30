import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFacebook, FaLinkedin, FaTwitter, FaInstagram } from 'react-icons/fa';
import Logo from '../../assets/white-logo.png';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleWSNavClick = (sectionId: string) => {
    navigate(`/WarehouseSolution?section=${sectionId}`);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <footer className="bg-[#00599c] text-gray-100 py-10 px-5">
      <div className="flex flex-wrap justify-between gap-5 max-w-7xl mx-auto">
        {/* Company Info Section */}
        <div className="flex-1 basis-[200px] max-w-[400px] md:max-w-[350px] lg:max-w-[400px]">
          <div className="cursor-pointer mb-2" onClick={handleLogoClick}>
            <img
              className="w-[15vw] md:w-[13vw] lg:w-[15vw] sm:w-[20vw] xs:w-[25vw]"
              src={Logo}
              alt="Logic-I Logo"
            />
          </div>
          <p className="w-[300px] md:w-[70%] leading-7 text-base md:text-lg font-semibold sm:text-center sm:w-[90%] mx-0 sm:mx-auto md:mx-0">
            Your trusted partner in innovative warehousing, software, and
            business management solutions.
          </p>
        </div>

        {/* Quick Links Section */}
        <div className="flex-1 basis-[200px] max-w-[400px] md:max-w-[350px] lg:max-w-[400px] sm:max-w-[90%] sm:text-center">
          <h3 className="text-[#00d1c1] text-2xl md:text-xl lg:text-2xl font-semibold mb-3 xs:text-lg">
            Quick Links
          </h3>
          <ul className="list-none p-0 m-0">
            <li className="mb-3 xs:mb-2">
              <a
                href="/WarehouseSolution"
                className="text-gray-100 no-underline hover:text-[#00d1c1] transition-colors duration-300"
              >
                Warehouse Solutions
              </a>
            </li>
          </ul>
        </div>

        {/* Warehouse Solutions Section */}
        <div className="flex-1 basis-[200px] max-w-[400px] md:max-w-[350px] lg:max-w-[400px] sm:max-w-[90%] sm:text-center">
          <h3 className="text-[#00d1c1] text-2xl md:text-xl lg:text-2xl font-semibold mb-3 xs:text-lg">
            Warehouse Solutions
          </h3>
          <ul className="list-none p-0 m-0">
            <li className="mb-3 xs:mb-2">
              <a
                href="/WarehouseSolution"
                className="text-gray-100 no-underline hover:text-[#00d1c1] transition-colors duration-300"
              >
                Warehouse Booking
              </a>
            </li>
            <li className="mb-3 xs:mb-2">
              <a
                href="/WarehouseSolution"
                onClick={(e) => {
                  e.preventDefault();
                  handleWSNavClick('WMS');
                }}
                className="text-gray-100 no-underline hover:text-[#00d1c1] transition-colors duration-300"
              >
                Warehouse Management System (WMS)
              </a>
            </li>
            <li className="mb-3 xs:mb-2">
              <a
                href="/WarehouseSolution"
                onClick={(e) => {
                  e.preventDefault();
                  handleWSNavClick('AI');
                }}
                className="text-gray-100 no-underline hover:text-[#00d1c1] transition-colors duration-300"
              >
                AI-Powered Solutions
              </a>
            </li>
            <li className="mb-3 xs:mb-2">
              <a
                href="/WarehouseSolution"
                onClick={(e) => {
                  e.preventDefault();
                  handleWSNavClick('DarkStore');
                }}
                className="text-gray-100 no-underline hover:text-[#00d1c1] transition-colors duration-300"
              >
                Dark Store Solutions
              </a>
            </li>
            <li className="mb-3 xs:mb-2">
              <a
                href="/WarehouseSolution"
                onClick={(e) => {
                  e.preventDefault();
                  handleWSNavClick('Inventory');
                }}
                className="text-gray-100 no-underline hover:text-[#00d1c1] transition-colors duration-300"
              >
                Inventory & Order Management
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Info Section */}
        <div className="flex-1 basis-[200px] max-w-[400px] md:max-w-[350px] lg:max-w-[400px] sm:max-w-[90%] sm:text-center">
          <h3 className="text-[#00d1c1] text-2xl md:text-xl lg:text-2xl font-semibold mb-3 xs:text-lg">
            Contact Us
          </h3>
          <p className="text-gray-100 leading-6">Bhandup (W), Mumbai - 78</p>
          <p className="text-gray-100 leading-6">Phone: </p>
          <p className="text-gray-100 leading-6">+91 87798 59089</p>
          <p className="text-gray-100 leading-6">
            Email:{' '}
            <a
              href="mailto:info@logic-i.com"
              className="text-[#00d1c1] no-underline"
            >
              info@logic-i.com
            </a>
          </p>
          {/* Social icons section - commented out as in original 
          <div className="flex space-x-3 sm:justify-center">
            <a href="#facebook" className="text-gray-100 text-xl hover:text-[#00d1c1] transition-colors duration-300">
              <FaFacebook />
            </a>
            <a href="#linkedin" className="text-gray-100 text-xl hover:text-[#00d1c1] transition-colors duration-300">
              <FaLinkedin />
            </a>
            <a href="#twitter" className="text-gray-100 text-xl hover:text-[#00d1c1] transition-colors duration-300">
              <FaTwitter />
            </a>
            <a href="#instagram" className="text-gray-100 text-xl hover:text-[#00d1c1] transition-colors duration-300">
              <FaInstagram />
            </a>
          </div> */}
        </div>
      </div>

      {/* Footer Bottom Section */}
      <div className="border-t border-gray-700 pt-4 mt-8 flex justify-between items-center flex-wrap sm:flex-col sm:text-center">
        <p className="m-0">
          &copy; {new Date().getFullYear()} Logic-i. All rights reserved.
        </p>
        <div className="space-x-4">
          <a
            href="/privacy-policy"
            className="text-gray-100 no-underline text-sm hover:text-[#00d1c1] transition-colors duration-300 xs:text-xs"
          >
            Privacy Policy
          </a>
          <a
            href="/terms-of-service"
            className="text-gray-100 no-underline text-sm hover:text-[#00d1c1] transition-colors duration-300 xs:text-xs"
          >
            Terms of Service
          </a>
          &nbsp;&nbsp;
          <button
            className="text-white underline bg-transparent border-none p-0 font-inherit cursor-pointer xs:text-xs"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Back to Top
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
