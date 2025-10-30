// web/pages/VerificationPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import sjbuApi from '../src/api/sjbuApi'; 
import { isAxiosError } from 'axios';

// ESCALATING RATE LIMIT CONSTANTS
const MAX_ATTEMPTS_PER_LEVEL = 5;
const LOCKOUT_LEVELS = [
    { threshold: 5, minutes: 5 }, // 5 failures -> 5 min lock
    { threshold: 10, minutes: 15 }, // 10 failures -> 15 min lock
];
const GLOBAL_ATTEMPT_LIMIT = LOCKOUT_LEVELS[1].threshold; // Max allowed attempts before 15 min lock


// Define the expected structure of the successful vote response (Page 20 OCR)
interface VerifiedVote {
    id: number;
    voucher: string;
    candidate_id: number;
    position_id: number;
    verification_code: string;
    voted_at?: string; // Assuming voted_at is returned, but making it optional
}

const VerificationPage: React.FC = () => {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'verified' | 'error'>('idle');
  const [verifiedVote, setVerifiedVote] = useState<VerifiedVote | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  // ADDED: State for attempt tracking and escalating lockout
  const [failedAttempts, setFailedAttempts] = useState(0); 
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);
  
  // Helper to get the correct lockout time/message based on current attempts
  const getLockoutInfo = useCallback((attempts: number) => {
      let minutes = 0;
      let attemptsLeft = GLOBAL_ATTEMPT_LIMIT - attempts;

      if (attempts > LOCKOUT_LEVELS[1].threshold) {
          minutes = LOCKOUT_LEVELS[1].minutes; // 15 minutes
      } else if (attempts > LOCKOUT_LEVELS[0].threshold) {
          minutes = LOCKOUT_LEVELS[0].minutes; // 5 minutes
      }

      return { 
          minutes, 
          attemptsLeft: Math.max(0, attemptsLeft), 
          lockRequired: minutes > 0 
      };
  }, []);

  // Effect to load state from localStorage on mount and resume countdown
  useEffect(() => {
    try {
      const savedAttempts = localStorage.getItem('dmi-verify-attempts');
      if (savedAttempts) {
        const attempts = parseInt(savedAttempts, 10);
        setFailedAttempts(attempts);
        
        // Check lockout status on load
        const lockoutInfo = getLockoutInfo(attempts);
        if (lockoutInfo.lockRequired) {
            const savedLockout = localStorage.getItem('dmi-verify-lockout');
            if (savedLockout) {
                const lockoutDate = new Date(savedLockout);
                if (lockoutDate > new Date()) {
                    setLockoutUntil(lockoutDate);
                    setErrorMessage(`Access is locked for ${lockoutInfo.minutes} minutes.`);
                } else {
                    localStorage.removeItem('dmi-verify-lockout');
                    localStorage.removeItem('dmi-verify-attempts');
                    setFailedAttempts(0);
                }
            }
        }
      }
    } catch (e) {
      console.error("Failed to read verification state from localStorage", e);
    }
  }, [getLockoutInfo]);

  // Timer to update the lockout countdown
  useEffect(() => {
    if (!lockoutUntil) return;

    const interval = setInterval(() => {
      if (new Date() >= lockoutUntil) {
        setLockoutUntil(null);
        setFailedAttempts(0);
        setErrorMessage('');
        localStorage.removeItem('dmi-verify-lockout');
        localStorage.removeItem('dmi-verify-attempts');
        clearInterval(interval);
      } else {
        // Force re-render for countdown update
        setLockoutUntil(new Date(lockoutUntil.getTime())); 
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutUntil]);

  // Replaced mock handleVerify with live API call and custom rate limiting
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutUntil) return;

    setStatus('loading');
    setErrorMessage('');
    setVerifiedVote(null);

    try {
        // API Endpoint: POST /verify
        const response = await sjbuApi.post('/verify', {
            verification_code: code.toUpperCase(),
        });
        
        // Success: Status 200
        if (response.status === 200 && response.data.status === "found") {
            setVerifiedVote(response.data.vote as VerifiedVote);
            setStatus('verified');
            
            // Success: Clear all attempts
            setFailedAttempts(0);
            localStorage.removeItem('dmi-verify-attempts');
            localStorage.removeItem('dmi-verify-lockout');
        } else {
            setStatus('error');
            setErrorMessage('An unexpected response status was received.');
        }

    } catch (err) {
        const isNotFoundError = isAxiosError(err) && err.response?.status === 404;
        const isBadRequestError = isAxiosError(err) && err.response?.status === 400;

        if (isNotFoundError || isBadRequestError) {
            
            // Failure: Increment attempts and check for lockout
            const newAttempts = failedAttempts + 1;
            setFailedAttempts(newAttempts);
            localStorage.setItem('dmi-verify-attempts', newAttempts.toString());

            const lockoutInfo = getLockoutInfo(newAttempts);

            if (lockoutInfo.lockRequired) {
                const lockoutDate = new Date(new Date().getTime() + lockoutInfo.minutes * 60 * 1000);
                setLockoutUntil(lockoutDate);
                localStorage.setItem('dmi-verify-lockout', lockoutDate.toISOString());
                setErrorMessage(`Too many failed attempts. Access is temporarily locked for ${lockoutInfo.minutes} minutes.`);
            } else {
                // Not locked out yet, show attempt-specific message
                let message = isNotFoundError 
                    ? 'The code was not found. '
                    : 'Verification code is required. ';

                if (newAttempts < GLOBAL_ATTEMPT_LIMIT) {
                    message += `You have ${lockoutInfo.attemptsLeft} attempts remaining before a ${LOCKOUT_LEVELS[0].minutes}-minute lockout.`;
                } else if (newAttempts < LOCKOUT_LEVELS[1].threshold) {
                     message += `You have ${lockoutInfo.attemptsLeft} attempts remaining before a ${LOCKOUT_LEVELS[1].minutes}-minute lockout.`;
                }
                setErrorMessage(message);
            }

        } else if (isAxiosError(err) && err.response) {
            setErrorMessage(`Verification failed: Server Error (${err.response.status}).`);
        } else {
            setErrorMessage('Network or server connection failed.');
        }
        
        setStatus('error');
    }
  };
  
  const renderLockoutView = () => {
    if (!lockoutUntil) return null;

    const timeLeft = Math.max(0, Math.floor((lockoutUntil.getTime() - new Date().getTime()) / 1000));
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center">
        <svg className="w-24 h-24 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h3 className="text-2xl font-semibold text-dmi-blue-900">Access Locked</h3>
        <p className="text-gray-600 mt-2">{errorMessage}</p>
        <div className="text-4xl font-mono font-bold text-red-600 my-4">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>
    );
  };

  const renderIdle = () => (
    <form onSubmit={handleVerify}>
      <h2 className="text-2xl font-bold text-dmi-blue-900 mb-2">Vote Verification Portal</h2>
      <p className="text-gray-600 mb-6">Enter the verification code from your receipt to confirm your vote was counted.</p>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full text-center text-xl font-mono bg-gray-100 border-2 border-gray-300 rounded-lg p-3 focus:border-dmi-blue-500 focus:ring-dmi-blue-500 text-dmi-blue-900 font-semibold placeholder-gray-400"
        placeholder="SJBU-XXXX-XXXX"
        required
        disabled={!!lockoutUntil}
      />
      {/* Display remaining attempts for user feedback */}
      {lockoutUntil ? renderLockoutView() : (
           errorMessage && (
             <p className="text-red-500 text-sm mt-4">{errorMessage}</p>
           )
      )}
      
      <Button type="submit" className="w-full mt-6" size="lg" disabled={status === 'loading' || code.length === 0 || !!lockoutUntil}>
        {status === 'loading' ? <Spinner/> : 'Verify My Vote'}
      </Button>
    </form>
  );

  // Updated renderResult to use live data
  const renderResult = (isSuccess: boolean) => (
    <div className="text-center">
        {isSuccess ? 
            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> :
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        }
      <h2 className={`text-2xl font-bold ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
        {isSuccess ? 'Vote Verified' : 'Verification Failed'}
      </h2>
      <p className="text-gray-600 mt-2">
        {isSuccess ? 'Your vote has been successfully counted in the election.' : errorMessage}
      </p>
      {isSuccess && verifiedVote && (
          <div className="text-left bg-gray-100 p-4 rounded-lg mt-4 text-sm text-gray-700 space-y-2">
              <p><strong>Verification Code:</strong> <span className="font-mono">{verifiedVote.verification_code}</span></p>
              <p><strong>Voter Voucher:</strong> {verifiedVote.voucher}</p>
              <p><strong>Vote ID:</strong> {verifiedVote.id}</p>
              <p><strong>Position ID:</strong> {verifiedVote.position_id}</p>
              <p><strong>Candidate ID:</strong> {verifiedVote.candidate_id}</p>
              <p className="text-xs text-gray-500 pt-2 border-t mt-2">Note: For your privacy and security, we do not display who you voted for.</p>
          </div>
      )}
      <Button onClick={() => { setCode(''); setStatus('idle'); setErrorMessage(''); }} className="w-full mt-6">
        Verify Another Code
      </Button>
    </div>
  );

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
      <Card className="max-w-lg w-full p-8">
        {status === 'loading' && <div className="flex justify-center items-center h-48"><Spinner /></div>}
        {lockoutUntil && renderLockoutView()}
        {status === 'idle' && !lockoutUntil && renderIdle()}
        {status === 'verified' && renderResult(true)}
        {status === 'error' && !lockoutUntil && renderResult(false)}
      </Card>
    </div>
  );
};

export default VerificationPage;