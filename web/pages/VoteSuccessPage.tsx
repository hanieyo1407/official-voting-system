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
      <Card className="max-w-2xl mx-auto text-center p-8">
        <svg className="w-20 h-20 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h2 className="text-3xl font-bold text-dmi-blue-900">Vote Submitted Successfully!</h2>
        <p className="text-gray-600 mt-2">Your votes have been securely and anonymously recorded.</p>
        
        <div className="my-8">
          <p className="text-gray-700">Your Verification Code:</p>
          <div className="my-2 p-4 bg-dmi-blue-50 border-2 border-dashed border-dmi-blue-300 rounded-lg">
            <p className="text-3xl font-mono font-bold text-dmi-blue-800 tracking-widest">{verificationCode}</p>
          </div>
          <p className="font-semibold text-red-600">SAVE THIS CODE!</p>
          <p className="text-sm text-gray-500">Use it to verify your vote was counted after the election.</p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button onClick={handlePrint} variant="secondary">Print Receipt</Button>
          <Button onClick={() => setPage(Page.Home)}>Finish & Go to Home</Button>
        </div>
      </Card>
    </div>
  );
};

export default VoteSuccessPage;
