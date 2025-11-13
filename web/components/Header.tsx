// web/components/Header.tsx

import React, { useState } from 'react';
import { Page } from '../types';

interface HeaderProps {
  setPage: (page: Page) => void;
  isOffline: boolean;
}

// Helper components for icons
const HamburgerIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const OfflineIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 010 12.728m-12.728 0a9 9 0 010-12.728m12.728 0L5.636 18.364m12.728-12.728L5.636 5.636" />
  </svg>
);

const OfflineIndicator = () => (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 backdrop-blur-sm rounded-full text-yellow-200 text-sm font-medium border border-yellow-500/30" aria-live="polite">
    <OfflineIcon />
    <span>Offline Mode</span>
  </div>
);

const MobileOfflineIndicator = () => (
  <div className="flex items-center gap-2 px-4 py-2.5 text-yellow-800 bg-yellow-100 rounded-lg border border-yellow-200" aria-live="polite">
    <OfflineIcon />
    <span className="font-medium">You are currently offline</span>
  </div>
);

const Header: React.FC<HeaderProps> = ({ setPage, isOffline }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (page: Page) => {
    setPage(page);
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-gradient-to-r from-dmi-blue-900 via-dmi-blue-800 to-dmi-blue-900 text-white shadow-2xl relative z-30 border-b border-dmi-blue-700/50">
      <div className="container mx-auto px-4 sm:px-6 py-3.5 sm:py-4 flex justify-between items-center">
        {/* Logo and Title */}
        <div className="flex items-center gap-3 sm:gap-4 group relative">
          {/* Logo */}
          <div 
            onClick={() => handleNavClick(Page.Admin)}
            className="relative transition-all duration-300 group-hover:scale-105 cursor-pointer"
          >
            <img 
              src="https://res.cloudinary.com/unihousingmw/image/upload/v1757613228/cropped-MALAWI-LOGO_efmzsu.webp"
              alt="DMI Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-lg"
            />
          </div>
          
          <div className="cursor-pointer">
            <h1 
              onClick={() => handleNavClick(Page.Home)}
              onDoubleClick={() => handleNavClick(Page.AdminLogin)}
              className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent drop-shadow-sm"
            >
              DMI-SJBU Voting System
            </h1>
            <p className="text-xs text-dmi-blue-300 font-medium hidden sm:block">
              Secure & Transparent Elections
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-4">
          {isOffline && <OfflineIndicator />}
          
          <button 
            onClick={() => handleNavClick(Page.Home)} 
            className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-dmi-blue-700/50 hover:text-dmi-gold-500 active:scale-95"
          >
            Home
          </button>
          <button 
            onClick={() => handleNavClick(Page.Results)} 
            className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-dmi-blue-700/50 hover:text-dmi-gold-500 active:scale-95"
          >
            Results
          </button>
          <button 
            onClick={() => handleNavClick(Page.Verification)} 
            className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-dmi-blue-700/50 hover:text-dmi-gold-500 active:scale-95"
          >
            Verify Vote
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-lg text-white hover:bg-dmi-blue-700/50 hover:text-dmi-gold-500 focus:outline-none focus:ring-2 focus:ring-dmi-gold-500/50 transition-all duration-200 active:scale-95"
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <nav 
        className={`md:hidden bg-gradient-to-b from-dmi-blue-800 to-dmi-blue-900 absolute top-full left-0 w-full shadow-2xl border-t border-dmi-blue-700/50 transform transition-all duration-300 ease-in-out ${
          isMenuOpen 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="px-4 py-4 space-y-2">
          {isOffline && (
            <div className="mb-3">
              <MobileOfflineIndicator />
            </div>
          )}
          
          <button 
            onClick={() => handleNavClick(Page.Home)} 
            className="block w-full text-left px-4 py-3 rounded-lg text-base font-medium hover:bg-dmi-blue-700/50 hover:text-dmi-gold-500 transition-all duration-200 active:scale-98"
          >
            Home
          </button>
          <button 
            onClick={() => handleNavClick(Page.Results)} 
            className="block w-full text-left px-4 py-3 rounded-lg text-base font-medium hover:bg-dmi-blue-700/50 hover:text-dmi-gold-500 transition-all duration-200 active:scale-98"
          >
            Results
          </button>
          <button 
            onClick={() => handleNavClick(Page.Verification)} 
            className="block w-full text-left px-4 py-3 rounded-lg text-base font-medium hover:bg-dmi-blue-700/50 hover:text-dmi-gold-500 transition-all duration-200 active:scale-98"
          >
            Verify Vote
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;