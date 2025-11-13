// web/pages/WinnersPage.tsx

import React from 'react';
import { Position, ElectionStatus, CandidateStats } from '../types';
import Card from '../components/Card';
import { useOverallStats } from '../hooks/useOverallStats'; // Import for vote stats
import { useAllPositions } from '../hooks/useAllPositions'; // Import for positions with images

interface WinnersPageProps {
  electionStatus: ElectionStatus;
}

const CrownIcon = () => (
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/></svg>
);

const BicycleIcon = () => (
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="Bicycle--Streamline-Ultimate" height="24" width="24">
  <desc>
    Bicycle Streamline Icon: https://streamlinehq.com
  </desc>
  <path d="M5.6091 6.2752c-0.7519 -0.0024 -1.2245 0.8101 -0.8506 1.4625 0.1746 0.3048 0.4994 0.4923 0.8506 0.4912h1.3773c0.0974 -0.0004 0.1857 0.0572 0.2247 0.1465l0.6251 1.5336c0.0437 0.0755 0.0437 0.1686 0 0.2442l-0.3418 0.4298c-0.0704 0.0874 -0.1913 0.1156 -0.2931 0.0684 -0.6493 -0.3111 -1.3606 -0.4714 -2.0806 -0.4689 -3.7598 0.0028 -6.1066 4.0746 -4.2243 7.3292 1.8822 3.2547 6.5819 3.2512 8.4594 -0.0062 0.2301 -0.3992 0.4026 -0.829 0.5122 -1.2765 0.0235 -0.1101 0.1219 -0.1881 0.2345 -0.1856h0.3907c0.3126 0.0008 0.6068 -0.1481 0.7912 -0.4005l4.1808 -5.7046c0.052 -0.0705 0.1377 -0.1078 0.2247 -0.0977 0.096 0.0244 0.1664 0.1065 0.1758 0.2052l0.2735 0.7423c0.0431 0.1062 0.0065 0.2281 -0.0879 0.2931 -3.0675 2.174 -2.6312 6.8534 0.7853 8.4229 3.4165 1.5695 7.2509 -1.148 6.9018 -4.8916 -0.2369 -2.5411 -2.3904 -4.4714 -4.9422 -4.43 -0.179 -0.01 -0.3584 -0.01 -0.5373 0 -0.1145 0.0206 -0.2268 -0.046 -0.2637 -0.1563l-1.2308 -3.3016c-0.0248 -0.0662 -0.0248 -0.139 0 -0.2052 0.0358 -0.0569 0.0915 -0.0987 0.1562 -0.1172l1.7095 -0.4298c0.5191 -0.1342 0.8329 -0.6617 0.7033 -1.1819 -0.1298 -0.5231 -0.6587 -0.8421 -1.182 -0.7131l-2.4908 0.6252c-0.4197 0.0901 -0.7776 0.3621 -0.9769 0.7423 -0.1949 0.3674 -0.2268 0.7997 -0.0879 1.1918l0.0782 0.2051c0.0593 0.1296 -0.0098 0.2818 -0.1465 0.3223L9.7703 8.8736c-0.1213 0.0461 -0.2571 -0.0152 -0.3028 -0.1368l-0.1172 -0.2735c-0.0244 -0.0492 -0.0244 -0.107 0 -0.1563 0.0338 -0.0476 0.0881 -0.0766 0.1465 -0.0781 0.752 -0.0024 1.2194 -0.8179 0.8413 -1.468 -0.1743 -0.2997 -0.4945 -0.4845 -0.8413 -0.4857ZM5.1207 17.997c-2.2559 0.0067 -3.673 -2.4311 -2.5509 -4.3881 1.1221 -1.957 3.9419 -1.9653 5.0757 -0.0151 0.0257 0.0442 0.0502 0.0891 0.0735 0.1345 0.0384 0.0769 0.0384 0.1674 0 0.2442 -0.0461 0.0693 -0.1221 0.1127 -0.2051 0.1173H5.1207c-0.752 0.0024 -1.2193 0.8179 -0.8413 1.4679 0.1744 0.2997 0.4945 0.4846 0.8413 0.4857h2.3834c0.084 0.0012 0.1615 0.0455 0.2052 0.1172 0.0399 0.0731 0.0399 0.1614 0 0.2345 -0.4961 0.9754 -1.4943 1.5932 -2.5886 1.6019Zm4.9329 -3.9854c-0.0302 0.0175 -0.0674 0.0175 -0.0977 0 -0.0339 -0.0059 -0.063 -0.0277 -0.0781 -0.0586 -0.1476 -0.6692 -0.4374 -1.2989 -0.8498 -1.8462 -0.0668 -0.0899 -0.0668 -0.2129 0 -0.3028l0.547 -0.7814c0.0352 -0.0096 0.0723 -0.0096 0.1074 0l2.7644 -0.9768c0.1006 -0.0366 0.2131 -0.0004 0.2735 0.0879 0.0671 0.0825 0.0671 0.2007 0 0.2832Zm8.7914 3.9854c-1.6185 0 -2.9305 -1.312 -2.9305 -2.9304 0.0097 -0.7255 0.2881 -1.4216 0.7815 -1.9536 0.0246 -0.0661 0.0789 -0.1167 0.1465 -0.1368 0.0844 0.0173 0.1542 0.0761 0.1856 0.1563l0.8205 2.2271c0.1399 0.3868 0.507 0.6446 0.9182 0.6447 0.1164 -0.0012 0.2318 -0.021 0.3419 -0.0586 0.5083 -0.1875 0.7669 -0.7529 0.5763 -1.2601l-0.9768 -2.5592c2.2559 0 3.6658 2.442 2.5379 4.3956 -0.5235 0.9067 -1.4909 1.4653 -2.5379 1.4653Z" fill="#000000" strokeWidth="1"></path>
</svg>
);

const WinnersPage: React.FC<WinnersPageProps> = ({ electionStatus }) => {
    const { positions, isLoading: positionsLoading, error: positionsError } = useAllPositions();
    const { stats, isLoading: statsLoading, error: statsError } = useOverallStats();

    if (positionsLoading || statsLoading) {
        return <div className="container mx-auto px-4 py-8 text-center">Loading results...</div>;
    }

    if (positionsError || statsError) {
        return <div className="container mx-auto px-4 py-8 text-center text-red-500">Error loading results: {positionsError || statsError}</div>;
    }

    if (electionStatus !== 'POST_ELECTION') {
        return (
            <div className="container mx-auto px-4 py-8 min-h-[60vh] flex items-center justify-center">
                <Card className="text-center p-12 max-w-2xl">
                    <h1 className="text-3xl font-bold text-dmi-blue-900">Election Not Concluded</h1>
                    <p className="text-lg text-gray-600 mt-4">Winners will be displayed once the election ends.</p>
                </Card>
            </div>
        );
    }

    // Merge positions (with images) and stats (with votes)
    const enrichedPositions = positions.map(pos => {
        const posStats = stats?.positionsWithStats.find(ps => ps.positionId === pos.id);
        if (!posStats) return pos;

        type EnrichedCandidate = typeof pos.candidates[0] & { voteCount: number; votePercentage: number };

        const enrichedCands: EnrichedCandidate[] = pos.candidates.map(cand => {
            const candStats = posStats.candidates.find(cs => cs.candidateId === cand.id);
            return {
                ...cand,
                voteCount: candStats?.voteCount || 0,
                votePercentage: candStats?.votePercentage || 0
            } as EnrichedCandidate;
        }).sort((a, b) => b.voteCount - a.voteCount); // Sort here for winners/runners-up

        return {
            ...pos,
            candidates: enrichedCands
        };
    });

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-dmi-blue-900">Official Election Winners</h1>
                <p className="text-lg text-gray-600 mt-2">Congratulations to the newly elected student leaders for 2025!</p>
            </div>

            <div className="space-y-10">
                {enrichedPositions.map(position => {
                    const winner = position.candidates[0] as typeof position.candidates[0] & { voteCount: number; votePercentage: number };
                    const runnersUp = position.candidates.slice(1) as (typeof position.candidates[0] & { voteCount: number; votePercentage: number })[];

                    if (!winner) {
                        return (
                            <Card key={position.id} className="p-6 text-center">
                                <h2 className="text-2xl font-bold text-dmi-blue-900">{position.name}</h2>
                                <p className="text-gray-500 mt-2">No results or candidates found for this position.</p>
                            </Card>
                        );
                    }

                    return (
                        <Card key={position.id} className="overflow-hidden">
                            <div className="p-6 bg-gray-50 border-b">
                                <h2 className="text-2xl font-bold text-dmi-blue-900">{position.name}</h2>
                            </div>

                            {/* Winner Section */}
                            <div className="p-6 bg-gradient-to-br from-dmi-blue-50 to-white">
                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    <img
                                        src={winner.imageUrl || ''}
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
                                            {winner.voteCount.toLocaleString()} Votes ({winner.votePercentage.toFixed(2)}%)
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Runners-Up Section */}
                            {runnersUp.length > 0 && (
                                <div className="p-6">
                                    <h4 className="text-lg font-semibold text-gray-700 mb-3">Runners-Up 🚲 (Wadya Njinga)</h4>
                                    <ul className="space-y-3">
                                        {runnersUp.map(runner => (
                                            <li key={runner.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                                                <div className="flex items-center gap-2">
                                                    <BicycleIcon />
                                                    <p className="font-semibold text-gray-800">{runner.name}</p>
                                                </div>
                                                <p className="text-gray-600">
                                                    {runner.voteCount.toLocaleString()} Votes ({runner.votePercentage.toFixed(2)}%)
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