# 🚀 Mars Explorer - AI-Powered Mars Photo Explorer

A beautiful, modern web application for exploring Mars rover photographs with AI-powered features, built with React, TypeScript, and Node.js.

![Mars Explorer](https://img.shields.io/badge/Mars-Explorer-red?style=for-the-badge&logo=rocket)
![React](https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?style=for-the-badge&logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)

## ✨ Features

### 🔍 **Photo Exploration**
- Browse latest Mars rover photos
- Search by Sol (Martian day) or Earth date
- Filter by camera type (FHAZ, RHAZ, MAST, CHEMCAM, etc.)
- High-resolution image viewing with zoom

### 🤖 **AI-Powered Features**
- **Natural Language Search**: "Show me photos of rocks from last week"
- **AI Chat Assistant**: Ask questions about Mars and rover missions
- **Smart Photo Analysis**: AI-powered image analysis and descriptions
- **Intelligent Recommendations**: Personalized photo suggestions

### 📊 **Analytics & Insights**
- Interactive charts and statistics
- Photo count by camera and date
- Mission timeline visualization
- Rover activity analysis

### 💾 **Personal Features**
- Favorite photos collection
- Offline browsing capability
- Personal dashboard
- Photo comparison tools

### 🎨 **Modern UI/UX**
- Beautiful space-themed design
- Smooth animations with Framer Motion
- Responsive design for all devices
- Dark theme optimized for space imagery

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   NASA API      │
│   React + Vite  │───▶│   Node.js API   │───▶│   Mars Photos   │
│   TypeScript    │    │   Clean Arch    │    │   Rover Data    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Frontend Stack
- **React 19** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **TanStack Query** for data fetching
- **Lucide React** for icons

### Backend Stack
- **Node.js** with Express
- **TypeScript** for type safety
- **Clean Architecture** pattern
- **MongoDB** for data persistence
- **NASA API** integration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- NASA API key (free from [api.nasa.gov](https://api.nasa.gov/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mars-explorer.git
   cd mars-explorer
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your NASA API key
   npm run dev
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env.local
   # Edit .env.local with your API URL
   npm run dev
   ```

4. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 🌐 Deployment

Ready to deploy your Mars Explorer app? We've got you covered!

### 📋 Quick Deploy
```bash
./deploy.sh  # Run deployment preparation script
```

### 📖 Detailed Guides
- **[Complete Deployment Guide](DEPLOYMENT.md)** - Step-by-step instructions
- **[Deployment Checklist](DEPLOYMENT_CHECKLIST.md)** - Ensure nothing is missed

### 🎯 Recommended Platforms
- **Frontend**: [Vercel](https://vercel.com/) (free tier available)
- **Backend**: [Render](https://render.com/) (free tier available)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier available)

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Run all tests with coverage
npm run test:coverage
```

### Test Coverage
- Unit tests for all services and utilities
- Integration tests for API endpoints
- Component tests for React components

## 📁 Project Structure

```
mars-explorer/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API services
│   │   ├── hooks/           # Custom React hooks
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── dist/                # Build output
├── backend/                  # Node.js backend API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── repositories/    # Data access layer
│   │   ├── models/          # Data models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   ├── config/          # Configuration
│   │   └── utils/           # Utility functions
│   └── dist/                # Compiled JavaScript
├── docs/                     # Documentation
├── DEPLOYMENT.md            # Deployment guide
├── DEPLOYMENT_CHECKLIST.md  # Deployment checklist
└── deploy.sh                # Deployment script
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NASA** for providing the amazing Mars rover APIs
- **Mars Rover Teams** for the incredible photography
- **Open Source Community** for the fantastic tools and libraries

## 📞 Support

- 📧 Email: support@marsexplorer.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/mars-explorer/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/mars-explorer/discussions)

---

**Explore Mars like never before! 🔴🚀**

Made with ❤️ for space enthusiasts 
