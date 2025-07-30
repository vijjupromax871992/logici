import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import ContactFormPopup from '../ContactFormPopup/ContactFormPopup';
import Login from '../Login/Login';
import Register from '../Register/Register';
import Logo from '../../assets/Logic-I-logo.png';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDesktopSolutions, setShowDesktopSolutions] = useState(false);
  const location = useLocation();
  const [showMobileSolutions, setShowMobileSolutions] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const showRegister = params.get('showRegister');
    const googleEmail = params.get('googleEmail');

    if (showRegister === 'true' && googleEmail) {
      navigate('/', { replace: true });
      alert(`${googleEmail} is not yet registered, kindly register.`);
      setShowRegister(true);
    }
  }, [location]);

  const handleWarehouseBookingClick = () => {
    navigate('/WarehouseSolution');
    setIsMobileMenuOpen(false);
    setShowDesktopSolutions(false);
  };

  const handleContactClick = () => {
    setIsPopupVisible(true);
    setIsMobileMenuOpen(false);
  };

  const handlePopupClose = () => {
    setIsPopupVisible(false);
  };

  const handleWSNavClick = (sectionId: string) => {
    navigate(`/WarehouseSolution?section=${sectionId}`);
    setIsMobileMenuOpen(false);
    setShowDesktopSolutions(false);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleSwitchToLogin = () => {
    setShowRegister(false);
    setTimeout(() => {
      setShowLogin(true);
    }, 100);
  };

  const handleSwitchToregister = () => {
    setShowLogin(false);
    setTimeout(() => {
      setShowRegister(true);
    }, 100);
  };

  return (
    <nav className="relative bg-gray-100">
      <div className="max-w-7xl mx-auto h-20 flex justify-between items-center px-4 md:px-6">
        {/* Logo */}
        <div className="cursor-pointer" onClick={handleLogoClick}>
          <img className="h-12 md:h-16 w-auto" src={Logo} alt="Logic-I Logo" />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {/* Warehouse Solutions Dropdown - Fixed */}
          <div className="relative">
            <button 
              className="text-[#00599c] font-bold hover:text-black transition-colors"
              onMouseEnter={() => setShowDesktopSolutions(true)}
              onMouseLeave={() => setShowDesktopSolutions(false)}
            >
              Solutions
            </button>
            {showDesktopSolutions && (
              <div 
                className="absolute top-full left-1/2 -translate-x-1/2 w-48 bg-white shadow-lg rounded-md overflow-hidden z-50 mt-1"
                onMouseEnter={() => setShowDesktopSolutions(true)}
                onMouseLeave={() => setShowDesktopSolutions(false)}
              >
                <a
                  href="/WarehouseSolution"
                  onClick={(e) => {
                    e.preventDefault();
                    handleWarehouseBookingClick();
                  }}
                  className="block px-4 py-2 text-black hover:bg-[#00599c] hover:text-white transition-colors"
                >
                  Warehouse Booking
                </a>
                {[
                  'WMS',
                  'AI',
                  'DarkStore',
                  'Inventory',
                  'Analytics',
                  'Industries',
                ].map((section) => (
                  <a
                    key={section}
                    href="/WarehouseSolution"
                    onClick={(e) => {
                      e.preventDefault();
                      handleWSNavClick(section);
                    }}
                    className="block px-4 py-2 text-black hover:bg-[#00599c] hover:text-white transition-colors"
                  >
                    {section}
                  </a>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleContactClick}
            className="text-[#00599c] font-bold hover:text-black transition-colors"
          >
            Contact Us
          </button>

          <button
            onClick={() => setShowLogin(true)}
            className="text-[#00599c] font-bold hover:text-black transition-colors"
          >
            Login
          </button>

          <button
            onClick={() => setShowRegister(true)}
            className="text-[#00599c] font-bold hover:text-black transition-colors"
          >
            Register
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-white shadow-lg z-50 max-w-7xl mx-auto">
          <div className="flex flex-col p-4">
            {/* Mobile Warehouse Solutions */}
            <div className="space-y-2">
              <p 
                onClick={() => setShowMobileSolutions(!showMobileSolutions)}
                className="font-bold text-[#00599c] cursor-pointer"
              >
                Solutions
              </p>
              {showMobileSolutions && (
                <div>
                  <a
                    href="/WarehouseSolution"
                    onClick={(e) => {
                      e.preventDefault();
                      handleWarehouseBookingClick();
                    }}
                    className="block px-4 py-2 text-black hover:bg-[#00599c] hover:text-white rounded transition-colors"
                  >
                    Warehouse Booking
                  </a>
                  {[
                    'WMS',
                    'AI',
                    'DarkStore',
                    'Inventory',
                    'Analytics',
                    'Industries',
                  ].map((section) => (
                    <a
                      key={section}
                      href="/WarehouseSolution"
                      onClick={(e) => {
                        e.preventDefault();
                        handleWSNavClick(section);
                      }}
                      className="block px-4 py-2 text-black hover:bg-[#00599c] hover:text-white rounded transition-colors"
                    >
                      {section}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleContactClick}
              className="text-[#00599c] font-bold hover:text-black transition-colors py-2 text-left"
            >
              Contact Us
            </button>
            <button
              onClick={() => setShowLogin(true)}
              className="text-[#00599c] font-bold hover:text-black transition-colors py-2 text-left"
            >
              Login
            </button>
            <button
              onClick={() => {
                setShowRegister(true);
                setIsMobileMenuOpen(false);
              }}
              className="text-[#00599c] font-bold hover:text-black transition-colors py-2 text-left"
            >
              Register
            </button>
          </div>
        </div>
      )}

      {/* Popups */}
      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          onShowRegister={handleSwitchToregister}
        />
      )}
      {showRegister && (
        <Register
          onClose={() => setShowRegister(false)}
          onShowLogin={handleSwitchToLogin}
        />
      )}
      {isPopupVisible && <ContactFormPopup onClose={handlePopupClose} />}
    </nav>
  );
};

export default Navbar;