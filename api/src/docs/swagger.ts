import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SJBU Voting System API',
      version: '1.0.0',
      description: `
        # SJBU Voting System API Documentation

        A comprehensive voting system with admin management, statistics, auditing, and fraud detection.

        ## Authentication

        ### User Authentication
        - Uses JWT tokens stored in HTTP-only cookies
        - Token expires in 5 minutes for security

        ### Admin Authentication
        - Uses separate JWT tokens for admin functions
        - Token expires in 8 hours
        - Role-based access control (super_admin, admin, moderator)

        ## Rate Limiting

        - **General API**: 100 requests/15min per IP
        - **Voting**: 3 votes/5min per IP
        - **Authentication**: 5 attempts/15min per IP
        - **Admin**: 200 requests/5min per IP

        ## Caching

        - Position and candidate data cached for 10 minutes
        - Statistics cached for 30 minutes
        - Vote verification cached for 5 minutes

        ## Security Features

        - Comprehensive logging of all activities
        - Vote auditing and fraud detection
        - Rate limiting and DDoS protection
        - Input validation and sanitization
      `,
      contact: {
        name: 'SJBU Development Team',
        email: 'admin@sjbu-voting.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://your-production-url.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
        },
        adminCookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'admin_token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            message: {
              type: 'string',
              description: 'Detailed error message',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID',
            },
            voucher: {
              type: 'string',
              description: 'User voucher code',
            },
          },
        },
        Position: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Position ID',
            },
            position_name: {
              type: 'string',
              description: 'Name of the position',
            },
          },
        },
        Candidate: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Candidate ID',
            },
            name: {
              type: 'string',
              description: 'Candidate name',
            },
            manifesto: {
              type: 'string',
              description: 'Candidate manifesto',
            },
            position_id: {
              type: 'integer',
              description: 'Position ID',
            },
          },
        },
        Vote: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Vote ID',
            },
            voucher: {
              type: 'string',
              description: 'User voucher',
            },
            candidate_id: {
              type: 'integer',
              description: 'Candidate ID',
            },
            position_id: {
              type: 'integer',
              description: 'Position ID',
            },
            verification_code: {
              type: 'string',
              description: 'Vote verification code',
            },
          },
        },
        AdminUser: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Admin user ID',
            },
            username: {
              type: 'string',
              description: 'Admin username',
            },
            email: {
              type: 'string',
              description: 'Admin email',
            },
            role: {
              type: 'string',
              enum: ['super_admin', 'admin', 'moderator'],
              description: 'Admin role',
            },
            isActive: {
              type: 'boolean',
              description: 'Whether admin is active',
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              description: 'Last login timestamp',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
            },
          },
        },
        VotingStats: {
          type: 'object',
          properties: {
            totalVoters: {
              type: 'integer',
              description: 'Total number of registered voters',
            },
            totalVotesCast: {
              type: 'integer',
              description: 'Total number of votes cast',
            },
            voterTurnout: {
              type: 'number',
              format: 'float',
              description: 'Voter turnout percentage',
            },
            positionsWithStats: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/PositionStats',
              },
            },
            overallStats: {
              $ref: '#/components/schemas/OverallStats',
            },
          },
        },
        PositionStats: {
          type: 'object',
          properties: {
            positionId: {
              type: 'integer',
              description: 'Position ID',
            },
            positionName: {
              type: 'string',
              description: 'Position name',
            },
            totalCandidates: {
              type: 'integer',
              description: 'Number of candidates',
            },
            totalVotes: {
              type: 'integer',
              description: 'Total votes for this position',
            },
            voterTurnout: {
              type: 'number',
              format: 'float',
              description: 'Turnout percentage for this position',
            },
            candidates: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/CandidateStats',
              },
            },
          },
        },
        CandidateStats: {
          type: 'object',
          properties: {
            candidateId: {
              type: 'integer',
              description: 'Candidate ID',
            },
            candidateName: {
              type: 'string',
              description: 'Candidate name',
            },
            manifesto: {
              type: 'string',
              description: 'Candidate manifesto',
            },
            voteCount: {
              type: 'integer',
              description: 'Number of votes received',
            },
            votePercentage: {
              type: 'number',
              format: 'float',
              description: 'Percentage of votes',
            },
          },
        },
        OverallStats: {
          type: 'object',
          properties: {
            totalPositions: {
              type: 'integer',
              description: 'Total number of positions',
            },
            totalCandidates: {
              type: 'integer',
              description: 'Total number of candidates',
            },
            averageVotesPerPosition: {
              type: 'number',
              format: 'float',
              description: 'Average votes per position',
            },
            mostVotedPosition: {
              type: 'string',
              description: 'Name of most voted position',
            },
            leastVotedPosition: {
              type: 'string',
              description: 'Name of least voted position',
            },
          },
        },
        VoteAuditResult: {
          type: 'object',
          properties: {
            voteId: {
              type: 'integer',
              description: 'Vote ID',
            },
            voucher: {
              type: 'string',
              description: 'User voucher',
            },
            verificationCode: {
              type: 'string',
              description: 'Verification code',
            },
            candidateId: {
              type: 'integer',
              description: 'Candidate ID',
            },
            positionId: {
              type: 'integer',
              description: 'Position ID',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Vote timestamp',
            },
            isValid: {
              type: 'boolean',
              description: 'Whether vote is valid',
            },
            issues: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of issues found',
            },
            riskScore: {
              type: 'number',
              format: 'float',
              description: 'Risk score (0-100)',
            },
          },
        },
        AuditReport: {
          type: 'object',
          properties: {
            totalVotesAudited: {
              type: 'integer',
              description: 'Total votes audited',
            },
            validVotes: {
              type: 'integer',
              description: 'Number of valid votes',
            },
            suspiciousVotes: {
              type: 'integer',
              description: 'Number of suspicious votes',
            },
            invalidVotes: {
              type: 'integer',
              description: 'Number of invalid votes',
            },
            riskDistribution: {
              type: 'object',
              properties: {
                low: { type: 'integer' },
                medium: { type: 'integer' },
                high: { type: 'integer' },
                critical: { type: 'integer' },
              },
            },
            commonIssues: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  issue: { type: 'string' },
                  count: { type: 'integer' },
                  severity: {
                    type: 'string',
                    enum: ['low', 'medium', 'high', 'critical'],
                  },
                },
              },
            },
            recommendations: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
        FraudDetectionResult: {
          type: 'object',
          properties: {
            isSuspicious: {
              type: 'boolean',
              description: 'Whether suspicious activity detected',
            },
            riskLevel: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
              description: 'Risk level',
            },
            riskFactors: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of risk factors',
            },
            confidence: {
              type: 'number',
              format: 'float',
              description: 'Confidence level (0-100)',
            },
            details: {
              type: 'object',
              description: 'Detailed analysis results',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);