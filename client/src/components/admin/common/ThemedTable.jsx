import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

const ThemedTable = ({ children, className = '' }) => {
  const { theme } = useTheme();

  return (
    <div 
      className={`overflow-hidden rounded-2xl border transition-all duration-300 ${className}`}
      style={{
        background: theme.cardBg,
        borderColor: theme.cardBorder,
        boxShadow: theme.cardShadow,
        backdropFilter: theme.glassBlur
      }}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full">
          {children}
        </table>
      </div>
    </div>
  );
};

const ThemedTableHeader = ({ children }) => {
  const { theme } = useTheme();

  return (
    <thead 
      className="border-b transition-colors duration-300"
      style={{
        background: theme.statsBg,
        borderColor: theme.cardBorder
      }}
    >
      {children}
    </thead>
  );
};

const ThemedTableHeaderCell = ({ children, className = '' }) => {
  const { theme } = useTheme();

  return (
    <th 
      className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${className}`}
      style={{ color: theme.textSecondary }}
    >
      {children}
    </th>
  );
};

const ThemedTableBody = ({ children }) => {
  const { theme } = useTheme();

  return (
    <tbody 
      className="divide-y transition-colors duration-300"
      style={{ backgroundColor: theme.surface, borderColor: theme.cardBorder }}
    >
      {children}
    </tbody>
  );
};

const ThemedTableRow = ({ children, className = '', onClick, isClickable = false }) => {
  const { theme } = useTheme();

  return (
    <tr 
      className={`border-b transition-all duration-200 ${isClickable ? 'cursor-pointer hover:scale-[1.01]' : ''} ${className}`}
      style={{ borderColor: theme.cardBorder }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (isClickable) {
          e.currentTarget.style.background = theme.surfaceHover;
        }
      }}
      onMouseLeave={(e) => {
        if (isClickable) {
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      {children}
    </tr>
  );
};

const ThemedTableCell = ({ children, className = '' }) => {
  const { theme } = useTheme();

  return (
    <td 
      className={`px-6 py-4 text-sm ${className}`}
      style={{ color: theme.textPrimary }}
    >
      {children}
    </td>
  );
};

const ThemedButton = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  onClick, 
  disabled = false, 
  className = '',
  ...props 
}) => {
  const { theme } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: theme.buttonPrimary,
          color: theme.textInverted,
          border: 'none'
        };
      case 'secondary':
        return {
          background: theme.buttonSecondary,
          color: theme.primary,
          border: `1px solid ${theme.cardBorder}`
        };
      case 'danger':
        return {
          background: theme.buttonDanger,
          color: theme.textInverted,
          border: 'none'
        };
      default:
        return {
          background: theme.buttonPrimary,
          color: theme.textInverted,
          border: 'none'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'px-3 py-1.5 text-xs';
      case 'medium':
        return 'px-4 py-2 text-sm';
      case 'large':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  return (
    <button
      className={`
        ${getSizeClasses()} 
        font-semibold rounded-xl transition-all duration-200 
        transform hover:scale-105 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${className}
      `}
      style={{
        ...getVariantStyles(),
        boxShadow: disabled ? 'none' : theme.cardShadow,
        opacity: disabled ? 0.5 : 1
      }}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.target.style.boxShadow = theme.cardHoverShadow;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.target.style.boxShadow = theme.cardShadow;
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
};

const ThemedCard = ({ children, className = '', onClick, isClickable = false }) => {
  const { theme } = useTheme();

  return (
    <div
      className={`
        rounded-2xl border p-6 transition-all duration-300 
        ${isClickable ? 'cursor-pointer hover:scale-[1.02]' : ''} 
        ${className}
      `}
      style={{
        background: theme.cardBg,
        borderColor: theme.cardBorder,
        boxShadow: theme.cardShadow,
        backdropFilter: theme.glassBlur
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (isClickable) {
          e.currentTarget.style.boxShadow = theme.cardHoverShadow;
        }
      }}
      onMouseLeave={(e) => {
        if (isClickable) {
          e.currentTarget.style.boxShadow = theme.cardShadow;
        }
      }}
    >
      {children}
    </div>
  );
};

const ThemedInput = ({ className = '', ...props }) => {
  const { theme } = useTheme();

  return (
    <input
      className={`
        w-full px-4 py-3 rounded-xl border transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-opacity-50
        ${className}
      `}
      style={{
        background: theme.inputBg,
        borderColor: theme.inputBorder,
        color: theme.textPrimary,
        focusRingColor: theme.inputFocus
      }}
      onFocus={(e) => {
        e.target.style.borderColor = theme.inputFocus;
        e.target.style.boxShadow = `0 0 0 3px ${theme.inputFocus}20`;
      }}
      onBlur={(e) => {
        e.target.style.borderColor = theme.inputBorder;
        e.target.style.boxShadow = 'none';
      }}
      {...props}
    />
  );
};

const ThemedSelect = ({ children, className = '', ...props }) => {
  const { theme } = useTheme();

  return (
    <select
      className={`
        w-full px-4 py-3 rounded-xl border transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-opacity-50
        ${className}
      `}
      style={{
        background: theme.inputBg,
        borderColor: theme.inputBorder,
        color: theme.textPrimary
      }}
      onFocus={(e) => {
        e.target.style.borderColor = theme.inputFocus;
        e.target.style.boxShadow = `0 0 0 3px ${theme.inputFocus}20`;
      }}
      onBlur={(e) => {
        e.target.style.borderColor = theme.inputBorder;
        e.target.style.boxShadow = 'none';
      }}
      {...props}
    >
      {children}
    </select>
  );
};

// Export all components
export {
  ThemedTable,
  ThemedTableHeader,
  ThemedTableHeaderCell,
  ThemedTableBody,
  ThemedTableRow,
  ThemedTableCell,
  ThemedButton,
  ThemedCard,
  ThemedInput,
  ThemedSelect
};