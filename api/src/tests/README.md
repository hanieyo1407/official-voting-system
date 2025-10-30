# Testing Documentation

This directory contains comprehensive tests for the SJBU Voting System, organized into three main categories:

## Test Structure

```
tests/
├── unit/                 # Unit tests for individual components
│   ├── services/        # Service layer tests
│   ├── controllers/     # Controller tests
│   └── middleware/      # Middleware tests
├── integration/         # Integration tests for API routes
│   └── routes/         # Route-level integration tests
├── e2e/                # End-to-end tests for complete flows
├── utils/              # Test utilities and helpers
│   └── test-helpers.ts
├── types/              # Test type definitions
│   └── jest.d.ts
├── setup.ts            # Test setup and configuration
├── .env.test           # Test environment variables
└── README.md           # This file
```

## Test Categories

### 1. Unit Tests
Test individual functions, methods, and classes in isolation.

**Examples:**
- `CacheService` methods (set, get, delete, etc.)
- `AdminService` authentication and CRUD operations
- Middleware functions
- Controller methods

### 2. Integration Tests
Test interactions between multiple components, typically API endpoints.

**Examples:**
- API route handlers with mocked dependencies
- Database operations through service layer
- Authentication middleware integration

### 3. End-to-End Tests
Test complete user workflows from start to finish.

**Examples:**
- Complete voting process
- Admin user management workflows
- Authentication flows

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run only e2e tests
npm run test:e2e
```

## Test Configuration

### Jest Configuration (`jest.config.js`)
- **Environment**: Node.js
- **Coverage**: Tracks code coverage across src/ directory
- **Setup**: Runs `tests/setup.ts` before each test suite
- **Transform**: Uses ts-jest for TypeScript compilation

### Test Environment Variables (`.env.test`)
Contains test-specific configuration:
- Test database connection strings
- Test JWT secrets
- Mock service credentials

## Writing Tests

### Unit Test Example
```typescript
import { CacheService } from '../../src/services/cache.service';

describe('CacheService', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    cacheService = new CacheService();
  });

  it('should set and get values correctly', () => {
    const result = cacheService.set('key', 'value');
    expect(result).toBe(true);

    const value = cacheService.get('key');
    expect(value).toBe('value');
  });
});
```

### Integration Test Example
```typescript
import request from 'supertest';
import app from '../../src/app';

describe('POST /api/auth/login', () => {
  it('should authenticate valid admin user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password123'
      })
      .expect(200);

    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('admin');
  });
});
```

## Test Utilities

### Test Helpers (`tests/utils/test-helpers.ts`)
Provides common utilities for testing:

- `createTestApp()` - Creates Express app instance for testing
- `generateTestToken()` - Generates JWT tokens for testing
- `createAdminToken()` - Creates admin authentication tokens
- `TestDataFactory` - Factory for creating test data objects
- `wait()` - Utility for testing async operations

### Example Usage
```typescript
import { createTestApp, createAdminToken, TestDataFactory } from '../utils/test-helpers';

const app = createTestApp(expressApp);
const token = createAdminToken({ role: 'admin' });
const testUser = TestDataFactory.user({ voucher: 'TEST1234' });
```

## Best Practices

### 1. Test Organization
- Group related tests using `describe` blocks
- Use descriptive test names that explain what is being tested
- Follow AAA pattern: Arrange, Act, Assert

### 2. Mocking
- Mock external dependencies (database, external APIs)
- Use spies for testing side effects
- Avoid over-mocking - test real behavior when possible

### 3. Assertions
- Use specific assertions (`toBe`, `toEqual`, `toHaveBeenCalled`)
- Test both positive and negative cases
- Verify error conditions and edge cases

### 4. Setup and Teardown
- Use `beforeEach`/`afterEach` for test isolation
- Clean up resources (database connections, files)
- Reset mocks between tests

### 5. Coverage Goals
- Aim for >80% code coverage
- Focus on critical paths and business logic
- Don't write tests for tests

## Database Testing

For tests that require database interaction:

1. Use a separate test database
2. Run migrations before tests
3. Clean database between tests
4. Use transactions for rollback

## Continuous Integration

Tests are designed to run in CI/CD environments:
- No external dependencies required
- Deterministic test results
- Proper exit codes for CI systems

## Debugging Tests

```bash
# Run specific test file
npm test admin.service.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should authenticate"

# Debug with inspect
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Contributing

When adding new features:
1. Write tests before implementing features (TDD)
2. Ensure all tests pass before submitting PR
3. Update test documentation if needed
4. Maintain test coverage standards