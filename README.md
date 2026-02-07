# Modern Colours Supply Chain Platform

Enterprise-grade Supply Chain Optimization Platform (Monorepo).

## Structure
- **frontend/**: React applications (Admin, Dealer, Buyer)
- **backend/**: Node.js (Express) and Python (FastAPI) microservices
- **shared/**: Shared types and utilities
- **infrastructure/**: Docker and deployment configs

## Prerequisite
- Node.js 18+
- Docker & Docker Compose
- Python 3.10+ (for ML services)

## Rapid Start
1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Setup Infrastructure**:
   ```bash
   docker-compose up -d
   ```
3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   This will start the API Gateway and Admin Dashboard concurrently (configured in root package.json).

## Services
- **Admin Dashboard**: http://localhost:5173
- **API Gateway**: http://localhost:3000
# hackTU
