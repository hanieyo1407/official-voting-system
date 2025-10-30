// web/pages/ResultsPage.tsx

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Position, Page } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner'; 
import { useOverallStats } from '../hooks/useOverallStats'; // FIXED: Use the correct live stats hook

interface ResultsPageProps {
    positions: Position[]; 
    setPage: (page: Page) => void;
}

const StatusIndicator = ({ status }: { status: string }) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                status === 'Online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
                <svg className={`-ml-0.5 mr-1.5 h-2 w-2 ${status === 'Online' ? 'text-green-400' : 'text-red-400'}`} fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                </svg>
                {status}
        </span>
);

const ResultsPage: React.FC<ResultsPageProps> = ({ positions, setPage }) => {
        // FIXED: Using useOverallStats hook
        const { stats, isLoading, error } = useOverallStats();

        if (isLoading) {
                return (
                        <div className="container mx-auto px-4 py-8 text-center min-h-[60vh] flex items-center justify-center">
                                        <Spinner /> <p className="ml-4 text-dmi-blue-800 font-medium">Loading election statistics...</p>
                                </div>
                        );
                }

        if (error) {
                return <div className="container mx-auto px-4 py-8 text-center text-red-500">Error: {error}</div>;
        }

        if (!stats) {
                return <div className="container mx-auto px-4 py-8 text-center text-gray-500">No results data available.</div>;
        }

        // FIXED: Use live data from stats object
        const totalVotes = stats.totalVotesCast;
        const eligibleVoters = stats.totalVoters; // Total voters is in overall stats
        const turnoutPercentage = (totalVotes / eligibleVoters) * 100;
        
        const overallTurnoutData = [
            { name: 'Voted', value: totalVotes },
            { name: 'Remaining', value: eligibleVoters - totalVotes },
        ];


        return (
                <div className="container mx-auto px-4 py-8">
                        <h1 className="text-2xl font-semibold text-dmi-blue-900 mb-6 text-center">Election Results</h1>

                        {/* Overall Turnout */}
                        <Card title="Overall Turnout" className="mb-6">
                                <div className="flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={overallTurnoutData}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="name" />
                                                        <YAxis />
                                                        <Tooltip />
                                                        <Legend />
                                                        <Bar dataKey="value" fill="#8884d8" />
                                                </BarChart>
                                        </ResponsiveContainer>
                                </div>
                                <div className="text-center">
                                        <p className="text-gray-600">
                                                Total Votes: {totalVotes} / {eligibleVoters}
                                        </p>
                                        <p className="text-gray-600">
                                                Turnout Percentage: {turnoutPercentage.toFixed(2)}%
                                        </p>
                                </div>
                        </Card>

                        {/* Results by Position */}
                        {stats.positionsWithStats.map((positionStats) => {
                                // Find the matching position object for candidate names if necessary, 
                                // but positionStats contains everything needed.
                                
                                const candidateData = positionStats.candidates.map((candidate) => ({
                                    name: candidate.candidateName,
                                    votes: candidate.voteCount || 0,
                                }));

                                return (
                                        <Card key={positionStats.positionId} title={positionStats.positionName} className="mb-6">
                                                <ResponsiveContainer width="100%" height={300}>
                                                        <BarChart data={candidateData}>
                                                                <CartesianGrid strokeDasharray="3 3" />
                                                                <XAxis dataKey="name" />
                                                                <YAxis />
                                                                <Tooltip />
                                                                <Legend />
                                                                <Bar dataKey="votes" fill="#82ca9d" />
                                                        </BarChart>
                                                </ResponsiveContainer>
                                                <div className="mt-4 text-center">
                                                    <p className="text-sm text-gray-600">Total votes for this position: {positionStats.totalVotes}</p>
                                                </div>
                                        </Card>
                                );
                        })}

                        <div className="flex justify-center mt-8">
                                <Button onClick={() => setPage(Page.Home)} variant="secondary">Back to Home</Button>
                        </div>
                </div>
        );
};

export default ResultsPage;