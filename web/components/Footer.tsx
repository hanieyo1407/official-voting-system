import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dmi-blue-900 text-white py-6 mt-12">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} DMI-SJBU. All Rights Reserved.</p>
        <p className="text-xs mt-1">Developed & Powered by DMI-SJBU Science and Tech Club</p>
      </div>
    </footer>
  );
};

export default Footer;