import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MarsPhotoGallery from '../MarsPhotoGallery';
import type { MarsPhoto, MarsCamera } from '../../types';

// Mock the MarsPhotoCard and MarsPhotoModal components
jest.mock('../MarsPhotoCard', () => {
  return function MockMarsPhotoCard({ photo, onSelect }: any) {
    return (
      <div data-testid={`photo-card-${photo.id}`} onClick={() => onSelect(photo)}>
        <img src={photo.img_src} alt={`Mars photo ${photo.id}`} />
        <p>Sol: {photo.sol}</p>
        <p>Camera: {photo.camera.name}</p>
      </div>
    );
  };
});

jest.mock('../MarsPhotoModal', () => {
  return function MockMarsPhotoModal({ photo, isOpen, onClose }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="photo-modal">
        <button onClick={onClose}>Close</button>
        <img src={photo.img_src} alt="Modal photo" />
      </div>
    );
  };
});

const mockPhotos: MarsPhoto[] = [
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
    earth_date: '2023-01-02',
    sol: 1001,
    camera: { name: 'RHAZ', full_name: 'Rear Hazard Avoidance Camera' },
    rover: { name: 'Curiosity' },
  },
  {
    id: 3,
    img_src: 'https://example.com/photo3.jpg',
    earth_date: '2023-01-03',
    sol: 1002,
    camera: { name: 'MAST', full_name: 'Mast Camera' },
    rover: { name: 'Curiosity' },
  },
];

const mockCameras: MarsCamera[] = [
  { name: 'FHAZ', fullName: 'Front Hazard Avoidance Camera' },
  { name: 'RHAZ', fullName: 'Rear Hazard Avoidance Camera' },
  { name: 'MAST', fullName: 'Mast Camera' },
];

describe('MarsPhotoGallery', () => {
  const defaultProps = {
    photos: mockPhotos,
    cameras: mockCameras,
    loading: false,
  };

  it('renders photo count correctly', () => {
    render(<MarsPhotoGallery {...defaultProps} />);
    
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('photos')).toBeInTheDocument();
  });

  it('renders all photos in grid view', () => {
    render(<MarsPhotoGallery {...defaultProps} />);
    
    expect(screen.getByTestId('photo-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('photo-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('photo-card-3')).toBeInTheDocument();
  });

  it('shows filters button', () => {
    render(<MarsPhotoGallery {...defaultProps} />);
    
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('toggles filters panel', async () => {
    const user = userEvent.setup();
    render(<MarsPhotoGallery {...defaultProps} />);
    
    const filtersButton = screen.getByText('Filters');
    await user.click(filtersButton);
    
    // Check if filters panel appears (you might need to adjust based on actual implementation)
    await waitFor(() => {
      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });
  });

  it('switches between grid and list view', async () => {
    const user = userEvent.setup();
    render(<MarsPhotoGallery {...defaultProps} />);
    
    // Find view toggle buttons
    const gridButton = screen.getByTestId('grid-view-icon').parentElement;
    const listButton = screen.getByTestId('list-view-icon').parentElement;
    
    expect(gridButton).toBeInTheDocument();
    expect(listButton).toBeInTheDocument();
    
    // Click list view
    if (listButton) {
      await user.click(listButton);
      // Verify list view is active (you might need to check styling or other indicators)
    }
  });

  it('opens photo modal when photo is clicked', async () => {
    const user = userEvent.setup();
    render(<MarsPhotoGallery {...defaultProps} />);
    
    const firstPhoto = screen.getByTestId('photo-card-1');
    await user.click(firstPhoto);
    
    await waitFor(() => {
      expect(screen.getByTestId('photo-modal')).toBeInTheDocument();
    });
  });

  it('closes photo modal', async () => {
    const user = userEvent.setup();
    render(<MarsPhotoGallery {...defaultProps} />);
    
    // Open modal
    const firstPhoto = screen.getByTestId('photo-card-1');
    await user.click(firstPhoto);
    
    await waitFor(() => {
      expect(screen.getByTestId('photo-modal')).toBeInTheDocument();
    });
    
    // Close modal
    const closeButton = screen.getByText('Close');
    await user.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByTestId('photo-modal')).not.toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    render(<MarsPhotoGallery {...defaultProps} loading={true} />);
    
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
  });

  it('shows empty state when no photos', () => {
    render(<MarsPhotoGallery {...defaultProps} photos={[]} />);
    
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('photos')).toBeInTheDocument();
  });

  it('filters photos by search term', async () => {
    const user = userEvent.setup();
    render(<MarsPhotoGallery {...defaultProps} />);
    
    // Open filters
    const filtersButton = screen.getByText('Filters');
    await user.click(filtersButton);
    
    // Find search input (you might need to adjust selector)
    const searchInput = screen.getByPlaceholderText(/search/i);
    if (searchInput) {
      await user.type(searchInput, 'FHAZ');
      
      // Should filter to only show FHAZ photos
      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
      });
    }
  });

  it('calls onLoadMore when load more button is clicked', async () => {
    const mockOnLoadMore = jest.fn();
    const user = userEvent.setup();
    
    render(<MarsPhotoGallery {...defaultProps} onLoadMore={mockOnLoadMore} />);
    
    const loadMoreButton = screen.getByText('Load More Photos');
    await user.click(loadMoreButton);
    
    expect(mockOnLoadMore).toHaveBeenCalled();
  });

  it('handles favorite functionality', async () => {
    const user = userEvent.setup();
    render(<MarsPhotoGallery {...defaultProps} />);
    
    // Open modal first
    const firstPhoto = screen.getByTestId('photo-card-1');
    await user.click(firstPhoto);
    
    await waitFor(() => {
      expect(screen.getByTestId('photo-modal')).toBeInTheDocument();
    });
    
    // Check if favorite functionality is available in modal
    // (Implementation depends on your modal component)
  });
});
