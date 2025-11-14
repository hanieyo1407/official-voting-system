// web/pages/WinnersPage.tsx

import React from 'react';
import { ElectionStatus } from '../types';
import Card from '../components/Card';
import { useOverallStats } from '../hooks/useOverallStats';
import { useAllPositions } from '../hooks/useAllPositions';

interface WinnersPageProps {
  electionStatus: ElectionStatus;
}

const CrownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" >
    <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/>
    <path d="M5 21h14"/>
  </svg>
);

const BicycleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="18" r="3" />
    <path d="M6 18 L10 12 L14 12 L18 18" />
    <path d="M10 12 L12 6" />
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

  const enrichedPositions = positions.map(pos => {
    const posStats = stats?.positionsWithStats.find(ps => ps.positionId === pos.id);
    if (!posStats) return pos;

    type EnrichedCandidate = typeof pos.candidates[0] & { voteCount: number; votePercentage: number };

    const enrichedCands: EnrichedCandidate[] = pos.candidates
      .map(cand => {
        const candStats = posStats.candidates.find(cs => cs.candidateId === cand.id);
        return {
          ...cand,
          voteCount: candStats?.voteCount || 0,
          votePercentage: candStats?.votePercentage || 0
        } as EnrichedCandidate;
      })
      .sort((a, b) => b.voteCount - a.voteCount);

    return {
      ...pos,
      candidates: enrichedCands
    };
  });

  const placeholder = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="100%" height="100%" fill="%23e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%236b7280">No Image</text></svg>';

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

          const winnerSrc = winner.imageUrl && winner.imageUrl.trim().length > 0 ? winner.imageUrl : placeholder;

          return (
            <Card key={position.id} className="overflow-hidden">
              <div className="p-6 bg-gray-50 border-b">
                <h2 className="text-2xl font-bold text-dmi-blue-900">{position.name}</h2>
              </div>

              <div className="p-6 bg-gradient-to-br from-dmi-blue-50 to-white">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <img
                    src={winnerSrc}
                    alt={winner.name}
                    className="w-32 h-32 rounded-full object-cover shadow-xl border-4 border-dmi-gold-500"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== placeholder) {
                        target.src = placeholder;
                      }
                    }}
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

              {runnersUp.length > 0 && (
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-gray-700 mb-3">Runners-Up 🚲 (Wadya Njinga)</h4>
                  <ul className="space-y-3">
                    {runnersUp.map(runner => {
                      const runnerSrc = runner.imageUrl && runner.imageUrl.trim().length > 0 ? runner.imageUrl : placeholder;
                      return (
                        <li key={runner.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <img
                              src={runnerSrc}
                              alt={runner.name}
                              className="w-10 h-10 rounded-full object-cover border border-gray-300"
                              onError={(e) => {
                                const target = e.currentTarget;
                                if (target.src !== placeholder) {
                                  target.src = placeholder;
                                }
                              }}
                            />
                            <div className="flex items-center gap-2">
                              <BicycleIcon />
                              <p className="font-semibold text-gray-800">{runner.name}</p>
                            </div>
                          </div>
                          <p className="text-gray-600">
                            {runner.voteCount.toLocaleString()} Votes ({runner.votePercentage.toFixed(2)}%)
                          </p>
                        </li>
                      );
                    })}
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
