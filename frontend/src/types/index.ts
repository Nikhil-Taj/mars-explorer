// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

// Mars Rover Photo Types
export interface MarsPhoto {
  id: number;
  sol: number;
  camera: {
    id: number;
    name: string;
    rover_id: number;
    full_name: string;
  };
  img_src: string;
  earth_date: string;
  rover: {
    id: number;
    name: string;
    landing_date: string;
    launch_date: string;
    status: string;
    max_sol: number;
    max_date: string;
    total_photos: number;
  };
}

export interface MarsCamera {
  name: string;
  fullName: string;
  description: string;
}

export interface RoverInfo {
  name: string;
  landing_date: string;
  launch_date: string;
  status: string;
  mission_duration: number;
  description: string;
  cameras: number;
}

// Legacy APOD Types (keeping for compatibility)
export interface ApodData {
  date: string;
  explanation: string;
  hdurl?: string;
  media_type: 'image' | 'video';
  service_version: string;
  title: string;
  url: string;
  copyright?: string;
}

// Request Types
export interface GetMarsPhotosRequest {
  sol?: number;
  earth_date?: string;
  camera?: string;
  page?: number;
}

export interface GetApodRequest {
  date?: string;
  start_date?: string;
  end_date?: string;
  count?: number;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface MarsState extends LoadingState {
  photos: MarsPhoto[];
  selectedPhoto: MarsPhoto | null;
  currentSol: number;
  selectedCamera: string | null;
  roverInfo: RoverInfo | null;
  cameras: MarsCamera[];
  favorites: MarsPhoto[];
}

export interface ApodState extends LoadingState {
  currentApod: ApodData | null;
  apodList: ApodData[];
  searchResults: ApodData[];
  favorites: ApodData[];
}

// Component Props Types
export interface ApodCardProps {
  apod: ApodData;
  onFavorite?: (apod: ApodData) => void;
  isFavorite?: boolean;
  className?: string;
}

export interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export interface DatePickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  className?: string;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Navigation Types
export interface NavItem {
  label: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// Theme Types
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  animations: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      ease: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
  };
}

// Utility Types
export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
}

export interface SortParams {
  field: keyof ApodData;
  direction: 'asc' | 'desc';
}

export interface FilterParams {
  mediaType?: 'image' | 'video' | 'all';
  dateRange?: {
    start: string;
    end: string;
  };
  hasHdUrl?: boolean;
}

// Error Types
export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  timestamp: string;
}

// Local Storage Types
export interface StorageKeys {
  FAVORITES: 'nasa-explorer-favorites';
  THEME: 'nasa-explorer-theme';
  LAST_VIEWED: 'nasa-explorer-last-viewed';
}

// Analytics Types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: string;
}

// Performance Types
export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  apiResponseTime: number;
}

// Accessibility Types
export interface A11yProps {
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  role?: string;
  tabIndex?: number;
}
