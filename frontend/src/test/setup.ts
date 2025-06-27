import '@testing-library/jest-dom';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    span: 'span',
    h1: 'h1',
    p: 'p',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Rocket: () => <div data-testid="rocket-icon" />,
  Camera: () => <div data-testid="camera-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  Activity: () => <div data-testid="activity-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  Globe: () => <div data-testid="globe-icon" />,
  Zap: () => <div data-testid="zap-icon" />,
  Grid3X3: () => <div data-testid="grid-icon" />,
  BarChart3: () => <div data-testid="bar-chart-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  Shuffle: () => <div data-testid="shuffle-icon" />,
  Grid: () => <div data-testid="grid-view-icon" />,
  List: () => <div data-testid="list-view-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
  AlertCircle: () => <div data-testid="alert-icon" />,
  Heart: () => <div data-testid="heart-icon" />,
  Download: () => <div data-testid="download-icon" />,
  Search: () => <div data-testid="search-icon" />,
  X: () => <div data-testid="x-icon" />,
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};
