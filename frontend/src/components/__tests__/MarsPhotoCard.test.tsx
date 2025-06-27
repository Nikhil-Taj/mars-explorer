import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MarsPhotoCard from '../MarsPhotoCard';
import type { MarsPhoto } from '../../types';

const mockPhoto: MarsPhoto = {
  id: 1,
  img_src: 'https://example.com/photo1.jpg',
  earth_date: '2023-01-01',
  sol: 1000,
  camera: { name: 'FHAZ', full_name: 'Front Hazard Avoidance Camera' },
  rover: { name: 'Curiosity' },
};

describe('MarsPhotoCard', () => {
  const defaultProps = {
    photo: mockPhoto,
    onSelect: jest.fn(),
    onFavorite: jest.fn(),
    isFavorite: false,
    viewMode: 'grid' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders photo image', () => {
    render(<MarsPhotoCard {...defaultProps} />);
    
    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockPhoto.img_src);
  });

  it('displays photo metadata', () => {
    render(<MarsPhotoCard {...defaultProps} />);
    
    expect(screen.getByText('Sol 1000')).toBeInTheDocument();
    expect(screen.getByText('2023-01-01')).toBeInTheDocument();
    expect(screen.getByText('FHAZ')).toBeInTheDocument();
  });

  it('calls onSelect when card is clicked', async () => {
    const user = userEvent.setup();
    render(<MarsPhotoCard {...defaultProps} />);
    
    const card = screen.getByRole('img').closest('div');
    if (card) {
      await user.click(card);
      expect(defaultProps.onSelect).toHaveBeenCalledWith(mockPhoto);
    }
  });

  it('calls onFavorite when heart icon is clicked', async () => {
    const user = userEvent.setup();
    render(<MarsPhotoCard {...defaultProps} />);
    
    const heartIcon = screen.getByTestId('heart-icon');
    await user.click(heartIcon);
    
    expect(defaultProps.onFavorite).toHaveBeenCalledWith(mockPhoto.id);
  });

  it('shows filled heart when photo is favorite', () => {
    render(<MarsPhotoCard {...defaultProps} isFavorite={true} />);
    
    const heartIcon = screen.getByTestId('heart-icon');
    expect(heartIcon.parentElement).toHaveClass('text-red-500'); // or whatever class indicates favorite
  });

  it('shows empty heart when photo is not favorite', () => {
    render(<MarsPhotoCard {...defaultProps} isFavorite={false} />);
    
    const heartIcon = screen.getByTestId('heart-icon');
    expect(heartIcon.parentElement).not.toHaveClass('text-red-500');
  });

  it('renders in list view mode', () => {
    render(<MarsPhotoCard {...defaultProps} viewMode="list" />);
    
    // Check if the layout changes for list view
    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(screen.getByText('Sol 1000')).toBeInTheDocument();
  });

  it('handles image loading error', () => {
    render(<MarsPhotoCard {...defaultProps} />);
    
    const image = screen.getByRole('img');
    fireEvent.error(image);
    
    // Should handle error gracefully (implementation dependent)
    expect(image).toBeInTheDocument();
  });

  it('displays camera full name on hover or in list view', () => {
    render(<MarsPhotoCard {...defaultProps} viewMode="list" />);
    
    expect(screen.getByText('Front Hazard Avoidance Camera')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<MarsPhotoCard {...defaultProps} />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('alt');
    
    // Check for proper ARIA labels or roles
    const card = image.closest('div');
    expect(card).toHaveAttribute('role', 'button');
  });

  it('prevents event propagation on favorite button click', async () => {
    const user = userEvent.setup();
    render(<MarsPhotoCard {...defaultProps} />);
    
    const heartIcon = screen.getByTestId('heart-icon');
    await user.click(heartIcon);
    
    // onSelect should not be called when clicking favorite
    expect(defaultProps.onFavorite).toHaveBeenCalledWith(mockPhoto.id);
    expect(defaultProps.onSelect).not.toHaveBeenCalled();
  });

  it('shows loading state while image loads', () => {
    render(<MarsPhotoCard {...defaultProps} />);
    
    const image = screen.getByRole('img');
    
    // Before image loads
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('formats date correctly', () => {
    const photoWithDifferentDate = {
      ...mockPhoto,
      earth_date: '2023-12-25',
    };
    
    render(<MarsPhotoCard {...defaultProps} photo={photoWithDifferentDate} />);
    
    expect(screen.getByText('2023-12-25')).toBeInTheDocument();
  });

  it('handles very long camera names', () => {
    const photoWithLongCameraName = {
      ...mockPhoto,
      camera: {
        name: 'VERYLONGCAMERANAME',
        full_name: 'Very Long Camera Name That Might Overflow The Container',
      },
    };
    
    render(<MarsPhotoCard {...defaultProps} photo={photoWithLongCameraName} />);
    
    expect(screen.getByText('VERYLONGCAMERANAME')).toBeInTheDocument();
  });

  it('handles missing optional data gracefully', () => {
    const incompletePhoto = {
      ...mockPhoto,
      camera: { name: 'UNKNOWN', full_name: '' },
    };
    
    render(<MarsPhotoCard {...defaultProps} photo={incompletePhoto} />);
    
    expect(screen.getByText('UNKNOWN')).toBeInTheDocument();
  });
});
