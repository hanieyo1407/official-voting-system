// web/components/Header.tsx


import React, { useState } from 'react';
import { Page } from '../types';

interface HeaderProps {
  setPage: (page: Page) => void;
  isOffline: boolean;
}

// Helper components for icons
const HamburgerIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
    </svg>
);

const CloseIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
);

const OfflineIcon = () => (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 010 12.728m-12.728 0a9 9 0 010-12.728m12.728 0L5.636 18.364m12.728-12.728L5.636 5.636"></path></svg>
);

const OfflineIndicator = () => (
  <div className="flex items-center text-yellow-300 text-sm font-semibold" aria-live="polite">
    <OfflineIcon />
    <span>Offline</span>
  </div>
);

const MobileOfflineIndicator = () => (
  <div className="flex items-center px-3 py-2 text-yellow-800 bg-yellow-100 rounded-md" aria-live="polite">
    <OfflineIcon />
    <span className="font-medium">You are currently offline</span>
  </div>
);

const Header: React.FC<HeaderProps> = ({ setPage, isOffline }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (page: Page) => {
    setPage(page);
    setIsMenuOpen(false); // Close menu on navigation
  };
  
  // ADDED: Handler for hidden Admin Access (Double-Click on Title)
  const goToAdminLogin = () => {
    handleNavClick(Page.AdminLogin);
  };


  return (
    <header className="bg-dmi-blue-800 text-white shadow-lg relative z-30">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo and Title - ADDED: Double-click listener for hidden Admin access */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavClick(Page.Home)} onDoubleClick={goToAdminLogin}>
          <svg className="w-10 h-10 text-dmi-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">DMI-SJBU Voting System</h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {isOffline && <OfflineIndicator />}
          <button onClick={() => handleNavClick(Page.Home)} className="hover:text-dmi-gold-500 transition-colors">Home</button>
          <button onClick={() => handleNavClick(Page.Results)} className="hover:text-dmi-gold-500 transition-colors">Results</button>
          {/* REMOVED: Winners Button */}
          {/* <button onClick={() => handleNavClick(Page.Winners)} className="hover:text-dmi-gold-500 transition-colors">Winners</button> */}
          <button onClick={() => handleNavClick(Page.Verification)} className="hover:text-dmi-gold-500 transition-colors">Verify Vote</button>
          <button onClick={() => handleNavClick(Page.Admin)} className="hover:text-dmi-gold-500 transition-colors">Admin</button>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white hover:text-dmi-gold-500 focus:outline-none focus:text-dmi-gold-500"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <nav className={`md:hidden bg-dmi-blue-800 absolute top-full left-0 w-full shadow-lg transform transition-all duration-300 ease-in-out ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {isOffline && <div className="px-1 py-1"><MobileOfflineIndicator /></div>}
              <button onClick={() => handleNavClick(Page.Home)} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-dmi-blue-700 hover:text-dmi-gold-500 transition-colors">Home</button>
              <button onClick={() => handleNavClick(Page.Results)} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-dmi-blue-700 hover:text-dmi-gold-500 transition-colors">Results</button>
              {/* REMOVED: Winners Button */}
              {/* <button onClick={() => handleNavClick(Page.Winners)} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-dmi-blue-700 hover:text-dmi-gold-500 transition-colors">Winners</button> */}
              <button onClick={() => handleNavClick(Page.Verification)} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-dmi-blue-700 hover:text-dmi-gold-500 transition-colors">Verify Vote</button>
              <button onClick={() => handleNavClick(Page.Admin)} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-dmi-blue-700 hover:text-dmi-gold-500 transition-colors">Admin</button>
          </div>
      </nav>
    </header>
  );
};

export default Header;