import React, { useState, useEffect, useCallback } from 'react';
import { Page, ElectionStatus } from '../types';
import Button from '../components/Button';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import CountdownTimer from '../components/CountdownTimer';
import sjbuApi from '../src/api/sjbuApi'; 
import { isAxiosError } from 'axios'; // Import isAxiosError for safe error checking

interface AuthenticationPageProps {
  onLoginSuccess: (voucher: string) => void; 
  setPage: (page: Page) => void;
  electionStatus: ElectionStatus;
  electionStartDate: Date;
  electionEndDate: Date;
}

// ESCALATING RATE LIMIT CONSTANTS
const LOCKOUT_LEVELS = [
    { threshold: 5, minutes: 5 }, // 5 failures -> 5 min lock
    { threshold: 10, minutes: 15 }, // 10 failures -> 15 min lock
];
const GLOBAL_ATTEMPT_LIMIT = LOCKOUT_LEVELS[1].threshold; // Max allowed attempts before 15 min lock

const AuthenticationPage: React.FC<AuthenticationPageProps> = ({ onLoginSuccess, setPage, electionStatus, electionStartDate, electionEndDate }) => {
  const [voucher, setVoucher] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [failedAttempts, setFailedAttempts] = useState(0); 
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<number>(0);
  
  // Helper to get the correct lockout time/message based on current attempts
  const getLockoutInfo = useCallback((attempts: number) => {
      if (attempts > LOCKOUT_LEVELS[1].threshold) {
          return { minutes: LOCKOUT_LEVELS[1].minutes, attemptsLeft: 0, lockRequired: true };
      } else if (attempts > LOCKOUT_LEVELS[0].threshold) {
          return { minutes: LOCKOUT_LEVELS[0].minutes, attemptsLeft: GLOBAL_ATTEMPT_LIMIT - attempts, lockRequired: true };
      } else if (attempts > 0) {
          return { minutes: 0, attemptsLeft: GLOBAL_ATTEMPT_LIMIT - attempts, lockRequired: false };
      }
      return { minutes: 0, attemptsLeft: GLOBAL_ATTEMPT_LIMIT, lockRequired: false };
  }, []);

  // Effect to load and manage attempts from localStorage
  useEffect(() => {
    try {
      const savedAttempts = localStorage.getItem('dmi-auth-attempts');
      if (savedAttempts) {
        const attempts = parseInt(savedAttempts, 10);
        setFailedAttempts(attempts);
        
        // Re-check lockout status on load
        const lockoutInfo = getLockoutInfo(attempts);
        if (lockoutInfo.lockRequired) {
            const savedLockout = localStorage.getItem('dmi-auth-lockout');
            if (savedLockout) {
                const lockoutDate = new Date(savedLockout);
                if (lockoutDate > new Date()) {
                    setIsRateLimited(true);
                    setLockoutTime(Math.floor((lockoutDate.getTime() - new Date().getTime()) / 1000));
                    setError(`Access is locked for ${lockoutInfo.minutes} minutes.`);
                } else {
                    localStorage.removeItem('dmi-auth-lockout');
                    localStorage.removeItem('dmi-auth-attempts');
                    setFailedAttempts(0);
                }
            }
        }
      }
    } catch (e) {
      console.error("Failed to read auth state from localStorage", e);
    }
  }, [getLockoutInfo]);


  // Timer to update the lockout countdown (Kept)
  useEffect(() => {
    if (!isRateLimited || lockoutTime <= 0) return;

    const interval = setInterval(() => {
      setLockoutTime(prev => {
        if (prev <= 1) {
          setIsRateLimited(false);
          setError('');
          localStorage.removeItem('dmi-auth-lockout'); // Clear lockout
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRateLimited, lockoutTime]);


  const handleVerifyVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRateLimited) return;

    setError('');
    setIsLoading(true);

    try {
        // API Endpoint: POST /login
        const response = await sjbuApi.post('/login', { voucher });
        
        if (response.status === 200) {
            setIsSuccess(true);
            
            // Reset attempts on success
            setFailedAttempts(0); 
            localStorage.removeItem('dmi-auth-attempts');
            localStorage.removeItem('dmi-auth-lockout');

            onLoginSuccess(voucher); 
        } else {
            setError('Verification failed with an unexpected response.');
        }

    } catch (err) {
        let errorReason = 'An error occurred during verification. Please try again.';
        let isAuthFailure = false;

        if (isAxiosError(err) && err.response) {
            const status = err.response.status;
            
            if (status === 401 || status === 400) {
                errorReason = err.response.data.error || 'Invalid voucher code.';
                isAuthFailure = true;
            } else if (status === 429) {
                // If backend 429 hits first, it's treated as a failed attempt that triggers local lockout
                errorReason = 'Too many failed attempts. Access is temporarily locked by the server.';
                isAuthFailure = true; 
            }
        }
        
        // ADDED: Re-implement frontend attempt tracking for local feedback
        if (isAuthFailure || errorReason.toLowerCase().includes('invalid voucher')) {
            const newAttempts = failedAttempts + 1;
            const lockoutInfo = getLockoutInfo(newAttempts);

            setFailedAttempts(newAttempts);
            localStorage.setItem('dmi-auth-attempts', newAttempts.toString());

            if (lockoutInfo.lockRequired) {
                const lockoutDate = new Date(new Date().getTime() + lockoutInfo.minutes * 60 * 1000);
                setIsRateLimited(true);
                setLockoutTime(lockoutInfo.minutes * 60);
                localStorage.setItem('dmi-auth-lockout', lockoutDate.toISOString());
                setError(`Access temporarily locked for ${lockoutInfo.minutes} minutes.`);
            } else {
                setError(errorReason + ` You have ${lockoutInfo.attemptsLeft} attempts remaining.`);
            }
        } else {
             setError(errorReason);
        }

    } finally {
        setIsLoading(false);
        setVoucher(''); // Clear voucher input on fail
    }
  };
// Removed: const correctVoucher = 'SJBU-VOTE-2025';

  const renderSuccessView = () => (
    <div className="p-8 text-center flex flex-col items-center justify-center h-full">
        <svg className="w-24 h-24 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h3 className="text-2xl font-semibold text-dmi-blue-900">Authentication Successful!</h3>
        <p className="text-gray-600 mt-2">You are verified. Loading your ballot now...</p>
    </div>
  );

  const renderLockoutView = () => {
    if (!isRateLimited) return null;

    const minutes = Math.floor(lockoutTime / 60);
    const seconds = lockoutTime % 60;

    return (
      <div className="p-8 text-center flex flex-col items-center justify-center">
        <svg className="w-24 h-24 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h3 className="text-2xl font-semibold text-dmi-blue-900">Too Many Failed Attempts</h3>
        <p className="text-gray-600 mt-2">For security, access is temporarily locked. Please try again in:</p>
        <div className="text-4xl font-mono font-bold text-red-600 my-4">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>
    );
  };

  const renderVoucherView = () => (
    <form onSubmit={handleVerifyVoucher}>
      <div className="p-8 text-center">
        <h3 className="text-xl font-semibold text-dmi-blue-900">Voter Authentication</h3>
        <p className="text-gray-600 mt-2">Please enter your unique voting voucher code below to proceed.</p>
        <div className="my-6">
          <input
            type="text"
            value={voucher}
            onChange={(e) => setVoucher(e.target.value)}
            className="w-full text-center text-2xl tracking-widest font-mono bg-gray-100 border-2 border-gray-300 rounded-lg p-3 focus:border-dmi-blue-500 focus:ring-dmi-blue-500 text-dmi-blue-900 font-semibold placeholder-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed"
            placeholder="ENTER VOUCHER"
            required
            autoFocus
            disabled={isRateLimited || isLoading}
          />
           <p className="text-xs text-gray-500 mt-2">(Enter your unique voting code)</p>
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      </div>
      <div className="bg-gray-50 px-8 py-4">
        <Button type="submit" className="w-full" disabled={isLoading || isRateLimited}>
           {isLoading ? <Spinner/> : <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
          {isLoading ? 'Verifying...' : 'Verify & Proceed'}
        </Button>
      </div>
    </form>
  );

  const renderPageContent = () => {
    switch (electionStatus) {
      case 'PRE_ELECTION':
        return (
          <Card className="max-w-2xl mx-auto p-12 text-center bg-dmi-blue-800 text-white">
            <h2 className="text-3xl font-bold">The Election Has Not Started Yet</h2>
            <p className="mt-4 mb-8">Please check back when the countdown finishes. You will be able to cast your vote then.</p>
            <CountdownTimer targetDate={electionStartDate} title="Voting Begins In" onCompleteMessage="The Election is Now Live!" />
          </Card>
        );
      case 'POST_ELECTION':
        return (
          <Card className="max-w-md w-full p-12 text-center">
            <h2 className="text-3xl font-bold text-dmi-blue-900">Voting Has Ended</h2>
            <p className="text-gray-600 mt-4">The voting period for the 2025 Student Elections is now closed. Thank you for your participation.</p>
            <Button className="mt-6" onClick={() => setPage(Page.Results)}>View Official Results</Button>
          </Card>
        );
      case 'LIVE':
        return (
          <div className="max-w-md w-full space-y-8">
              <div className="p-4 bg-dmi-blue-700 rounded-xl">
                  <CountdownTimer targetDate={electionEndDate} title="Voting Closes In" onCompleteMessage="Voting has ended." />
              </div>
              <Card>
                  {isRateLimited ? renderLockoutView() : (isSuccess ? renderSuccessView() : renderVoucherView())}
              </Card>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
        {renderPageContent()}
    </div>
  );
};

export default AuthenticationPage;