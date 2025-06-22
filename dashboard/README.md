# Backend Management Dashboard

A modern React dashboard for managing VPS and Gateway services.

## Features

- **Dashboard Overview**: Real-time system status and metrics
- **VPS Manager**: Port forwarding management with easy add/remove/toggle functionality  
- **Gateway Manager**: Dynamic routing and DNS management
- **Network Monitor**: Network interface monitoring, service discovery, and topology visualization

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. The dashboard will be available at `http://localhost:5173`

## Configuration

The dashboard connects to the backend API at `http://localhost:3000` by default. You can change this by updating the `VITE_API_BASE_URL` environment variable in `.env`.

## Backend Integration

This dashboard is designed to work with the backend services located in the `../backend` folder. Make sure the backend services are running:

- Gateway Server: `http://localhost:3000`
- VPS Server: `http://localhost:3001`

## Tech Stack

- React 19.1.0
- Vite 6.3.5
- Recharts (for data visualization)
- Lucide React (for icons)
- Axios (for API calls)
- Socket.IO Client (for real-time features)

## Components

- `Dashboard.jsx` - Main overview with system metrics
- `VPSManager.jsx` - Port forwarding management
- `GatewayManager.jsx` - Routing and DNS management  
- `NetworkMonitor.jsx` - Network monitoring and topology

## API Integration

The dashboard uses a centralized API service (`src/services/api.js`) that provides:

- Gateway API endpoints for network, routing, and DNS management
- VPS API endpoints for port forwarding management
- Automatic error handling and token management
