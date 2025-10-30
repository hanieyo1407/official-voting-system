// import { CacheService } from '../../../src/services/cache.service';

// describe('CacheService', () => {
//   let cacheService: CacheService;

//   beforeEach(() => {
//     cacheService = new CacheService();
//   });

//   describe('set and get', () => {
//     it('should set and get values correctly', () => {
//       const key = 'test-key';
//       const value = { data: 'test-data' };

//       cacheService.set(key, value);
//       const result = cacheService.get(key);

//       expect(result).toEqual(value);
//     });

//     it('should return undefined for non-existent keys', () => {
//       const result = cacheService.get('non-existent');
//       expect(result).toBeUndefined();
//     });
//   });

//   describe('delete', () => {
//     it('should delete existing keys', () => {
//       const key = 'test-key';
//       const value = 'test-value';

//       cacheService.set(key, value);
//       expect(cacheService.get(key)).toBe(value);

//       cacheService.del(key);
//       expect(cacheService.get(key)).toBeUndefined();
//     });
//   });

//   describe('has', () => {
//     it('should return true for existing keys', () => {
//       const key = 'test-key';
//       const value = 'test-value';

//       cacheService.set(key, value);
//       expect(cacheService.has(key)).toBe(true);
//     });

//     it('should return false for non-existent keys', () => {
//       expect(cacheService.has('non-existent')).toBe(false);
//     });
//   });

//   describe('flushAll', () => {
//     it('should flush all cache entries', () => {
//       cacheService.set('key1', 'value1');
//       cacheService.set('key2', 'value2');

//       expect(cacheService.has('key1')).toBe(true);
//       expect(cacheService.has('key2')).toBe(true);

//       cacheService.flushAll();

//       expect(cacheService.has('key1')).toBe(false);
//       expect(cacheService.has('key2')).toBe(false);
//     });
//   });

//   describe('getStats', () => {
//     it('should return cache statistics', () => {
//       cacheService.set('key1', 'value1');
//       cacheService.set('key2', 'value2');

//       const stats = cacheService.getStats();

//       expect(stats).toHaveProperty('keys');
//       expect(stats).toHaveProperty('hits');
//       expect(stats).toHaveProperty('misses');
//       expect(stats).toHaveProperty('ksize');
//       expect(stats).toHaveProperty('vsize');
//       expect(stats.keys).toBeGreaterThan(0);
//     });
//   });
// });