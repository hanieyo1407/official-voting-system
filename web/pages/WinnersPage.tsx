// web/pages/WinnersPage.tsx

import React, { useState, useEffect } from 'react';
import { Position, ElectionStatus } from '../types';
import Card from '../components/Card';

interface WinnersPageProps {
  positions: Position[];
  electionStatus: ElectionStatus;
}

const CrownIcon = () => (
    <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.053 2.58a1.5 1.5 0 00-2.106 0L6.44 5.25a.75.75 0 00-.22.523l-.11 3.018a.75.75 0 00.442.706l3.155 1.577a.75.75 0 00.58 0l3.155-1.577a.75.75 0 00.442-.706l-.11-3.018a.75.75 0 00-.22-.523L11.053 2.58zM8.5 12.5a.5.5 0 00-1 0v.634a.75.75 0 00.22.523l.11 3.018a.75.75 0 001.336 0l.11-3.018a.75.75 0 00.22-.523V12.5a.5.5 0 00-1 0zm3 0a.5.5 0 00-1 0v.634a.75.75 0 00.22.523l.11 3.018a.75.75 0 001.336 0l.11-3.018a.75.75 0 00.22-.523V12.5a.5.5 0 00-1 0z" />
    </svg>
);

const CandidateShuffler: React.FC<{ candidates: { name: string; photoUrl: string }[] }> = ({ candidates }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (candidates.length < 2) return;

        const interval = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % candidates.length);
        }, 2000); // Shuffle every 2 seconds

        return () => clearInterval(interval);
    }, [candidates.length]);

    if (candidates.length === 0) {
        return <p className="text-gray-500">No candidates for this position.</p>;
    }
    
    const currentCandidate = candidates[currentIndex];

    return (
        <div key={currentCandidate.name} className="flex flex-col items-center p-4 transition-opacity duration-500 animate-pulse">
            <img 
                src={currentCandidate.photoUrl} 
                alt={currentCandidate.name} 
                className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-dmi-blue-300" 
            />
            <p className="mt-4 text-xl font-bold text-dmi-blue-800">{currentCandidate.name}</p>
        </div>
    );
};


const WinnersPage: React.FC<WinnersPageProps> = ({ positions, electionStatus }) => {
    if (electionStatus === 'PRE_ELECTION') {
        return (
            <div className="container mx-auto px-4 py-8 min-h-[60vh] flex items-center justify-center">
                <Card className="text-center p-12 max-w-2xl">
                    <svg className="w-16 h-16 text-dmi-blue-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <h1 className="text-3xl font-bold text-dmi-blue-900">The Race Hasn't Started Yet</h1>
                    <p className="text-lg text-gray-600 mt-4">The winners will be revealed here once the election concludes. Stay tuned!</p>
                </Card>
            </div>
        );
    }

    if (electionStatus === 'LIVE') {
        return (
             <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-dmi-blue-900 animate-pulse">Awine ndindani?</h1>
                    <p className="text-lg text-gray-600 mt-2">Who will be the winner? The race is on!</p>
                </div>
                <div className="space-y-10">
                    {positions.map(position => (
                         <Card key={position.id}>
                             <div className="p-6 bg-gray-50 border-b">
                                <h2 className="text-2xl font-bold text-dmi-blue-900">{position.name}</h2>
                             </div>
                             <div className="p-6 flex justify-center items-center min-h-[12rem]">
                                <CandidateShuffler candidates={position.candidates.map(c => ({ name: c.name, photoUrl: c.photoUrl }))} />
                             </div>
                         </Card>
                    ))}
                </div>
            </div>
        );
    }

    // --- Post-Election Logic (using live props) ---
    // Create a lookup map for candidate photos for easy access
    const candidatePhotoMap = new Map<string, string>();
    positions.forEach(pos => {
        pos.candidates.forEach(cand => {
            // Need to handle the possibility that a candidate from live data doesn't have a photoUrl
            candidatePhotoMap.set(cand.name, cand.photoUrl || 'https://picsum.photos/seed/default/200/200');
        });
    });

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-dmi-blue-900">Official Election Winners</h1>
                <p className="text-lg text-gray-600 mt-2">Congratulations to the newly elected student leaders for 2025!</p>
            </div>

            <div className="space-y-10">
                {positions.map(positionStat => {
                    // Assuming the 'candidates' array in the 'position' prop has voteCount/votePercentage attached by the App component
                    const sortedCandidates: any[] = [...positionStat.candidates].sort((a: any, b: any) => (b.voteCount || 0) - (a.voteCount || 0));
                    const winner = sortedCandidates[0];
                    const runnersUp = sortedCandidates.slice(1);

                    // Skip if no candidates/results are available
                    if (!winner) {
                         return (
                            <Card key={positionStat.id} className="p-6 text-center">
                                <h2 className="text-2xl font-bold text-dmi-blue-900">{positionStat.name}</h2>
                                <p className="text-gray-500 mt-2">No results or candidates found for this position.</p>
                            </Card>
                         );
                    }
                    
                    // Defensively assign vote counts to prevent the crash
                    const winnerVoteCount = winner.voteCount || 0;
                    const winnerVotePercentage = winner.votePercentage || 0;

                    return (
                        <Card key={positionStat.id} className="overflow-hidden">
                            <div className="p-6 bg-gray-50 border-b">
                                <h2 className="text-2xl font-bold text-dmi-blue-900">{positionStat.name}</h2>
                            </div>

                            {/* Winner Section */}
                            <div className="p-6 bg-gradient-to-br from-dmi-blue-50 to-white">
                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    <img
                                        src={candidatePhotoMap.get(winner.name) || 'https://picsum.photos/seed/winner/200/200'}
                                        alt={winner.name}
                                        className="w-32 h-32 rounded-full object-cover shadow-xl border-4 border-dmi-gold-500"
                                    />
                                    <div className="text-center sm:text-left">
                                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                                            <CrownIcon />
                                            <span className="text-sm font-bold uppercase tracking-wider text-yellow-600">Winner</span>
                                        </div>
                                        <h3 className="text-3xl font-extrabold text-dmi-blue-900">{winner.name}</h3>
                                        <p className="text-xl font-semibold text-dmi-blue-700 mt-1">
                                            {/* CRITICAL FIX: Add a defensive check/default value */}
                                            {winnerVoteCount.toLocaleString()} Votes ({winnerVotePercentage.toFixed(2)}%)
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Runners-Up Section */}
                            {runnersUp.length > 0 && (
                                <div className="p-6">
                                    <h4 className="text-lg font-semibold text-gray-700 mb-3">Runners-Up</h4>
                                    <ul className="space-y-3">
                                        {runnersUp.map(runner => (
                                            <li key={runner.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                                                <p className="font-semibold text-gray-800">{runner.name}</p>
                                                <p className="text-gray-600">
                                                    {/* CRITICAL FIX: Add a defensive check/default value */}
                                                    {(runner.voteCount || 0).toLocaleString()} Votes ({(runner.votePercentage || 0).toFixed(2)}%)
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default WinnersPage;