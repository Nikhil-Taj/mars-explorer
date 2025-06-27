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

export interface MarsPhotosResponse {
  photos: MarsPhoto[];
}



// Request/Response Types
export interface GetMarsPhotosRequest {
  sol?: number;
  earth_date?: string;
  camera?: string;
  page?: number;
}



// Express Request extension
declare global {
  namespace Express {
    interface Request {
      requestTime?: string;
    }
  }
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  timestamp: string;
  path?: string;
  statusCode?: number;
}

// Configuration Types
export interface AppConfig {
  port: number;
  nodeEnv: string;
  nasaApiKey: string;
  nasaApiBaseUrl: string;
  mongodbUri: string;
  corsOrigin: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  cacheTtl: number;
}
