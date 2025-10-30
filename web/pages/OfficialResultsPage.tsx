import React, { useState, useEffect } from 'react';
import { Position, Page, Candidate } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import CountdownTimer from '../components/CountdownTimer'; // Re-using your existing timer component

// Define the expected structure that is passed to this component
interface PositionWithCandidates extends Position {
    candidates: Candidate[];
    totalVotes?: number; 
    voterTurnout?: number; 
}

interface OfficialResultsPageProps {
  positions: PositionWithCandidates[]; 
  setPage: (page: Page) => void;
}

const OfficialResultsPage: React.FC<OfficialResultsPageProps> = ({ setPage }) => {
    // STATE: Target time for the announcement (e.g., 30 seconds from now for the demo)
    // In a real app, this might come from the backend settings.
    const [announcementTime] = useState(() => new Date(Date.now() + 30 * 1000)); // 30 seconds
    const [isReadyToAnnounce, setIsReadyToAnnounce] = useState(false);

    // EFFECT: Unlock the button when the time is reached
    useEffect(() => {
        const timeUntilAnnounce = announcementTime.getTime() - new Date().getTime();
        
        if (timeUntilAnnounce > 0) {
            const timer = setTimeout(() => {
                setIsReadyToAnnounce(true);
            }, timeUntilAnnounce);
            return () => clearTimeout(timer);
        } else {
            setIsReadyToAnnounce(true);
        }
    }, [announcementTime]);

    return (
        <div className="container mx-auto px-4 py-8 min-h-[70vh] flex items-center justify-center">
            <Card className="max-w-3xl w-full p-12 text-center bg-gradient-to-br from-dmi-blue-900 to-dmi-blue-800 text-white shadow-2xl">
                
                {!isReadyToAnnounce ? (
                    <div className="space-y-8 animate-pulse">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                           Tabulating Final Results...
                        </h1>
                        <p className="text-xl text-dmi-blue-100">
                            The polls have closed. Please wait while we verify the final counts.
                        </p>
                        <div className="py-8">
                             {/* Re-using your CountdownTimer for the dramatic reveal */}
                            <CountdownTimer 
                                targetDate={announcementTime} 
                                title="Official Announcement In" 
                                onCompleteMessage="Results Verified!" 
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-fade-in-up">
                        <svg className="w-24 h-24 mx-auto text-dmi-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">
                           Results Are In!
                        </h1>
                        <p className="text-2xl text-dmi-blue-100">
                            The 2025 Student Leaders have been chosen.
                        </p>
                    </div>
                )}

                <div className="mt-12">
                    <Button 
                        size="xl" 
                        variant={isReadyToAnnounce ? 'primary' : 'secondary'} // Change style when ready
                        disabled={!isReadyToAnnounce}               // The requested lock
                        onClick={() => setPage(Page.Winners)}
                        className={`w-full md:w-auto px-12 py-4 text-xl font-bold transition-all duration-500 ${isReadyToAnnounce ? 'hover:scale-105 shadow-lg shadow-dmi-gold-500/50' : 'opacity-50 cursor-not-allowed'}`}
                    >
                        {isReadyToAnnounce ? "🎉 Reveal Official Winners 🎉" : "Awaiting Final Count..."}
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default OfficialResultsPage;