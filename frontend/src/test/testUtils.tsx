import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Helper functions for testing
export const createMockPhoto = (overrides = {}) => ({
  id: 1,
  img_src: 'https://example.com/photo.jpg',
  earth_date: '2023-01-01',
  sol: 1000,
  camera: { name: 'FHAZ', full_name: 'Front Hazard Avoidance Camera' },
  rover: { name: 'Curiosity' },
  ...overrides,
});

export const createMockCamera = (overrides = {}) => ({
  name: 'FHAZ',
  fullName: 'Front Hazard Avoidance Camera',
  ...overrides,
});

export const createMockRoverInfo = (overrides = {}) => ({
  name: 'Curiosity',
  status: 'active',
  landing_date: '2012-08-05',
  launch_date: '2011-11-26',
  total_photos: 500000,
  mission_duration: 4000,
  ...overrides,
});

// Mock API responses
export const mockApiResponses = {
  photos: [createMockPhoto(), createMockPhoto({ id: 2, sol: 1001 })],
  cameras: [
    createMockCamera(),
    createMockCamera({ name: 'RHAZ', fullName: 'Rear Hazard Avoidance Camera' }),
  ],
  roverInfo: createMockRoverInfo(),
};

// Wait for async operations
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0));
