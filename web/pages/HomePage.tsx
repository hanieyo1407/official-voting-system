// web/pages/HomePage.tsx

import React from 'react';
import { Page, ElectionStatus } from '../types';
import Button from '../components/Button';
import Card from '../components/Card';
import CountdownTimer from '../components/CountdownTimer';

interface HomePageProps {
  setPage: (page: Page) => void;
  electionStatus: ElectionStatus;
  electionStartDate: Date;
  electionEndDate: Date;
}

const HomePage: React.FC<HomePageProps> = ({ setPage, electionStatus, electionStartDate, electionEndDate }) => {
  const phases = [
    {
      icon: <svg className="w-12 h-12 text-dmi-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>,
      title: '1. Get Your Code',
      description: 'Receive your unique, single-use voucher from the student affairs office. This is your secure key to the ballot.',
    },
    {
      icon: <svg className="w-12 h-12 text-dmi-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>,
      title: '2. Cast Your Vote',
      description: 'Enter your voucher, make your selections, and cast your vote. It\'s fast, anonymous, and your progress is saved if you go offline.',
    },
    {
      icon: <svg className="w-12 h-12 text-dmi-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 018.618-3.04 11.955 11.955 0 018.618 3.04 12.02 12.02 0 00-3-15.008z"></path></svg>,
      title: '3. Verify Your Impact',
      description: 'After voting, you get a unique receipt code. Use it after the election on our portal to confirm your vote was successfully counted.',
    },
  ];

  const renderTimerSection = () => {
    switch(electionStatus) {
      case 'PRE_ELECTION':
        return <CountdownTimer targetDate={electionStartDate} title="Election Starts In" onCompleteMessage="The Election is Now Live!" />;
      case 'LIVE':
        return <CountdownTimer targetDate={electionEndDate} title="Voting Closes In" onCompleteMessage="Voting has officially ended." />;
      case 'POST_ELECTION':
        return (
          <div className="text-center p-6 bg-white/20 backdrop-blur-sm rounded-lg shadow-lg">
              <h3 className="text-2xl sm:text-3xl font-bold text-white">The 2025 Student Elections have concluded.</h3>
          </div>
        );
      default:
        return null;
    }
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center bg-white rounded-xl shadow-lg p-12 mb-12">
        <h2 className="text-4xl md:text-5xl font-extrabold text-dmi-blue-900">Shape Your University's Future</h2>
        <h1 className="text-2xl md:text-3xl font-bold text-dmi-blue-700 mt-2">Secure & Simple Electronic Voting for the 2025 Student Elections</h1>
        <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
          Your Voice. Your Vote. Your DEMWAYE. Participate in building a better campus community.
        </p>

        <div className="my-10 p-6 bg-dmi-blue-700 rounded-xl">
          {renderTimerSection()}
        </div>

        <div className="flex justify-center items-center space-x-4">
          <Button size="lg" onClick={() => setPage(Page.Authentication)} disabled={electionStatus !== 'LIVE'}>
            Cast Your Vote Now
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
          </Button>
          <Button size="lg" variant="secondary" onClick={() => setPage(Page.Results)}>
            View Results
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {phases.map((phase) => (
          <Card key={phase.title} className="text-center p-8 hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-4">{phase.icon}</div>
            <h3 className="text-xl font-bold text-dmi-blue-800 mb-2">{phase.title}</h3>
            <p className="text-gray-600">{phase.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HomePage;