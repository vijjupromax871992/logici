import React from 'react';

interface Slide {
  image: string;
  headline: string;
  subHeadline: string;
  redirectPath?: string;
}

interface NavigationControlsProps {
  prevSlide: () => void;
  nextSlide: () => void;
  slides: Array<Slide>;
  currentSlide: number;
  onDotClick: (index: number) => void;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  prevSlide,
  nextSlide,
  slides,
  currentSlide,
  onDotClick,
}) => (
  <>
    <div className="absolute inset-y-0 left-0 flex items-center">
      <button 
        onClick={prevSlide}
        className="bg-white bg-opacity-50 hover:bg-opacity-75 rounded-r-lg p-2 focus:outline-none transform transition-transform hover:scale-110"
        aria-label="Previous slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>
    
    <div className="absolute inset-y-0 right-0 flex items-center">
      <button 
        onClick={nextSlide}
        className="bg-white bg-opacity-50 hover:bg-opacity-75 rounded-l-lg p-2 focus:outline-none transform transition-transform hover:scale-110"
        aria-label="Next slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <div className="absolute bottom-4 left-0 right-0">
      <div className="flex justify-center space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => onDotClick(index)}
            className={`w-3 h-3 rounded-full focus:outline-none transition-colors duration-300 ${
              index === currentSlide ? 'bg-indigo-800' : 'bg-gray-400 hover:bg-gray-600'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  </>
);

export default NavigationControls;