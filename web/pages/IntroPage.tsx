// web/pages/IntroPage.tsx

import React, { useEffect } from 'react';
import { Page } from '../types';

interface IntroPageProps {
  setPage: (page: Page) => void;
}

const IntroPage: React.FC<IntroPageProps> = ({ setPage }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(Page.Home);
    }, 3500); // Wait for 3.5 seconds before navigating

    // Cleanup the timer if the component is unmounted
    return () => clearTimeout(timer);
  }, [setPage]);

  return (
    <div className="fixed inset-0 bg-dmi-blue-800 flex flex-col items-center justify-center z-50">
      <div className="flex flex-col items-center justify-center text-center">
        {/* Logo */}
        <div className="animate-fade-in-scale opacity-0">
          <svg className="w-24 h-24 text-dmi-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-6 animate-fade-in-delay opacity-0">
          DMI-SJBU Voting System
        </h1>

        {/* Subtitle/Loading Indicator */}
        <p className="text-dmi-blue-200 mt-4 animate-fade-in-delay opacity-0 animate-pulse-subtle">
          Securing Your Voice...
        </p>
      </div>
    </div>
  );
};

export default IntroPage;
