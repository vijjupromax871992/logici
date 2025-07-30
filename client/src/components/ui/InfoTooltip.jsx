// src/components/ui/InfoTooltip.jsx
import { useState } from 'react';
import PropTypes from 'prop-types';
import { Info } from 'lucide-react';

const InfoTooltip = ({ content }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block ml-1">
      <button
        type="button"
        className="p-1 text-gray-400 hover:text-gray-300 focus:outline-none"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        aria-label="More information"
      >
        <Info className="h-4 w-4" />
      </button>
      
      {isVisible && (
        <div className="absolute z-10 w-64 p-3 mt-2 text-sm bg-gray-700 rounded-lg shadow-lg border border-gray-600 left-0 transform -translate-x-1/2 md:left-auto md:transform-none">
          <div className="absolute -top-2 left-0 md:left-1/4 w-4 h-4 bg-gray-700 transform rotate-45 border-t border-l border-gray-600"></div>
          <p className="text-gray-200">{content}</p>
        </div>
      )}
    </div>
  );
};

InfoTooltip.propTypes = {
  content: PropTypes.string.isRequired
};

export default InfoTooltip;