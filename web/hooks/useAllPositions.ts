// web/hooks/useAllPositions.ts

import { useState, useEffect, useCallback } from 'react';
import sjbuApi from '../src/api/sjbuApi';
import { isAxiosError } from 'axios';
// Assuming the Candidate and Position types are imported from your global types file
import { Position, Candidate } from '../types'; 

// CRITICAL: Interface matching the data structure required by AdminDashboard.tsx
interface PositionWithCandidates extends Position {
    candidates: Candidate[];
}

interface AllPositionsState {
    positions: PositionWithCandidates[];
    isLoading: boolean;
    error: string | null;
    fetchPositions: () => Promise<void>;
}

/**
 * Custom hook to fetch all positions and their candidates from the backend.
 * Fixes the issue where the Admin Dashboard only shows the first position/candidate set.
 */
export const useAllPositions = (): AllPositionsState => {
    const [positions, setPositions] = useState<PositionWithCandidates[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPositions = useCallback(async () => {
        setIsLoading(true);
        try {
            // CRITICAL: Call the new API function
            const response = await sjbuApi.getAllPositionsWithCandidates(); 
            
            // The response data is { positions: [...] }
            const rawPositions = response.data.positions || [];

            // Map DTO from API to the local hook/component interface
            setPositions(rawPositions.map((p: any) => ({
                id: p.id,
                name: p.name, 
                candidates: p.candidates.map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    positionId: c.positionId,
                    imageUrl: c.imageUrl,
                    // CRITICAL: Mapping 'manifesto' back to the property used in the Card display logic
                    // If the frontend Candidate type uses 'bio', we map manifesto to bio here.
                    // Given the final dashboard fix, we assume the component now correctly expects the manifesto field (or a fallback).
                    // We'll use manifesto in the return object here and rely on the updated AdminDashboard.tsx logic.
                    manifesto: c.manifesto,
                    // The AdminDashboard.tsx CandidateView used cand.bio, which we changed to cand.manifesto
                })),
            })) as PositionWithCandidates[]);

            setError(null);
        } catch (e) {
            const message = isAxiosError(e) && e.response?.data?.error || 'Failed to load positions and candidates.';
            setError(message);
            console.error('Fetch All Positions Error:', e);
            setPositions([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPositions();
    }, [fetchPositions]);

    return { positions, isLoading, error, fetchPositions };
};