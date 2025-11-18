// web/pages/VoteSuccessPage.tsx

import React from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import { Page } from '../types';

interface VoteSuccessPageProps {
  verificationCode: string;
  setPage: (page: Page) => void;
}

const VoteSuccessPage: React.FC<VoteSuccessPageProps> = ({ verificationCode, setPage }) => {
  const handlePrint = () => window.print();

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
      <Card className="max-w-2xl mx-auto text-center p-6 sm:p-8">
        <svg className="w-16 h-16 sm:w-20 sm:h-20 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h2 className="text-2xl sm:text-3xl font-bold text-dmi-blue-900">Vote Submitted Successfully!</h2>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">Your votes have been securely and anonymously recorded.</p>
        
        <div className="my-6 sm:my-8">
          <p className="text-gray-700 text-sm">Your Verification Code:</p>
          <div className="my-2 p-3 sm:p-4 bg-dmi-blue-50 border-2 border-dashed border-dmi-blue-300 rounded-lg">
            <p className="text-2xl sm:text-3xl font-mono font-bold text-dmi-blue-800 tracking-widest">{verificationCode}</p>
          </div>
          <p className="font-semibold text-red-600 mt-1">SAVE THIS CODE!</p>
          <p className="text-xs sm:text-sm text-gray-500">Use it to verify your vote was counted after the election.</p>
        </div>

        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center items-center gap-3">
          <Button onClick={handlePrint} variant="secondary" className="w-full sm:w-auto">Print Receipt</Button>
          <Button onClick={() => setPage(Page.Home)} className="w-full sm:w-auto">Finish &amp; Go to Home</Button>
        </div>
      </Card>
    </div>
  );
};

export default VoteSuccessPage;
