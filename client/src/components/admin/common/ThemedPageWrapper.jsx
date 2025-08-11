import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

const ThemedPageWrapper = ({ children, title, subtitle }) => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen transition-all duration-300" style={{ background: theme.background }}>
      <div className="p-3 sm:p-4 md:p-6">
        {title && (
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2" style={{ color: theme.textPrimary }}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm sm:text-base" style={{ color: theme.textSecondary }}>
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className="themed-content">
          {children}
        </div>
      </div>
      
      {/* Global theming styles */}
      <style jsx global>{`
        .themed-content {
          /* Override default card backgrounds */
        }
        
        .themed-content .bg-gray-900,
        .themed-content .bg-gray-800,
        .themed-content .bg-slate-800,
        .themed-content .bg-slate-900 {
          background: ${theme.cardBg} !important;
          border: 1px solid ${theme.cardBorder} !important;
          backdrop-filter: ${theme.glassBlur} !important;
        }
        
        .themed-content .text-white,
        .themed-content .text-gray-100,
        .themed-content .text-slate-100 {
          color: ${theme.textPrimary} !important;
        }
        
        .themed-content .text-gray-400,
        .themed-content .text-gray-300,
        .themed-content .text-slate-400 {
          color: ${theme.textSecondary} !important;
        }
        
        .themed-content .border-gray-700,
        .themed-content .border-gray-600,
        .themed-content .border-slate-700 {
          border-color: ${theme.cardBorder} !important;
        }
        
        .themed-content button:not(.theme-toggle) {
          transition: all 0.2s ease-in-out !important;
        }
        
        .themed-content button:not(.theme-toggle):hover {
          transform: scale(1.05) !important;
        }
        
        .themed-content .hover\\:bg-gray-700:hover,
        .themed-content .hover\\:bg-gray-600:hover {
          background: ${theme.surfaceHover} !important;
        }
        
        /* Form elements */
        .themed-content input,
        .themed-content select,
        .themed-content textarea {
          background: ${theme.inputBg} !important;
          border-color: ${theme.inputBorder} !important;
          color: ${theme.textPrimary} !important;
        }
        
        .themed-content input:focus,
        .themed-content select:focus,
        .themed-content textarea:focus {
          border-color: ${theme.inputFocus} !important;
          box-shadow: 0 0 0 3px ${theme.inputFocus}20 !important;
        }
      `}</style>
    </div>
  );
};

export default ThemedPageWrapper;