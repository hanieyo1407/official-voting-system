import React, { useState, useEffect, useCallback } from 'react';
import { Page, Position, Candidate, AdminUser, ElectionStatus } from './types';
import {  ELECTION_START_DATE, ELECTION_END_DATE } from './constants';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AuthenticationPage from './pages/AuthenticationPage';
import VotingPage from './pages/VotingPage';
import VoteSuccessPage from './pages/VoteSuccessPage';
import VerificationPage from './pages/VerificationPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLoginPage from './pages/AdminLoginPage';
import OfficialResultsPage from './pages/OfficialResultsPage';
import LiveResultsPage from './pages/LiveResultsPage';
import WinnersPage from './pages/WinnersPage';
import IntroPage from './pages/IntroPage';
import Card from './components/Card';
import Button from './components/Button';
import { useVotingData } from './hooks/useVotingData'; 
// REMOVED: import { useOverallStats } from './hooks/useOverallStats'; 
import sjbuApi from './src/api/sjbuApi'; 

// Define the expected structure for VotingPage data
interface PositionWithCandidates extends Position { 
    candidates: Candidate[]; 
    totalVotes?: number;
    voterTurnout?: number;
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Intro);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [userVoucher, setUserVoucher] = useState<string>(''); 

  // CRITICAL FIX: Only use the hook that works. The Hydration/Stats logic is now removed.
  const { 
      positions: livePositions, 
      isLoading: isPositionsLoading, 
      error: positionsError, 
      fetchData: fetchPositions 
  } = useVotingData();
  
  // REMOVED: All overallStats state, hooks, and hydration logic.
  
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [electionStatus, setElectionStatus] = useState<ElectionStatus>('PRE_ELECTION');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [electionStartDate, setElectionStartDate] = useState(ELECTION_START_DATE);
  const [electionEndDate, setElectionEndDate] = useState(ELECTION_END_DATE);


  // Effect to handle online/offline status changes globally (KEPT)
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // --- NEW HANDLER for User Auth Success (KEPT) ---
  const handleUserLoginSuccess = (voucher: string) => {
    setUserVoucher(voucher);
    setCurrentPage(Page.Voting);
    fetchPositions(); 
    // REMOVED: fetchOverallStats(); 
  }
  
  // --- HANDLER for User Logout (KEPT) ---
  const handleUserLogout = async () => {
      try {
          await sjbuApi.post('/logout'); 
          setUserVoucher('');
          setCurrentPage(Page.Home);
      } catch (error) {
          console.error("User logout failed:", error);
          setUserVoucher('');
          setCurrentPage(Page.Home);
      }
  }

  // --- Handler for starting election countdown (MOCK - KEPT) ---
  const handleStartCountdown = (hours: number) => {
    const now = new Date();
    const newStartDate = new Date(now.getTime() + hours * 60 * 60 * 1000);
    const newEndDate = new Date(newStartDate.getTime() + 2 * 24 * 60 * 60 * 1000);
    setElectionStartDate(newStartDate);
    setElectionEndDate(newEndDate);
  };


  // --- CRITICAL FIX: Restore handleAdminLogin ---
  const handleAdminLogin = (user: AdminUser) => {
    setCurrentUser(user);
    setCurrentPage(Page.Admin);
    // REMOVED: fetchOverallStats(); 
  };

  // LIVE: Admin Logout (KEPT)
  const handleAdminLogout = async () => {
      try {
          await sjbuApi.post('/admin/logout'); 
      } catch (error) {
          console.error("Admin logout failed:", error);
      } finally {
          setCurrentUser(null);
          setCurrentPage(Page.Home);
      }
  };
  
  // 5. Unified Refetch for Admin Dashboard (Only fetches positions now)
  const handleAdminRefetch = useCallback(() => {
      fetchPositions();
  }, [fetchPositions]);


  const ElectionStatusSimulator = () => (
      // ... (ElectionStatusSimulator remains unchanged)
      <div className="fixed bottom-4 right-4 bg-white p-3 rounded-lg shadow-2xl z-50 border">
          <h4 className="text-sm font-bold text-dmi-blue-900 mb-2">Election Status Simulator</h4>
          <div className="flex space-x-2">
              <Button size="sm" variant={electionStatus === 'PRE_ELECTION' ? 'primary' : 'secondary'} onClick={() => setElectionStatus('PRE_ELECTION')}>Pre</Button>
              <Button size="sm" variant={electionStatus === 'LIVE' ? 'primary' : 'secondary'} onClick={() => setElectionStatus('LIVE')}>Live</Button>
              <Button size="sm" variant={electionStatus === 'POST_ELECTION' ? 'primary' : 'secondary'} onClick={() => setElectionStatus('POST_ELECTION')}>Post</Button>
          </div>
      </div>
  );

  const renderResultsPage = () => {
    // MODIFIED: Only pass livePositions (raw)
    switch (electionStatus) {
        case 'LIVE':
            return <LiveResultsPage positions={livePositions as PositionWithCandidates[]} setPage={setCurrentPage} />;
        case 'POST_ELECTION':
            return <OfficialResultsPage positions={livePositions as PositionWithCandidates[]} setPage={setCurrentPage} />;
        case 'PRE_ELECTION':
            return (
                <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
                    <Card className="max-w-2xl mx-auto p-12 text-center">
                        <h2 className="text-3xl font-bold text-dmi-blue-900">The Election Has Not Started</h2>
                        <p className="text-gray-600 mt-4">The voting period has not yet begun. Please check back on the official start date. Results will be available here once the election is live.</p>
                    </Card>
                </div>
            );
        default:
          return null;
    }
  }

  const renderPage = () => {
    // Combine loading/error states for a unified check (Only positions hook matters now)
    const isError = positionsError;
    const isLoadingData = isPositionsLoading;

    if (isLoadingData) {
         return (
             <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
                <Card className="max-w-2xl mx-auto p-12 text-center">
                    <h2 className="text-3xl font-bold text-dmi-blue-900">Loading Election Data...</h2>
                    <p className="text-gray-600 mt-4">Please wait while we fetch the latest positions and candidates from the server.</p>
                </Card>
             </div>
         );
    }
    
    if (isError) {
        return (
             <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
                <Card className="max-w-2xl mx-auto p-12 text-center bg-red-50 border-red-400">
                    <h2 className="text-3xl font-bold text-red-700">Error Loading Election Data</h2>
                    <p className="text-red-600 mt-4">{isError}</p>
                    <Button onClick={fetchPositions} className="mt-6">Try Again</Button>
                </Card>
             </div>
         );
    }

    switch (currentPage) {
      case Page.Intro:
        return <IntroPage setPage={setCurrentPage} />;
      case Page.Home:
        return <HomePage setPage={setCurrentPage} electionStatus={electionStatus} electionStartDate={electionStartDate} electionEndDate={electionEndDate} />;
      case Page.Authentication:
        return <AuthenticationPage 
                  onLoginSuccess={handleUserLoginSuccess} 
                  setPage={setCurrentPage} 
                  electionStatus={electionStatus} 
                  electionStartDate={electionStartDate} 
                  electionEndDate={electionEndDate} 
               />;
      case Page.Voting:
        // MODIFIED: Pass raw livePositions
        return <VotingPage 
                  positions={livePositions as PositionWithCandidates[]} 
                  userVoucher={userVoucher} 
                  setPage={setCurrentPage} 
                  setVerificationCode={setVerificationCode} 
                  isOffline={isOffline} 
                />;
      case Page.VoteSuccess:
        return <VoteSuccessPage verificationCode={verificationCode} setPage={setCurrentPage} />;
      case Page.Verification:
        return <VerificationPage />;
      case Page.Results:
        return renderResultsPage();
      case Page.Winners:
        // MODIFIED: Pass raw livePositions
        return <WinnersPage positions={livePositions as PositionWithCandidates[]} electionStatus={electionStatus} />;
      case Page.Admin:
        if (!currentUser) {
            return <AdminLoginPage onLoginSuccess={handleAdminLogin} />;
        }
        return <AdminDashboard 
                  positions={livePositions as PositionWithCandidates[]} // MODIFIED: Pass raw livePositions
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                  onLogout={handleAdminLogout} 
                  onStartCountdown={handleStartCountdown}
                  onRefetchPositions={handleAdminRefetch} // MODIFIED: Only fetches positions now
                />; 
      default:
        return <HomePage setPage={setCurrentPage} electionStatus={electionStatus} electionStartDate={electionEndDate} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      {currentPage !== Page.Intro && <Header setPage={setCurrentPage} isOffline={isOffline} />}
      <main className="flex-grow">
        {renderPage()}
      </main>
      {currentPage !== Page.Intro && <Footer />}
      {currentPage !== Page.Intro && <ElectionStatusSimulator />}
    </div>
  );
};

export default App;