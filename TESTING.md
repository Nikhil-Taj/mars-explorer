# Testing Guide for Mars Explorer

This document provides comprehensive information about testing in the Mars Explorer project.

## Overview

The project uses Jest and React Testing Library for frontend testing, and Jest with Supertest for backend testing.

## Frontend Testing

### Setup

The frontend uses:
- **Jest**: JavaScript testing framework
- **React Testing Library**: Testing utilities for React components
- **@testing-library/user-event**: User interaction simulation
- **@testing-library/jest-dom**: Custom Jest matchers

### Running Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

### Test Structure

```
frontend/src/
├── components/
│   ├── __tests__/
│   │   ├── MarsExplorer.test.tsx
│   │   ├── MarsPhotoGallery.test.tsx
│   │   └── MarsPhotoCard.test.tsx
├── services/
│   └── __tests__/
│       └── marsApi.test.ts
├── utils/
│   └── __tests__/
│       └── dateUtils.test.ts
└── test/
    ├── setup.ts
    └── testUtils.tsx
```

### Writing Component Tests

```typescript
import { render, screen, fireEvent } from '../test/testUtils';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(screen.getByText('Updated Text')).toBeInTheDocument();
  });
});
```

### Mocking

The test setup includes mocks for:
- **Framer Motion**: Prevents animation issues in tests
- **Lucide React**: Icon components
- **Window APIs**: matchMedia, IntersectionObserver, ResizeObserver

## Backend Testing

### Setup

The backend uses:
- **Jest**: JavaScript testing framework
- **Supertest**: HTTP assertion library
- **ts-jest**: TypeScript preprocessor for Jest

### Running Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run tests for CI
npm run test:ci
```

### Test Structure

```
backend/src/
├── controllers/
│   └── __tests__/
│       └── MarsController.test.ts
├── services/
│   └── __tests__/
│       └── MarsService.test.ts
├── __tests__/
│   └── integration.test.ts
└── test/
    └── setup.ts
```

### Writing Controller Tests

```typescript
import request from 'supertest';
import app from '../app';

describe('MarsController', () => {
  it('should return photos', async () => {
    const response = await request(app)
      .get('/api/mars/photos/latest')
      .expect(200);

    expect(response.body).toHaveProperty('photos');
    expect(Array.isArray(response.body.photos)).toBe(true);
  });
});
```

### Writing Service Tests

```typescript
import { MarsService } from '../MarsService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('MarsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch photos', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { photos: [] } });
    
    const result = await MarsService.getLatestPhotos();
    
    expect(result).toEqual([]);
    expect(mockedAxios.get).toHaveBeenCalledWith(/* expected URL and params */);
  });
});
```

## Test Coverage

### Coverage Reports

Both frontend and backend generate coverage reports in the `coverage/` directory:

- **HTML Report**: `coverage/lcov-report/index.html`
- **LCOV Report**: `coverage/lcov.info`
- **Text Summary**: Displayed in terminal

### Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Best Practices

### General

1. **Test Behavior, Not Implementation**: Focus on what the component/function does, not how it does it
2. **Use Descriptive Test Names**: Test names should clearly describe what is being tested
3. **Arrange, Act, Assert**: Structure tests with clear setup, execution, and verification phases
4. **One Assertion Per Test**: Keep tests focused and easy to debug

### Frontend Specific

1. **Use Testing Library Queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
2. **Test User Interactions**: Simulate real user behavior with `userEvent`
3. **Mock External Dependencies**: Mock API calls, third-party libraries
4. **Test Accessibility**: Ensure components are accessible

### Backend Specific

1. **Test HTTP Status Codes**: Verify correct status codes are returned
2. **Test Error Handling**: Ensure proper error responses
3. **Mock External APIs**: Don't make real API calls in tests
4. **Test Validation**: Verify input validation works correctly

## Continuous Integration

### GitHub Actions (Example)

```yaml
name: Tests

on: [push, pull_request]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd frontend && npm ci
      - run: cd frontend && npm run test:ci

  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd backend && npm ci
      - run: cd backend && npm run test:ci
```

## Debugging Tests

### Frontend

```bash
# Debug specific test
npm test -- --testNamePattern="specific test name"

# Debug with verbose output
npm test -- --verbose

# Debug with watch mode
npm run test:watch
```

### Backend

```bash
# Debug specific test file
npm test -- MarsController.test.ts

# Debug with verbose output
npm test -- --verbose

# Debug integration tests only
npm run test:integration
```

## Common Issues

### Frontend

1. **Async Operations**: Use `waitFor` for async operations
2. **User Events**: Use `userEvent` instead of `fireEvent` for user interactions
3. **Query Client**: Use test utilities that provide QueryClient

### Backend

1. **Environment Variables**: Ensure test environment variables are set
2. **Database Connections**: Mock database operations in unit tests
3. **API Keys**: Use test API keys or mock external API calls

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
