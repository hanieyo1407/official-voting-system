//web/types.ts

export enum Page {
  Intro,
  Home,
  Authentication,
  Voting,
  VoteSuccess,
  Verification,
  Results,
  Winners,
  AdminLogin,
  Admin,
}

export type AdminRole = 'super_admin' | 'admin' | 'moderator';

export interface AdminUser {
  id: number; // FIXED: Changed from string to number (SERIAL PK)
  username: string;
  role: AdminRole;
  email: string; // ADDED: Required by live Admin API
  isActive?: boolean; // ADDED: Required by live Admin API
  lastLogin?: string; // ADDED: Required by live Admin API
  createdAt?: string; // ADDED: Required by live Admin API
  password?: string; // For mock authentication
}

export interface Candidate {
  id: number; // FIXED: Changed from string to number (SERIAL PK)
  name: string;
  photoUrl: string; // Assuming photoUrl is part of the final Candidate structure
  faculty: string; // Assuming faculty is part of the final Candidate structure
  manifesto: string;
}

export interface Position {
  id: number; // FIXED: Changed from string to number (SERIAL PK)
  name: string;
  candidates: Candidate[];
  // ADDED: Align with live stats if this object is reused for voting and results
  totalVotes?: number;
  voterTurnout?: number;
}

export interface VoteSelection {
  [positionId: number]: number | 'abstain'; // FIXED: positionId and candidateId should be number
}

// API-Aligned Types for Statistics (These look largely correct, but need minor cleanup)
export interface CandidateStats {
    candidateId: number; // FIXED: Added ID to align with API response structure
    candidateName: string;
    manifesto?: string; // ADDED: From CandidateStats schema
    voteCount: number;
    votePercentage: number;
}

export interface PositionStats {
    positionId: number; // ADDED: To align with API response structure
    positionName: string;
    totalCandidates: number; // ADDED: From PositionStats schema
    totalVotes: number;
    voterTurnout: number; // ADDED: From PositionStats schema
    candidates: CandidateStats[];
}

export interface OverallStats {
    totalPositions: number;
    totalCandidates: number;
    averageVotesPerPosition?: number; // ADDED: From OverallStats schema
    mostVotedPosition?: string; // ADDED: From OverallStats schema
    leastVotedPosition?: string; // ADDED: From OverallStats schema
}

export interface VotingStats {
    totalVoters: number;
    totalVotesCast: number;
    voterTurnout: number;
    positionsWithStats: PositionStats[];
    overallStats: OverallStats;
}

export type ElectionStatus = 'PRE_ELECTION' | 'LIVE' | 'POST_ELECTION';

export interface AuditLogEntry {
  id: number; // FIXED: Changed from string to number
  timestamp: Date;
  adminUsername: string;
  action: string;
  details: string; // This should be updated to match the AuditLog table/log format (which uses JSONB)
  ipAddress: string;
}