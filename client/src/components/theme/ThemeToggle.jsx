import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = ({ className = "" }) => {
  const { currentTheme, toggleTheme, theme } = useTheme();
  const isLight = currentTheme === 'light';

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={toggleTheme}
        className="relative flex items-center justify-between w-16 h-8 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-105"
        style={{
          background: theme.primaryGradient,
          boxShadow: theme.cardShadow,
          focusRingColor: theme.primary
        }}
        title={`Switch to ${isLight ? 'Dark' : 'Light'} Theme`}
      >
        {/* Toggle Circle */}
        <div
          className={`absolute top-1 w-6 h-6 rounded-full transition-all duration-300 ease-in-out flex items-center justify-center shadow-lg transform ${
            isLight ? 'translate-x-1' : 'translate-x-9'
          }`}
          style={{
            background: theme.surface,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
          }}
        >
          {isLight ? (
            // Sun Icon
            <svg className="w-4 h-4" style={{ color: theme.warning }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
            </svg>
          ) : (
            // Moon Icon
            <svg className="w-4 h-4" style={{ color: theme.primary }} fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        {/* Theme Labels */}
        <div className="flex items-center justify-between w-full px-2 text-xs font-medium">
          <span 
            className={`transition-opacity duration-300 ${isLight ? 'opacity-100' : 'opacity-60'}`}
            style={{ color: theme.textInverted }}
          >
            ☀
          </span>
          <span 
            className={`transition-opacity duration-300 ${!isLight ? 'opacity-100' : 'opacity-60'}`}
            style={{ color: theme.textInverted }}
          >
            ☾
          </span>
        </div>
      </button>

      {/* Theme Name Tooltip */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div 
          className="px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap"
          style={{
            background: theme.cardBg,
            border: `1px solid ${theme.cardBorder}`,
            color: theme.textPrimary,
            boxShadow: theme.cardShadow
          }}
        >
          {theme.name}
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle;