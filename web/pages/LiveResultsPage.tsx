// web/pages/LiveResultsPage.tsx

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Position, Page } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner'; 
import { useLiveStatsPolling } from '../hooks/useLiveStatsPolling'; 
import { useVotingTrends } from '../hooks/useVotingTrends'; // Assuming this hook is created/defined

interface LiveResultsPageProps {
  positions: Position[]; 
  setPage: (page: Page) => void;
}

const LiveIndicator = () => (
    <span className="relative flex h-3 w-3 ml-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
    </span>
);

const LiveResultsPage: React.FC<LiveResultsPageProps> = ({ positions, setPage }) => {
    // Hooks to fetch live data
    const { stats, isLoading: isStatsLoading, error: statsError } = useLiveStatsPolling();
    const { hourlyTrends, isLoading: isTrendsLoading, error: trendsError } = useVotingTrends();

    // Global loading/error state
    const isLoading = isStatsLoading || isTrendsLoading;
    const error = statsError || trendsError;

    if (isLoading && !stats) {
        return (
            <div className="container mx-auto px-4 py-8 text-center min-h-[60vh] flex items-center justify-center">
                 <Spinner /> <p className="ml-4 text-dmi-blue-800 font-medium">Loading live results...</p>
            </div>
        );
    }
    
    if (error) {
        return (
             <div className="container mx-auto px-4 py-8 text-center min-h-[60vh] flex items-center justify-center">
                <Card className="max-w-2xl mx-auto p-12 text-center bg-red-50 border-red-400">
                    <h2 className="text-3xl font-bold text-red-700">Live Results Error</h2>
                    <p className="text-red-600 mt-4">{error}</p>
                </Card>
             </div>
        );
    }

    // LIVE DATA CALCULATION: 
    const totalVotesCast = stats?.totalVotesCast ?? 0;
    const totalVoters = stats?.totalVoters ?? 0;
    
    // FINAL PRODUCTION LOGIC FOR DISPLAY (Corrected Calculation)
    // The most accurate calculation (Unique Voters / Total Voters) * 100
    // We assume 2 votes = 1 unique voter (2 positions * 1 vote each)
    const uniqueVotersWhoVoted = totalVotesCast / 2;
    
    const liveVoterTurnoutDisplay = (totalVoters > 0 && uniqueVotersWhoVoted > 0)
        ? ((uniqueVotersWhoVoted / totalVoters) * 100).toFixed(2)
        : '0.00';

    // Extract Position Stats for Charts/Tables
    const positionsWithStats = stats?.positionsWithStats || [];
    
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-10">
                <div className="flex justify-center items-center">
                    <h1 className="text-4xl font-extrabold text-dmi-blue-900">Live Election Tracker</h1>
                    {isLoading ? <span className="ml-4 text-sm text-gray-500">(Polling...)</span> : <LiveIndicator />}
                </div>
                <p className="text-lg text-gray-600 mt-2">The election is currently in progress. Watch the numbers update in real-time!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <Card className="p-6 text-center">
                    <h3 className="text-lg font-semibold text-gray-500">Live Votes Cast</h3>
                    <p className="text-5xl font-bold text-dmi-blue-800 transition-all duration-300">{totalVotesCast}</p>
                </Card>
                <Card className="p-6 text-center">
                    <h3 className="text-lg font-semibold text-gray-500">Registered Voters</h3>
                    <p className="text-5xl font-bold text-dmi-blue-800">{totalVoters}</p>
                </Card>
                <Card className="p-6 text-center">
                    <h3 className="text-lg font-semibold text-gray-500">Live Voter Turnout</h3>
                    {/* FIXED: Display the corrected percentage */}
                    <p className="text-5xl font-bold text-dmi-blue-800 transition-all duration-300">{liveVoterTurnoutDisplay}%</p>
                </Card>
            </div>

            <div className="mb-10">
                <h2 className="text-3xl font-bold text-dmi-blue-900 text-center mb-6">Voting Trends</h2>
                
                {/* Turnout by Hour Chart */}
                <Card className="p-6 mb-8">
                    <h3 className="text-xl font-bold text-dmi-blue-900 mb-4">Turnout by Hour</h3>
                    {hourlyTrends.length > 0 ? (
                         <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={hourlyTrends} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="hour" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="votes" fill="#1b66c4" name="Votes Cast" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                         <div className="text-center py-8 text-gray-500">
                            {isTrendsLoading ? <Spinner /> : 'No hourly trend data available from the server.'}
                        </div>
                    )}
                </Card>
                
                {/* Positions Statistics Tables/Charts */}
                <h2 className="text-3xl font-bold text-dmi-blue-900 text-center mb-6">Candidate Race Summaries</h2>
                <div className="space-y-8">
                    {positionsWithStats.map((position: any) => (
                        <Card key={position.positionId} className="p-6">
                            <h3 className="text-xl font-bold text-dmi-blue-900 mb-4">{position.positionName} - {position.totalVotes} Votes Cast</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={position.candidates} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis type="category" dataKey="candidateName" width={100} tick={{fontSize: 12}} />
                                        <Tooltip formatter={(value: number, name: string) => [
                                            `${value} votes (${(value / position.totalVotes * 100).toFixed(2)}%)`, 
                                            position.positionName
                                        ]} />
                                        <Legend />
                                        <Bar dataKey="voteCount" name="Votes" fill="#1b66c4" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    ))}
                </div>
                
            </div>

             <Card className="p-8 mt-10 text-center bg-dmi-blue-50">
                <h2 className="text-2xl font-bold text-dmi-blue-900">Curious about who's leading?</h2>
                <p className="text-gray-600 mt-2 mb-6">While the official results are not in, you can see a fun live animation of potential winners!</p>
                <Button size="lg" onClick={() => setPage(Page.Winners)}>
                    Awine ndindani? (Who is going to win?)
                </Button>
            </Card>
        </div>
    );
};

export default LiveResultsPage;