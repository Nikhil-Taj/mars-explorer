import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MarsExplorer from '../MarsExplorer';
import { marsApiClient } from '../../services/marsApi';

// Mock the API client
jest.mock('../../services/marsApi', () => ({
  marsApiClient: {
    getLatestPhotos: jest.fn(),
    getPhotosBySol: jest.fn(),
    getPhotosByDate: jest.fn(),
    getRoverInfo: jest.fn(),
    getCameras: jest.fn(),
  },
  MarsService: {
    getLatestPhotos: jest.fn(),
    getPhotosBySol: jest.fn(),
    getPhotosByDate: jest.fn(),
  },
}));

const mockMarsApiClient = marsApiClient as jest.Mocked<typeof marsApiClient>;

// Mock data
const mockPhotos = [
  {
    id: 1,
    img_src: 'https://example.com/photo1.jpg',
    earth_date: '2023-01-01',
    sol: 1000,
    camera: { name: 'FHAZ', full_name: 'Front Hazard Avoidance Camera' },
    rover: { name: 'Curiosity' },
  },
  {
    id: 2,
    img_src: 'https://example.com/photo2.jpg',
    earth_date: '2023-01-01',
    sol: 1000,
    camera: { name: 'RHAZ', full_name: 'Rear Hazard Avoidance Camera' },
    rover: { name: 'Curiosity' },
  },
];

const mockCameras = [
  { name: 'FHAZ', fullName: 'Front Hazard Avoidance Camera' },
  { name: 'RHAZ', fullName: 'Rear Hazard Avoidance Camera' },
  { name: 'MAST', fullName: 'Mast Camera' },
];

const mockRoverInfo = {
  name: 'Curiosity',
  status: 'active',
  landing_date: '2012-08-05',
  launch_date: '2011-11-26',
  total_photos: 500000,
  mission_duration: 4000,
};

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('MarsExplorer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMarsApiClient.getLatestPhotos.mockResolvedValue(mockPhotos);
    mockMarsApiClient.getCameras.mockResolvedValue(mockCameras);
    mockMarsApiClient.getRoverInfo.mockResolvedValue(mockRoverInfo);
  });

  it('renders the main title', async () => {
    renderWithQueryClient(<MarsExplorer />);
    
    expect(screen.getByText('The Red Planet')).toBeInTheDocument();
  });

  it('renders the description', async () => {
    renderWithQueryClient(<MarsExplorer />);
    
    expect(screen.getByText(/Journey through the Red Planet/)).toBeInTheDocument();
  });

  it('renders rover stats', async () => {
    renderWithQueryClient(<MarsExplorer />);
    
    await waitFor(() => {
      expect(screen.getByText('Days on Mars')).toBeInTheDocument();
      expect(screen.getByText('Cameras')).toBeInTheDocument();
      expect(screen.getByText('Gale Crater')).toBeInTheDocument();
    });
  });

  it('renders navigation tabs', async () => {
    renderWithQueryClient(<MarsExplorer />);
    
    expect(screen.getByText('Latest Photos')).toBeInTheDocument();
    expect(screen.getByText('By Sol')).toBeInTheDocument();
    expect(screen.getByText('By Date')).toBeInTheDocument();
  });

  it('renders view navigation buttons', async () => {
    renderWithQueryClient(<MarsExplorer />);
    
    expect(screen.getByText('Photo Gallery')).toBeInTheDocument();
    expect(screen.getByText('Statistics')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it('switches between tabs', async () => {
    renderWithQueryClient(<MarsExplorer />);
    
    const solTab = screen.getByText('By Sol');
    fireEvent.click(solTab);
    
    expect(screen.getByPlaceholderText('Enter Sol (0-4000)')).toBeInTheDocument();
  });

  it('switches between view modes', async () => {
    renderWithQueryClient(<MarsExplorer />);
    
    const statsButton = screen.getByText('Statistics');
    fireEvent.click(statsButton);
    
    // Should switch to stats view
    await waitFor(() => {
      expect(statsButton).toHaveStyle('background: rgb(239, 68, 68)');
    });
  });

  it('loads initial data on mount', async () => {
    renderWithQueryClient(<MarsExplorer />);
    
    await waitFor(() => {
      expect(mockMarsApiClient.getLatestPhotos).toHaveBeenCalled();
      expect(mockMarsApiClient.getCameras).toHaveBeenCalled();
      expect(mockMarsApiClient.getRoverInfo).toHaveBeenCalled();
    });
  });

  it('handles sol input submission', async () => {
    mockMarsApiClient.getPhotosBySol.mockResolvedValue(mockPhotos);
    renderWithQueryClient(<MarsExplorer />);
    
    // Switch to Sol tab
    const solTab = screen.getByText('By Sol');
    fireEvent.click(solTab);
    
    // Enter sol value and submit
    const solInput = screen.getByPlaceholderText('Enter Sol (0-4000)');
    const submitButton = screen.getByText('Search');
    
    fireEvent.change(solInput, { target: { value: '2000' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockMarsApiClient.getPhotosBySol).toHaveBeenCalledWith(2000, undefined);
    });
  });

  it('handles date input submission', async () => {
    mockMarsApiClient.getPhotosByDate.mockResolvedValue(mockPhotos);
    renderWithQueryClient(<MarsExplorer />);
    
    // Switch to Date tab
    const dateTab = screen.getByText('By Date');
    fireEvent.click(dateTab);
    
    // Enter date value and submit
    const dateInput = screen.getByDisplayValue('');
    const submitButton = screen.getByText('Search');
    
    fireEvent.change(dateInput, { target: { value: '2023-01-01' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockMarsApiClient.getPhotosByDate).toHaveBeenCalledWith('2023-01-01', undefined);
    });
  });
});
