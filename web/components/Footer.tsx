// web/components/Footer.tsx

import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-br from-dmi-blue-950 via-dmi-blue-900 to-dmi-blue-950 text-white mt-auto overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-64 h-64 bg-dmi-gold-500 rounded-full filter blur-3xl animate-pulse-subtle"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-dmi-blue-600 rounded-full filter blur-3xl animate-pulse-subtle" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Top Border with Gradient */}
      <div className="h-1 bg-gradient-to-r from-dmi-blue-800 via-dmi-gold-500 to-dmi-blue-800"></div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-dmi-gold-500 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <img 
                  src="https://res.cloudinary.com/unihousingmw/image/upload/v1757613228/cropped-MALAWI-LOGO_efmzsu.webp"
                  alt="DMI Logo"
                  className="relative w-12 h-12 object-contain transform group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-dmi-gold-500 to-yellow-300 bg-clip-text text-transparent">
                  DMI-SJBU
                </h3>
                <p className="text-xs text-dmi-blue-300">Voting System</p>
              </div>
            </div>
            <p className="text-sm text-dmi-blue-300 leading-relaxed">
              Empowering democratic participation through secure, transparent, and innovative digital voting solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-dmi-gold-500 rounded-full"></span>
              Quick Links
            </h3>
            <ul className="space-y-3">
              {['Home', 'Results', 'Verify Vote', 'About'].map((link, idx) => (
                <li key={idx}>
                  <a href="#" className="group flex items-center gap-2 text-sm text-dmi-blue-300 hover:text-dmi-gold-500 transition-all duration-200">
                    <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="group-hover:translate-x-1 transition-transform">{link}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-dmi-gold-500 rounded-full"></span>
              Key Features
            </h3>
            <ul className="space-y-3">
              {[
                'End-to-End Encryption',
                'Real-time Updates',
                'Vote Verification',
                'Mobile Optimized'
              ].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm text-dmi-blue-300">
                  <svg className="w-4 h-4 text-dmi-gold-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Developer */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-dmi-gold-500 rounded-full"></span>
              Developed By
            </h3>
            <div className="p-4 bg-gradient-to-br from-dmi-blue-800/50 to-dmi-blue-900/50 rounded-lg border border-dmi-blue-700/50 backdrop-blur-sm">
              <p className="text-sm font-semibold text-dmi-gold-500 mb-1">
                DMI-SJBU
              </p>
              <p className="text-xs text-dmi-blue-200 mb-3">
                Science & Engineering Club
              </p>
              <div className="pt-3 border-t border-dmi-blue-700/50">
                <p className="text-xs text-dmi-blue-300 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-dmi-gold-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                  </svg>
                  Innovate tomorrow, today at Mangochi.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-dmi-blue-700/50"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-gradient-to-r from-transparent via-dmi-blue-900 to-transparent">
              <svg className="w-6 h-6 text-dmi-gold-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </span>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="space-y-6">
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { label: 'Secure', desc: '256-bit Encryption' },
              { label: 'Transparent', desc: 'Open Results' },
              { label: 'Fast', desc: 'Real-time Processing' },
              { label: 'Verified', desc: 'Auditable System' }
            ].map((badge, idx) => (
              <div 
                key={idx}
                className="group flex items-center gap-3 px-4 py-2 bg-dmi-blue-800/30 hover:bg-dmi-blue-800/50 rounded-lg border border-dmi-blue-700/50 hover:border-dmi-gold-500/50 transition-all duration-300 cursor-default"
              >
                <div className="w-2 h-2 rounded-full bg-dmi-gold-500 group-hover:scale-125 transition-transform"></div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-white">{badge.label}</p>
                  <p className="text-xs text-dmi-blue-300">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Copyright & Legal */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-dmi-blue-400">
            <div className="flex items-center gap-2">
              <span>&copy; {currentYear} DMI-SJBU. All Rights Reserved.</span>
            </div>
            
            <div className="flex items-center gap-4 text-xs">
              <a href="#" className="hover:text-dmi-gold-500 transition-colors">Privacy Policy</a>
              <span className="text-dmi-blue-600">•</span>
              <a href="#" className="hover:text-dmi-gold-500 transition-colors">Terms of Service</a>
              <span className="text-dmi-blue-600">•</span>
              <a href="#" className="hover:text-dmi-gold-500 transition-colors">Help Center</a>
            </div>
          </div>

          {/* Version Info */}
 
        </div>
      </div>

      {/* Bottom Gradient Bar */}
      <div className="h-1.5 bg-gradient-to-r from-dmi-blue-900 via-dmi-gold-500 to-dmi-blue-900"></div>
    </footer>
  );
};

export default Footer;