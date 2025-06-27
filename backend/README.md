# NASA Space Explorer - Backend

A clean architecture Node.js/Express.js backend for the NASA Space Explorer application, featuring TypeScript, MongoDB integration, and comprehensive NASA API integration.

## 🏗️ Architecture

This backend follows **Clean Architecture** principles with clear separation of concerns:

```
src/
├── controllers/     # Presentation Layer - HTTP request/response handling
├── services/        # Business Logic Layer - Core application logic
├── repositories/    # Data Access Layer - Database operations
├── models/          # Data Models - Database schemas and validation
├── middleware/      # Cross-cutting concerns - Error handling, logging
├── routes/          # Route definitions and API endpoints
├── config/          # Configuration management
├── types/           # TypeScript type definitions
└── utils/           # Utility functions and helpers
```

## 🚀 Features

- **Clean Architecture**: Proper separation of concerns with layered architecture
- **TypeScript**: Full type safety and modern JavaScript features
- **NASA API Integration**: Comprehensive APOD (Astronomy Picture of the Day) API integration
- **MongoDB Integration**: Efficient data caching and storage with Mongoose
- **Error Handling**: Comprehensive error handling with custom error classes
- **Validation**: Input validation and data sanitization
- **Logging**: Structured logging with Morgan
- **Security**: Helmet.js security headers and CORS configuration
- **Code Quality**: ESLint and Prettier for consistent code formatting
- **Environment Configuration**: Centralized configuration management

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- NASA API Key (get from [NASA API Portal](https://api.nasa.gov/))

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=3001
   NODE_ENV=development
   NASA_API_KEY=your_nasa_api_key_here
   MONGODB_URI=mongodb://localhost:27017/nasa-space-explorer
   CORS_ORIGIN=http://localhost:3000
   ```

3. **Start MongoDB:**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Code Quality
```bash
# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
```

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### Health Check
```http
GET /health
```

#### APOD Endpoints

**Get APOD data with options:**
```http
GET /api/apod
GET /api/apod?date=2023-12-01
GET /api/apod?start_date=2023-12-01&end_date=2023-12-07
GET /api/apod?count=5
```

**Get APOD for specific date:**
```http
GET /api/apod/2023-12-01
```

**Get latest APOD entries:**
```http
GET /api/apod/latest?limit=10
```

**Get random APOD entries:**
```http
GET /api/apod/random?count=5
```

**Search APOD data:**
```http
GET /api/apod/search?q=mars&limit=20
```

**Get statistics:**
```http
GET /api/apod/stats
```

### Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Success message",
  "timestamp": "2023-12-01T12:00:00.000Z"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error type",
  "message": "Error description",
  "timestamp": "2023-12-01T12:00:00.000Z",
  "path": "/api/apod",
  "statusCode": 400
}
```

## 🗄️ Database Schema

### APOD Collection
```javascript
{
  date: String,           // YYYY-MM-DD format
  explanation: String,    // Description of the image/video
  hdurl: String,         // High-definition URL (optional)
  media_type: String,    // 'image' or 'video'
  service_version: String,
  title: String,         // Title of the APOD
  url: String,          // Standard URL
  copyright: String,    // Copyright information (optional)
  createdAt: Date,      // Document creation timestamp
  updatedAt: Date       // Document update timestamp
}
```

## 🔧 Configuration

The application uses a centralized configuration system located in `src/config/index.ts`. All environment variables are validated on startup.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `NASA_API_KEY` | NASA API key | `DEMO_KEY` |
| `NASA_API_BASE_URL` | NASA API base URL | `https://api.nasa.gov` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/nasa-space-explorer` |
| `CORS_ORIGIN` | CORS allowed origin | `http://localhost:3000` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `CACHE_TTL` | Cache time-to-live | `3600` |

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📦 Project Structure

```
backend/
├── src/
│   ├── controllers/         # HTTP request handlers
│   │   └── ApodController.ts
│   ├── services/           # Business logic
│   │   ├── ApodService.ts
│   │   └── NasaApiService.ts
│   ├── repositories/       # Data access layer
│   │   └── ApodRepository.ts
│   ├── models/            # Database models
│   │   └── ApodModel.ts
│   ├── middleware/        # Custom middleware
│   │   └── errorHandler.ts
│   ├── routes/           # Route definitions
│   │   ├── index.ts
│   │   └── apodRoutes.ts
│   ├── config/          # Configuration
│   │   └── index.ts
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   ├── utils/           # Utilities
│   │   └── database.ts
│   └── server.ts        # Main server file
├── dist/               # Compiled JavaScript
├── .env               # Environment variables
├── .env.example       # Environment template
├── .eslintrc.json     # ESLint configuration
├── .prettierrc        # Prettier configuration
├── tsconfig.json      # TypeScript configuration
├── package.json       # Dependencies and scripts
└── README.md         # This file
```

## 🚀 Deployment

The application is ready for deployment with:

- Docker support (add Dockerfile)
- Environment-based configuration
- Graceful shutdown handling
- Health check endpoints
- Production logging
- Security headers

## 🤝 Contributing

1. Follow the established architecture patterns
2. Write tests for new features
3. Use TypeScript for type safety
4. Follow the code style (ESLint + Prettier)
5. Update documentation for API changes

## 📄 License

MIT License - see LICENSE file for details.
