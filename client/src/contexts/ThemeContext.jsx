import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const themes = {
  light: {
    name: 'Cohesive Light Theme',
    // Base colors
    background: '#f8f9fa',
    surface: '#ffffff',
    surfaceHover: '#f1f3f4',
    
    // Card styles
    cardBg: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
    cardBorder: 'rgba(59, 130, 246, 0.15)',
    cardShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
    cardHoverShadow: '0 12px 40px rgba(59, 130, 246, 0.15)',
    
    // Glass morphism
    glassBg: 'rgba(255, 255, 255, 0.25)',
    glassBlur: 'blur(16px)',
    glassBorder: 'rgba(255, 255, 255, 0.18)',
    
    // Primary colors
    primary: '#1e40af',
    primaryHover: '#1d4ed8',
    primaryLight: '#dbeafe',
    primaryGradient: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
    
    // Accent colors
    accent: '#06b6d4',
    accentLight: '#cffafe',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    
    // Text colors
    textPrimary: '#1f2937',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
    textInverted: '#ffffff',
    
    // Navigation
    navBg: 'rgba(255, 255, 255, 0.95)',
    navBorder: 'rgba(59, 130, 246, 0.1)',
    navShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    
    // Stats cards
    statsBg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.1) 100%)',
    statsHover: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 197, 253, 0.15) 100%)',
    
    // Form elements
    inputBg: '#ffffff',
    inputBorder: '#e5e7eb',
    inputFocus: '#3b82f6',
    
    // Buttons
    buttonPrimary: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
    buttonSecondary: 'rgba(59, 130, 246, 0.1)',
    buttonDanger: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  },
  
  dark: {
    name: 'Modern Dark Theme',
    // Base colors
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    surface: 'rgba(30, 41, 59, 0.8)',
    surfaceHover: 'rgba(51, 65, 85, 0.8)',
    
    // Card styles
    cardBg: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.8) 100%)',
    cardBorder: 'rgba(6, 182, 212, 0.3)',
    cardShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    cardHoverShadow: '0 12px 40px rgba(6, 182, 212, 0.2)',
    
    // Glass morphism
    glassBg: 'rgba(30, 41, 59, 0.4)',
    glassBlur: 'blur(20px)',
    glassBorder: 'rgba(148, 163, 184, 0.1)',
    
    // Primary colors
    primary: '#06b6d4',
    primaryHover: '#0891b2',
    primaryLight: 'rgba(6, 182, 212, 0.1)',
    primaryGradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    
    // Accent colors
    accent: '#3b82f6',
    accentLight: 'rgba(59, 130, 246, 0.1)',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    
    // Text colors
    textPrimary: '#f1f5f9',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    textInverted: '#0f172a',
    
    // Navigation
    navBg: 'rgba(15, 23, 42, 0.95)',
    navBorder: 'rgba(6, 182, 212, 0.2)',
    navShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    
    // Stats cards
    statsBg: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)',
    statsHover: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(59, 130, 246, 0.2) 100%)',
    
    // Form elements
    inputBg: 'rgba(30, 41, 59, 0.6)',
    inputBorder: 'rgba(148, 163, 184, 0.2)',
    inputFocus: '#06b6d4',
    
    // Buttons
    buttonPrimary: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    buttonSecondary: 'rgba(6, 182, 212, 0.1)',
    buttonDanger: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    localStorage.setItem('admin-theme', newTheme);
  };

  const theme = themes[currentTheme];

  const value = {
    currentTheme,
    theme,
    toggleTheme,
    isLightTheme: currentTheme === 'light',
    isDarkTheme: currentTheme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};