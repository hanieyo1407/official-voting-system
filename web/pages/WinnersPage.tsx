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
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" >
    <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/>
    <path d="M5 21h14"/>
  </svg>
);

const BicycleIcon = () => (
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" id="Fart-Farting--Streamline-Nasty" height="48" width="48">
  <desc>
    Fart Farting Streamline Icon: https://streamlinehq.com
  </desc>
  <g>
    <path d="M15.12 11.600000000000001A8 8 0 1 0 8 16a9.848 9.848 0 0 0 1.6 -0.16000000000000003V32a3.2 3.2 0 0 0 6.4 0V21.12l2.8000000000000003 2.8000000000000003A8 8 0 0 1 20.8 28.8v16a3.2 3.2 0 0 0 6.4 0V27.200000000000003a9.600000000000001 9.600000000000001 0 0 0 -2.4800000000000004 -6l-9.600000000000001 -9.600000000000001ZM1.6 8a6.4 6.4 0 1 1 9.200000000000001 5.760000000000001 0.6080000000000001 0.6080000000000001 0 0 0 -0.4 -0.16000000000000003 0.7040000000000001 0.7040000000000001 0 0 0 -0.7200000000000001 0.5599999999999999 6.088000000000001 6.088000000000001 0 0 1 -1.6800000000000002 0.24 6.4 6.4 0 0 1 -6.4 -6.4Zm24 36.800000000000004a1.6 1.6 0 0 1 -3.2 0V28.8a9.600000000000001 9.600000000000001 0 0 0 -2.4800000000000004 -6L16 18.880000000000003V17.6a0.8 0.8 0 0 0 -1.6 0v14.4a1.6 1.6 0 0 1 -3.2 0V15.36a8.8 8.8 0 0 0 3.04 -2.32L23.6 22.400000000000002a8 8 0 0 1 2 4.88V44.800000000000004Z" fill="#000000" fill-rule="evenodd" stroke-width="0.8"></path>
    <path d="M37.6 24h-5.6000000000000005a0.8 0.8 0 0 0 0 1.6h5.6000000000000005a0.8 0.8 0 0 0 0 -1.6" fill="#000000" fill-rule="evenodd" stroke-width="0.8"></path>
    <path d="m37.12 29.680000000000003 -6.4 -2.4000000000000004a0.8 0.8 0 1 0 -0.5599999999999999 1.52l6.4 2.4000000000000004c0.08000000000000002 0 0.16000000000000003 0.08000000000000002 0.32000000000000006 0.08000000000000002a0.6960000000000001 0.6960000000000001 0 0 0 0.7200000000000001 -0.48c0.08000000000000002 -0.5599999999999999 -0.08000000000000002 -0.96 -0.48 -1.1199999999999999" fill="#000000" fill-rule="evenodd" stroke-width="0.8"></path>
    <path d="M30.400000000000002 22.400000000000002a0.6080000000000001 0.6080000000000001 0 0 0 0.32000000000000006 -0.08000000000000002l6.4 -2.4000000000000004a0.8 0.8 0 1 0 -0.5599999999999999 -1.52l-6.4 2.4000000000000004a0.8 0.8 0 0 0 -0.48 1.04 0.6880000000000001 0.6880000000000001 0 0 0 0.7200000000000001 0.5599999999999999" fill="#000000" fill-rule="evenodd" stroke-width="0.8"></path>
    <path d="M48 24.8a5.296 5.296 0 0 0 -3.84 -5.36 4.104 4.104 0 0 0 -0.8 -3.04A5.120000000000001 5.120000000000001 0 0 0 39.2 14.4a0.8 0.8 0 0 0 0 1.6 3.4640000000000004 3.4640000000000004 0 0 1 2.8000000000000003 1.2800000000000002 2.632 2.632 0 0 1 0.4 2.4800000000000004 0.8480000000000001 0.8480000000000001 0 0 0 0.08000000000000002 0.6400000000000001 1.024 1.024 0 0 0 0.5599999999999999 0.4 3.904 3.904 0 0 1 3.3600000000000003 4 3.904 3.904 0 0 1 -3.3600000000000003 4 0.9279999999999999 0.9279999999999999 0 0 0 -0.5599999999999999 0.4 1.6 1.6 0 0 0 -0.08000000000000002 0.6400000000000001 2.936 2.936 0 0 1 -0.4 2.4800000000000004A3.576 3.576 0 0 1 39.2 33.6a0.8 0.8 0 0 0 0 1.6 5.016 5.016 0 0 0 4.08 -1.92 4.104 4.104 0 0 0 0.8 -3.04A5.432 5.432 0 0 0 48 24.8" fill="#000000" fill-rule="evenodd" stroke-width="0.8"></path>
    <path d="M12.8 8.8a0.752 0.752 0 0 0 -0.8 -0.8H4a0.752 0.752 0 0 0 -0.8 0.8c0 1.8399999999999999 2.16 4 4.800000000000001 4s4.800000000000001 -2.16 4.800000000000001 -4Zm-7.76 0.8h5.84a3.4640000000000004 3.4640000000000004 0 0 1 -5.84 0Z" fill="#000000" fill-rule="evenodd" stroke-width="0.8"></path>
  </g>
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
        <Card className="text-center p-6 max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-dmi-blue-900">Election Not Concluded</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-3">Winners will be displayed once the election ends.</p>
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
    <div className="container mx-auto px-4 py-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-dmi-blue-900">Official Election Winners</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">Congratulations to the newly elected student leaders for 2025!</p>
      </div>

      <div className="space-y-8">
        {enrichedPositions.map(position => {
          const winner = position.candidates[0] as typeof position.candidates[0] & { voteCount: number; votePercentage: number };
          const runnersUp = position.candidates.slice(1) as (typeof position.candidates[0] & { voteCount: number; votePercentage: number })[];

          if (!winner) {
            return (
              <Card key={position.id} className="p-4 text-center">
                <h2 className="text-lg sm:text-2xl font-bold text-dmi-blue-900">{position.name}</h2>
                <p className="text-sm text-gray-500 mt-2">No results or candidates found for this position.</p>
              </Card>
            );
          }

          const winnerSrc = winner.imageUrl && winner.imageUrl.trim().length > 0 ? winner.imageUrl : placeholder;

          return (
            <Card key={position.id} className="overflow-hidden">
              <div className="p-4 sm:p-6 bg-gray-50 border-b">
                <h2 className="text-lg sm:text-2xl font-bold text-dmi-blue-900">{position.name}</h2>
              </div>

              <div className="p-4 sm:p-6 bg-gradient-to-br from-dmi-blue-50 to-white">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  <img
                    src={winnerSrc}
                    alt={winner.name}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover shadow-xl border-4 border-dmi-gold-500"
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
                      <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-yellow-600">Winner</span>
                    </div>
                    <h3 className="text-xl sm:text-3xl font-extrabold text-dmi-blue-900">{winner.name}</h3>
                    <p className="text-sm sm:text-lg font-semibold text-dmi-blue-700 mt-1">
                      {winner.voteCount.toLocaleString()} Votes ({winner.votePercentage.toFixed(2)}%)
                    </p>
                  </div>
                </div>
              </div>

              {runnersUp.length > 0 && (
                <div className="p-4 sm:p-6">
                  <h4 className="text-sm sm:text-lg font-semibold text-gray-700 mb-3">Runners-Up (Wainvera Fungo)</h4>
                  <ul className="space-y-2">
                    {runnersUp.map(runner => {
                      const runnerSrc = runner.imageUrl && runner.imageUrl.trim().length > 0 ? runner.imageUrl : placeholder;
                      return (
                        <li key={runner.name} className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <img
                              src={runnerSrc}
                              alt={runner.name}
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-300"
                              onError={(e) => {
                                const target = e.currentTarget;
                                if (target.src !== placeholder) {
                                  target.src = placeholder;
                                }
                              }}
                            />
                            <div className="flex items-center gap-2">
                              <BicycleIcon />
                              <p className="font-semibold text-gray-800 text-sm sm:text-base">{runner.name}</p>
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600">
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
