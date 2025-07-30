import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useSlideManager from './useSlideManager';
import SLIDES from './SlideContent';
import ContactFormPopup from '../ContactFormPopup/ContactFormPopup';
import { BACKEND_URL } from '../../config/api';

const HeroSection: React.FC = () => {
  const { currentSlide, setCurrentSlide, prevSlide, nextSlide, setIsHovered } =
    useSlideManager(SLIDES.length);

  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const searchTimeoutRef = useRef(null);
  const suggestionsRef = useRef(null);

  const handleContactClick = () => setIsPopupVisible(true);
  const handlePopupClose = () => setIsPopupVisible(false);

  const handleBookCallClick = () => {
    const selectedSlide = SLIDES[currentSlide];
    if (selectedSlide.redirectPath) {
      navigate(`${selectedSlide.redirectPath}?showContactForm=true`);
    } else {
      setIsPopupVisible(true);
    }
  };

  // Debounced search function
  const searchWarehouses = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/public/warehouses/search?query=${encodeURIComponent(query)}&limit=8`);
      const data = await response.json();
      
      if (data.success) {
        setSuggestions(data.data);
        setShowSuggestions(true);
      }
    } catch (error) {
      // Handle error silently
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input change with debouncing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      searchWarehouses(query);
    }, 300);
  };

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/warehouses?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: any) => {
    navigate(`/warehouses/${suggestion.id}`);
    setShowSuggestions(false);
    setSearchQuery('');
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative overflow-hidden bg-gray-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col md:flex-row items-center justify-between px-4 py-8 md:py-12 md:px-4 lg:py-4 max-w-7xl mx-auto">
        {/* Slide Content */}
        <div className="w-full md:w-1/2 md:pl-10 space-y-4 text-left">
          <h2 className="text-2xl text-left md:text-3xl lg:text-4xl font-bold text-[#00599c] leading-tight">
            {SLIDES[currentSlide].headline}
          </h2>
          <p className="text-base md:text-lg text-gray-700 mb-6">
            {SLIDES[currentSlide].subHeadline}
          </p>
          <div className="flex justify-start flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-20">
            <button
              onClick={handleBookCallClick}
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
          {/* Search Bar */}
          <div className="mt-6 w-[80%]" ref={suggestionsRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search warehouse solutions..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00599c] text-gray-900 bg-white placeholder-gray-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#00599c] hover:text-[#dbb269] focus:outline-none transition-colors cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>

              {/* Auto-suggestions dropdown */}
              {showSuggestions && (searchQuery.length >= 3) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  {isLoading ? (
                    <div className="px-4 py-3 text-gray-500 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#00599c] mr-2"></div>
                        Searching...
                      </div>
                    </div>
                  ) : suggestions.length > 0 ? (
                    suggestions.map((suggestion: any) => (
                      <div
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{suggestion.name}</div>
                        <div className="text-sm text-gray-600 flex items-center">
                          <span className="mr-2">📍 {suggestion.location}</span>
                          <span className="text-xs bg-gray-200 px-2 py-1 rounded">{suggestion.type}</span>
                        </div>
                        {suggestion.description && (
                          <div className="text-xs text-gray-500 mt-1 truncate">
                            {suggestion.description}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-500 text-center">
                      No warehouses found. Try different keywords.
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Slide Image */}
        <div className="w-full md:w-1/2 flex justify-end mb-6 md:mb-0">
          <div className="relative w-[30rem] h-[30rem]  aspect-square overflow-hidden rounded-lg shadow-xl">
            <img
              src={SLIDES[currentSlide].image}
              alt={SLIDES[currentSlide].headline}
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute inset-y-0 left-0 flex items-center">
        <button
          onClick={prevSlide}
          className="bg-white bg-opacity-50 hover:bg-opacity-75 rounded-r-lg p-2 focus:outline-none transform transition-transform hover:scale-110"
          aria-label="Previous slide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-indigo-900"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      <div className="absolute inset-y-0 right-0 flex items-center">
        <button
          onClick={nextSlide}
          className="bg-white bg-opacity-50 hover:bg-opacity-75 rounded-l-lg p-2 focus:outline-none transform transition-transform hover:scale-110"
          aria-label="Next slide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-indigo-900"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Dot Navigation */}
      <div className="absolute bottom-0 left-0 right-0 py-0">
        <div className="flex justify-center space-x-8">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-5 h-5 p-0 m-0 rounded-full focus:outline-none transition-colors duration-300 ${index === currentSlide
                  ? 'bg-indigo-800'
                  : 'bg-gray-400 hover:bg-gray-600'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {isPopupVisible && <ContactFormPopup onClose={handlePopupClose} />}
    </div>
  );
};

export default HeroSection;
