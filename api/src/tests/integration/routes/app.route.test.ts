// /// <reference types="jest" />

// import request from 'supertest';
// import express from 'express';
// import appRoute from '../../../src/routes/app.route';
// import { CacheService } from '../../../src/services/cache.service';


// jest.mock('../../../src/services/cache.service');


// const app = express();
// app.use(express.json());
// app.use('/api/app', appRoute);

// const mockedCacheService = CacheService as jest.Mocked<typeof CacheService>;

// describe('App Routes Integration Tests', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('GET /api/app/health', () => {
//     it('should return health status', async () => {
//       const response = await request(app)
//         .get('/api/app/health')
//         .expect(200);

//       expect(response.body).toHaveProperty('status', 'ok');
//       expect(response.body).toHaveProperty('timestamp');
//       expect(response.body).toHaveProperty('uptime');
//     });
//   });

//   describe('GET /api/app/stats', () => {
//     it('should return cached stats when available', async () => {
//       const mockStats = {
//         totalPositions: 5,
//         totalCandidates: 25,
//         totalVotes: 100,
//         lastUpdated: new Date().toISOString()
//       };

//       mockedCacheService.getOverallStats.mockReturnValue(mockStats);

//       const response = await request(app)
//         .get('/api/app/stats')
//         .expect(200);

//       expect(response.body).toEqual(mockStats);
//       expect(mockedCacheService.getOverallStats).toHaveBeenCalled();
//     });

//     it('should return 503 when stats not available', async () => {
//       mockedCacheService.getOverallStats.mockReturnValue(undefined);

//       const response = await request(app)
//         .get('/api/app/stats')
//         .expect(503);

//       expect(response.body).toHaveProperty('error', 'Stats not available');
//     });
//   });

//   describe('GET /api/app/positions', () => {
//     it('should return cached positions when available', async () => {
//       const mockPositions = [
//         { id: 1, position_name: 'President' },
//         { id: 2, position_name: 'Vice President' }
//       ];

//       mockedCacheService.getPositions.mockReturnValue(mockPositions);

//       const response = await request(app)
//         .get('/api/app/positions')
//         .expect(200);

//       expect(response.body).toEqual(mockPositions);
//       expect(mockedCacheService.getPositions).toHaveBeenCalled();
//     });

//     it('should return 503 when positions not available', async () => {
//       mockedCacheService.getPositions.mockReturnValue(undefined);

//       const response = await request(app)
//         .get('/api/app/positions')
//         .expect(503);

//       expect(response.body).toHaveProperty('error', 'Positions not available');
//     });
//   });
// });