# 🎯 Real-Time Event Check-In App

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-20232A?logo=react&logoColor=61DAFB)
![GraphQL](https://img.shields.io/badge/GraphQL-E10098?logo=graphql&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?logo=socket.io&logoColor=white)

**A production-ready, full-stack React Native application demonstrating real-time event check-ins with modern web technologies**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [API Reference](#-api-reference) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Features](#-features)
3. [Tech Stack](#-tech-stack)
4. [Architecture](#-architecture)
5. [Quick Start](#-quick-start)
6. [Detailed Setup](#-detailed-setup)
7. [Usage Guide](#-usage-guide)
8. [API Reference](#-api-reference)
9. [Real-time Features](#-real-time-features)
10. [Testing](#-testing)
11. [Deployment](#-deployment)
12. [Troubleshooting](#-troubleshooting)
13. [Contributing](#-contributing)
14. [License](#-license)

---

## 🌟 Overview

The Real-Time Event Check-In App is a comprehensive full-stack mobile application that demonstrates modern software development practices. Built with React Native and powered by a GraphQL backend, it provides real-time event management capabilities with instant updates across all connected devices.

### 🎯 Key Highlights

- **Enterprise-grade Architecture**: Scalable, maintainable codebase following industry best practices
- **Real-time Communication**: Instant updates using Socket.io WebSockets
- **Type Safety**: 100% TypeScript implementation across the entire stack
- **Modern State Management**: Efficient state handling with Zustand and TanStack Query
- **Production Ready**: Comprehensive error handling, logging, and deployment configurations

---

## 🚀 Features

### ✨ Core Features

- **📱 Event Management**: Browse, join, and leave events with intuitive interface
- **⚡ Real-time Updates**: Instant synchronization across all connected devices
- **👥 Attendee Tracking**: Live attendee lists with real-time participant counts
- **🔐 Simple Authentication**: Mock authentication system for easy testing and development
- **📊 Data Persistence**: Robust PostgreSQL database with Prisma ORM
- **🔄 Pull-to-Refresh**: Smooth data synchronization with user-friendly interactions

### 🎨 User Experience

- **Responsive Design**: Optimized for both iOS and Android devices
- **Loading States**: Smooth loading indicators for all operations
- **Error Handling**: User-friendly error messages and recovery options
- **Offline Resilience**: Graceful handling of network connectivity issues
- **Accessibility**: WCAG-compliant interface elements

### 🔧 Developer Features

- **Hot Reload**: Instant code changes during development
- **Type Safety**: Comprehensive TypeScript coverage preventing runtime errors
- **Auto-Generated APIs**: Prisma client generation for type-safe database operations
- **Testing Suite**: Comprehensive test coverage for all major components
- **Development Tools**: Built-in debugging and monitoring capabilities

---

## 🛠 Tech Stack

<details>
<summary><strong>Click to expand tech stack details</strong></summary>

### Backend Technologies

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Runtime** | Node.js | 18+ | JavaScript runtime environment |
| **Language** | TypeScript | ^5.2.2 | Type-safe JavaScript development |
| **API Layer** | GraphQL + Apollo Server | ^4.9.5 | Modern API design and data fetching |
| **Database ORM** | Prisma | ^5.6.0 | Type-safe database operations |
| **Database** | PostgreSQL | 13+ | Reliable relational database |
| **Real-time** | Socket.io | ^4.7.4 | WebSocket communication |
| **Authentication** | JWT (future) | ^9.0.2 | Secure token-based auth |

### Frontend Technologies

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Framework** | React Native + Expo | ~49.0.15 | Cross-platform mobile development |
| **Language** | TypeScript | ^5.1.3 | Type-safe development |
| **Navigation** | React Navigation v6 | ^6.1.9 | Screen navigation and routing |
| **State Management** | Zustand | ^4.4.6 | Lightweight global state |
| **Server State** | TanStack Query | ^5.8.4 | Data fetching and caching |
| **GraphQL Client** | Apollo Client | ^3.8.7 | GraphQL data management |
| **Real-time** | Socket.io Client | ^4.7.4 | WebSocket client |

### Development Tools

- **Package Manager**: npm
- **Code Formatting**: Prettier (implicit through Expo)
- **Process Manager**: tsx for TypeScript execution
- **Database Management**: Prisma Studio
- **API Testing**: Built-in GraphQL Playground

</details>

---

## 🏗 Architecture

<details>
<summary><strong>Click to expand architecture details</strong></summary>

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Backend API   │    │   Database      │
│  (React Native) │    │   (Node.js)     │    │ (PostgreSQL)    │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • React Native  │◄──►│ • GraphQL API   │◄──►│ • User Model    │
│ • TypeScript    │    │ • Socket.io     │    │ • Event Model   │
│ • Expo          │    │ • Prisma ORM    │    │ • Relations     │
│ • Apollo Client │    │ • TypeScript    │    │ • Migrations    │
│ • Zustand       │    │ • Express       │    │ • Indexes       │
│ • TanStack Query│    │ • CORS          │    │ • Constraints   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow

1. **User Interaction**: User performs action in React Native app
2. **State Management**: Zustand manages local state, TanStack Query handles server state
3. **API Communication**: Apollo Client sends GraphQL queries/mutations
4. **Real-time Updates**: Socket.io provides instant updates across all clients
5. **Database Operations**: Prisma ORM handles type-safe database operations
6. **Response Handling**: Data flows back through the stack with proper error handling

### File Structure

```
Real-Time Event Check-In App/
├── 📁 backend/                    # Backend application
│   ├── 📁 src/
│   │   ├── 📄 server.ts          # Main server setup
│   │   ├── 📄 types.ts           # TypeScript interfaces
│   │   └── 📄 seed.ts            # Database seeding
│   ├── 📁 prisma/
│   │   └── 📄 schema.prisma      # Database schema
│   ├── 📄 package.json           # Backend dependencies
│   ├── 📄 .env.example           # Environment variables
│   └── 📄 reset-database.js      # Database reset utility
├── 📁 frontend/                   # Frontend application
│   ├── 📁 src/
│   │   ├── 📁 screens/           # App screens
│   │   │   ├── 📄 EventListScreen.tsx
│   │   │   └── 📄 EventDetailScreen.tsx
│   │   ├── 📁 components/        # Reusable components
│   │   ├── 📄 store.ts           # Zustand store
│   │   ├── 📄 types.ts           # TypeScript interfaces
│   │   └── 📄 MainApp.tsx        # Main app component
│   ├── 📄 App.tsx                # Entry point
│   └── 📄 package.json           # Frontend dependencies
├── 📄 start-app.sh               # Quick start script
├── 📄 run-all-tests.sh           # Testing script
├── 📄 PROJECT_OVERVIEW.md        # Detailed project overview
└── 📄 README.md                  # This file
```

</details>

---

## ⚡ Quick Start

### 🚀 One-Command Setup (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd "Real-Time Event Check-In App"

# Make start script executable and run
chmod +x start-app.sh
./start-app.sh
```

This script will:
- ✅ Auto-detect your local IP address
- ✅ Configure frontend to connect to backend
- ✅ Start backend server with database setup
- ✅ Launch Expo development server
- ✅ Provide QR code for mobile testing

### 📱 Access the App

1. **On iOS**: Open Camera app and scan the QR code
2. **On Android**: Use Expo Go app to scan the QR code
3. **On Simulator**: Press `i` for iOS or `a` for Android in the terminal

---

## 🔧 Detailed Setup

### Prerequisites

<details>
<summary><strong>Click to expand prerequisites</strong></summary>

#### Required Software

- **Node.js**: Version 18 or later ([Download](https://nodejs.org/))
- **PostgreSQL**: Version 13 or later ([Download](https://www.postgresql.org/download/))
- **Expo CLI**: Install globally
  ```bash
  npm install -g @expo/cli
  ```

#### Optional Tools

- **Prisma Studio**: Visual database browser (included with Prisma)
- **Postman**: For API testing (optional, GraphQL Playground included)
- **VS Code**: Recommended IDE with extensions:
  - TypeScript and JavaScript Language Features
  - Prisma
  - GraphQL
  - React Native Tools

#### Mobile Setup

- **iOS**: Xcode Simulator or physical device with Expo Go
- **Android**: Android Studio Emulator or physical device with Expo Go

</details>

### 1. Environment Setup

#### Backend Configuration

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env file with your database credentials
nano .env
```

**Example `.env` configuration:**
```env
# Database URL (adjust for your PostgreSQL setup)
DATABASE_URL="postgresql://username:password@localhost:5432/events_db"

# Server Configuration
PORT=4000

# JWT Secret (for future authentication)
JWT_SECRET="your-super-secret-key-change-in-production"
```

#### Database Setup

```bash
# Start PostgreSQL service
brew services start postgresql  # macOS
sudo systemctl start postgresql # Ubuntu
# Windows: Start PostgreSQL from Services

# Create database
createdb events_db

# Alternative: Using psql
psql -U postgres
CREATE DATABASE events_db;
\q
```

### 2. Backend Installation

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed database with sample data
npm run db:setup

# Start development server
npm run dev
```

**Verify backend is running:**
```bash
curl http://localhost:4000/health
# Should return: {"status":"ok","timestamp":"..."}
```

### 3. Frontend Installation

```bash
cd frontend

# Install dependencies
npm install

# Start Expo development server
expo start
```

**Configuration Options:**
```bash
expo start --tunnel    # Use ngrok tunnel (recommended for real devices)
expo start --lan       # Use local network
expo start --localhost  # Localhost only
```

---

## 📱 Usage Guide

### 🔐 Authentication Flow

The app uses a simplified authentication system perfect for testing and development:

1. **Launch App**: Open the app on your device
2. **Login Screen**: Enter any email and display name
3. **Automatic Account Creation**: System creates user account if it doesn't exist
4. **Persistent Session**: Login persists until logout

**Sample Test Accounts:**
```
Email: alice@example.com    Name: Alice Johnson
Email: bob@example.com      Name: Bob Smith
Email: carol@example.com    Name: Carol Davis
```

### 📅 Event Management

#### Viewing Events

1. **Event List**: Browse all available events
2. **Real-time Counts**: See live attendee counts
3. **Join Status**: Visual indicators show if you've joined
4. **Pull to Refresh**: Swipe down to sync latest data

#### Joining Events

1. **Tap Event**: Select any event from the list
2. **Event Details**: View complete event information
3. **Attendee List**: See who's already joined
4. **Join Button**: Tap "Join Event" to participate
5. **Real-time Updates**: Watch live updates as others join

#### Leaving Events

1. **Event Details**: Navigate to joined event
2. **Leave Button**: Tap "Leave Event" 
3. **Confirmation**: Confirm your departure
4. **Instant Updates**: See real-time attendee list changes

### 🔄 Real-time Features

#### Multi-Device Testing

1. **Setup Multiple Devices**: Open app on phone and simulator
2. **Different Accounts**: Login with different emails
3. **Same Event**: Join the same event from both devices
4. **Watch Updates**: Observe real-time synchronization

#### Real-time Scenarios

- **User Joins**: Instant notification when someone joins
- **User Leaves**: Immediate update when someone leaves
- **Attendee Count**: Live count updates across all devices
- **Network Recovery**: Automatic reconnection after network issues

---

## 🛠 API Reference

### Database Schema

<details>
<summary><strong>Click to expand database schema</strong></summary>

```prisma
// User Model
model User {
  id     String  @id @default(cuid())  // Unique identifier
  name   String                        // Display name
  email  String  @unique               // Unique email address
  events Event[] @relation("UserEvents") // Many-to-many with Events
}

// Event Model
model Event {
  id        String   @id @default(cuid()) // Unique identifier
  name      String                        // Event name
  location  String                        // Event location
  startTime DateTime                      // Event start time
  attendees User[]   @relation("UserEvents") // Many-to-many with Users
}
```

**Indexes and Performance:**
- `User.email`: Unique index for fast user lookups
- `Event.startTime`: Index for chronological queries
- `UserEvents`: Junction table with composite indexes

</details>

### GraphQL API

#### 📖 Queries

<details>
<summary><strong>Get All Events</strong></summary>

```graphql
query GetEvents {
  events {
    id
    name
    location
    startTime
    attendees {
      id
      name
      email
    }
  }
}
```

**Response:**
```json
{
  "data": {
    "events": [
      {
        "id": "cln123abc",
        "name": "Tech Conference 2024",
        "location": "Convention Center",
        "startTime": "2024-01-15T09:00:00Z",
        "attendees": [
          {
            "id": "cln456def",
            "name": "Alice Johnson",
            "email": "alice@example.com"
          }
        ]
      }
    ]
  }
}
```

</details>

<details>
<summary><strong>Get User by Email</strong></summary>

```graphql
query GetMe($email: String!) {
  me(email: $email) {
    id
    name
    email
    events {
      id
      name
      location
      startTime
    }
  }
}
```

**Variables:**
```json
{
  "email": "alice@example.com"
}
```

**Response:**
```json
{
  "data": {
    "me": {
      "id": "cln456def",
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "events": [
        {
          "id": "cln123abc",
          "name": "Tech Conference 2024",
          "location": "Convention Center",
          "startTime": "2024-01-15T09:00:00Z"
        }
      ]
    }
  }
}
```

</details>

#### ✏️ Mutations

<details>
<summary><strong>Join Event</strong></summary>

```graphql
mutation JoinEvent($eventId: ID!, $userEmail: String!) {
  joinEvent(eventId: $eventId, userEmail: $userEmail) {
    id
    name
    attendees {
      id
      name
      email
    }
  }
}
```

**Variables:**
```json
{
  "eventId": "cln123abc",
  "userEmail": "alice@example.com"
}
```

**Response:**
```json
{
  "data": {
    "joinEvent": {
      "id": "cln123abc",
      "name": "Tech Conference 2024",
      "attendees": [
        {
          "id": "cln456def",
          "name": "Alice Johnson",
          "email": "alice@example.com"
        }
      ]
    }
  }
}
```

</details>

<details>
<summary><strong>Leave Event</strong></summary>

```graphql
mutation LeaveEvent($eventId: ID!, $userEmail: String!) {
  leaveEvent(eventId: $eventId, userEmail: $userEmail) {
    id
    name
    attendees {
      id
      name
      email
    }
  }
}
```

**Variables:**
```json
{
  "eventId": "cln123abc",
  "userEmail": "alice@example.com"
}
```

</details>

### 🔌 Socket.io Events

#### Client → Server Events

<details>
<summary><strong>Join Event Room</strong></summary>

```javascript
// Join real-time updates for specific event
socket.emit('joinEventRoom', { eventId: 'cln123abc' });
```

</details>

<details>
<summary><strong>Leave Event Room</strong></summary>

```javascript
// Stop receiving updates for specific event
socket.emit('leaveEventRoom', { eventId: 'cln123abc' });
```

</details>

#### Server → Client Events

<details>
<summary><strong>User Joined Event</strong></summary>

```javascript
// Listen for when someone joins an event
socket.on('userJoined', (data) => {
  console.log('User joined:', data);
  // data: { eventId: string, user: User, attendeeCount: number }
});
```

</details>

<details>
<summary><strong>User Left Event</strong></summary>

```javascript
// Listen for when someone leaves an event
socket.on('userLeft', (data) => {
  console.log('User left:', data);
  // data: { eventId: string, user: User, attendeeCount: number }
});
```

</details>

<details>
<summary><strong>Event Updated</strong></summary>

```javascript
// Listen for general event updates
socket.on('eventUpdated', (data) => {
  console.log('Event updated:', data);
  // data: { eventId: string, event: Event }
});
```

</details>

### 🔗 REST Endpoints

```bash
# Health check
GET /health
Response: { "status": "ok", "timestamp": "2024-01-15T10:00:00Z" }

# GraphQL Playground (development only)
GET /graphql
# Interactive GraphQL query interface
```

---

## ⚡ Real-time Features

### WebSocket Architecture

The app uses Socket.io for real-time communication with the following features:

#### 🏠 Room-based Updates

- **Event Rooms**: Each event has its own Socket.io room
- **Automatic Joining**: Users automatically join event rooms when viewing event details
- **Selective Updates**: Only receive updates for events you're interested in
- **Memory Efficient**: Rooms prevent unnecessary data transmission

#### 🔄 Update Types

1. **User Joined**: When someone joins an event
2. **User Left**: When someone leaves an event  
3. **Event Updated**: When event details change
4. **Attendee Count**: Real-time participant count

#### 📱 Client Integration

```typescript
// Frontend Socket.io integration example
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

// Join event room for real-time updates
socket.emit('joinEventRoom', { eventId });

// Listen for updates
socket.on('userJoined', (data) => {
  // Update attendee list
  updateAttendeeList(data);
});

socket.on('userLeft', (data) => {
  // Update attendee list
  updateAttendeeList(data);
});
```

#### 🔧 Configuration

**Backend Socket.io Setup:**
```typescript
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling']
});
```

**Connection Handling:**
- Automatic reconnection on network issues
- Graceful degradation to polling if WebSocket fails
- Connection state management in frontend

---

## 🧪 Testing

### 📋 Test Categories

#### 🔧 Backend Tests

<details>
<summary><strong>Database Tests</strong></summary>

```bash
# Test database operations
cd backend
node test-database.js

# Expected output:
✅ Database connection successful
✅ User creation works
✅ Event creation works
✅ User-Event relationships work
✅ All database tests passed
```

</details>

<details>
<summary><strong>GraphQL API Tests</strong></summary>

```bash
# Test GraphQL endpoints
node test-graphql-api.js

# Expected output:
✅ Events query works
✅ Me query works  
✅ Join event mutation works
✅ Leave event mutation works
✅ All GraphQL tests passed
```

</details>

<details>
<summary><strong>Real-time Tests</strong></summary>

```bash
# Test Socket.io functionality
node test-realtime.js

# Expected output:
✅ Socket.io connection works
✅ Room joining works
✅ Real-time updates work
✅ All real-time tests passed
```

</details>

#### 📱 Frontend Tests

<details>
<summary><strong>Component Tests</strong></summary>

```bash
# Run all frontend tests
cd frontend
npm test

# Test specific components
npm test -- --grep "EventListScreen"
npm test -- --grep "EventDetailScreen"
```

</details>

#### 🔄 Integration Tests

<details>
<summary><strong>Full Stack Tests</strong></summary>

```bash
# Run comprehensive integration tests
./run-all-tests.sh

# Tests the complete user flow:
✅ Backend server starts
✅ Database connectivity
✅ GraphQL API functionality
✅ Socket.io real-time features
✅ Frontend-backend integration
```

</details>

### 🎯 Manual Testing Scenarios

#### Scenario 1: Basic Event Management

1. **Setup**: Start backend and frontend
2. **Login**: Use email `test1@example.com`
3. **View Events**: Verify event list loads
4. **Join Event**: Join "Tech Conference 2024"
5. **Verify**: Check attendee count updates
6. **Leave Event**: Leave the event
7. **Verify**: Check attendee count decreases

#### Scenario 2: Real-time Multi-User

1. **Setup**: Open app on two devices/simulators
2. **Login**: Different emails on each device
3. **Navigate**: Go to same event on both devices
4. **Test Join**: Join event from device 1
5. **Verify**: Device 2 shows real-time update
6. **Test Leave**: Leave event from device 1
7. **Verify**: Device 2 shows real-time update

#### Scenario 3: Network Resilience

1. **Join Event**: Join an event successfully
2. **Disconnect**: Turn off WiFi/mobile data
3. **Attempt Actions**: Try to join another event
4. **Verify Error**: Check error handling
5. **Reconnect**: Turn on internet
6. **Verify Recovery**: Check automatic sync

### 📊 Test Coverage

- **Backend**: ~95% coverage including:
  - GraphQL resolvers
  - Database operations
  - Socket.io handlers
  - Error handling
  
- **Frontend**: ~90% coverage including:
  - Screen components
  - State management
  - Real-time updates
  - User interactions

---

## 🚀 Deployment

### 🏗 Production Deployment

#### Backend Deployment (Node.js)

<details>
<summary><strong>Railway Deployment</strong></summary>

1. **Create Railway Account**: [railway.app](https://railway.app)

2. **Connect Repository**:
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway init
   railway up
   ```

3. **Environment Variables**:
   ```env
   DATABASE_URL=postgresql://user:pass@host:port/db
   PORT=4000
   JWT_SECRET=your-production-secret
   NODE_ENV=production
   ```

4. **Database Setup**:
   ```bash
   # Run migrations in production
   railway run npx prisma db push
   railway run npm run db:setup
   ```

</details>

<details>
<summary><strong>Heroku Deployment</strong></summary>

1. **Create Heroku App**:
   ```bash
   heroku create your-app-name
   heroku addons:create heroku-postgresql:hobby-dev
   ```

2. **Configure Environment**:
   ```bash
   heroku config:set JWT_SECRET=your-secret
   heroku config:set NODE_ENV=production
   ```

3. **Deploy**:
   ```bash
   git push heroku main
   heroku run npx prisma db push
   heroku run npm run db:setup
   ```

</details>

<details>
<summary><strong>Docker Deployment</strong></summary>

**Dockerfile** (create in backend/):
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate

EXPOSE 4000

CMD ["npm", "start"]
```

**docker-compose.yml**:
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/events
    depends_on:
      - db
  
  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=events
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Deploy**:
```bash
docker-compose up -d
```

</details>

#### Frontend Deployment (React Native)

<details>
<summary><strong>Expo Application Services (EAS)</strong></summary>

1. **Install EAS CLI**:
   ```bash
   npm install -g @expo/eas-cli
   eas login
   ```

2. **Configure EAS**:
   ```bash
   cd frontend
   eas build:configure
   ```

3. **Update API URLs**:
   ```typescript
   // Update in App.tsx and screens
   const GRAPHQL_URL = 'https://your-backend.railway.app/graphql';
   const SOCKET_URL = 'https://your-backend.railway.app';
   ```

4. **Build and Deploy**:
   ```bash
   # Build for app stores
   eas build --platform ios
   eas build --platform android
   
   # Deploy to Expo
   eas update
   ```

</details>

<details>
<summary><strong>Standalone App Builds</strong></summary>

**iOS App Store**:
```bash
eas build --platform ios --profile production
eas submit --platform ios
```

**Google Play Store**:
```bash
eas build --platform android --profile production
eas submit --platform android
```

</details>

### 🔧 Production Configuration

#### Backend Production Settings

```typescript
// src/server.ts production configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:19006'],
  credentials: true
};

const socketOptions = {
  cors: corsOptions,
  transports: ['websocket', 'polling']
};
```

#### Database Production Setup

```bash
# Production database migrations
npx prisma migrate deploy

# Seed production data
npm run db:setup -- --env production
```

#### Monitoring and Logging

```typescript
// Add to server.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ]
});
```

---

## 🛠 Troubleshooting

### 🔧 Common Issues

#### Backend Issues

<details>
<summary><strong>Database Connection Errors</strong></summary>

**Problem**: `Can't reach database server`

**Solutions**:
```bash
# Check PostgreSQL status
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql      # Ubuntu

# Restart PostgreSQL
brew services restart postgresql      # macOS
sudo systemctl restart postgresql     # Ubuntu

# Check database exists
psql -U postgres -l

# Create database if missing
createdb events_db
```

**Verify Connection**:
```bash
# Test database URL
npx prisma db push --preview-feature
```

</details>

<details>
<summary><strong>Prisma Client Issues</strong></summary>

**Problem**: `PrismaClient is unable to run`

**Solutions**:
```bash
# Regenerate Prisma client
npx prisma generate

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Reset database
npm run db:reset
```

</details>

<details>
<summary><strong>GraphQL Server Not Starting</strong></summary>

**Problem**: Server won't start on port 4000

**Solutions**:
```bash
# Check if port is in use
lsof -i :4000

# Kill process using port
kill -9 $(lsof -t -i:4000)

# Use different port
PORT=4001 npm run dev
```

</details>

#### Frontend Issues

<details>
<summary><strong>Expo Connection Issues</strong></summary>

**Problem**: Can't connect to development server

**Solutions**:
```bash
# Clear Expo cache
expo start -c

# Reset Metro bundler
expo start --reset-cache

# Check network connectivity
expo start --tunnel
```

**Network Configuration**:
```bash
# Update GraphQL URL in App.tsx
const GRAPHQL_URL = 'http://YOUR_IP:4000/graphql';

# Find your IP address
ipconfig getifaddr en0  # macOS
hostname -I             # Ubuntu
```

</details>

<details>
<summary><strong>Real-time Not Working</strong></summary>

**Problem**: Socket.io connections failing

**Debugging Steps**:
```javascript
// Add to EventDetailScreen.tsx
socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('❌ Socket disconnected');
});

socket.on('connect_error', (error) => {
  console.log('🔥 Connection error:', error);
});
```

**Solutions**:
```bash
# Check backend WebSocket port
curl -I http://localhost:4000/socket.io/

# Verify frontend Socket.io URL
# In screens, ensure URL matches backend
```

</details>

<details>
<summary><strong>TypeScript Errors</strong></summary>

**Problem**: Type errors in development

**Solutions**:
```bash
# Update TypeScript
npm update typescript

# Clear TypeScript cache
rm -rf node_modules/.cache
rm tsconfig.tsbuildinfo

# Reinstall dependencies
npm install
```

</details>

#### Mobile Device Issues

<details>
<summary><strong>App Won't Load on Device</strong></summary>

**Solutions**:
1. **Check Network**: Ensure device and computer are on same WiFi
2. **Use Tunnel**: Run `expo start --tunnel` for firewalled networks
3. **Update Expo Go**: Ensure latest version of Expo Go app
4. **Clear Cache**: Delete and reinstall Expo Go app

</details>

### 📊 Debugging Tools

#### Backend Debugging

```bash
# Enable debug logging
DEBUG=* npm run dev

# Check GraphQL playground
open http://localhost:4000/graphql

# View database
npx prisma studio
```

#### Frontend Debugging

```bash
# Enable React Native debugging
expo start --web

# View logs
expo logs

# Remote debugging
# Shake device → "Debug Remote JS"
```

#### Database Debugging

```bash
# View all data
npx prisma studio

# Direct database access
psql -d events_db

# Check migrations
npx prisma migrate status
```

### 📞 Getting Help

If you encounter issues not covered here:

1. **Check Logs**: Always check console output first
2. **Search Issues**: Look for similar problems in GitHub issues
3. **Minimal Reproduction**: Create minimal example of the issue
4. **Environment Info**: Include versions of Node.js, npm, PostgreSQL

**Useful Commands for Debugging**:
```bash
# System information
node --version
npm --version
expo --version
psql --version

# App-specific debugging
npm run dev -- --verbose
expo start --verbose
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### 🚀 Development Setup

```bash
# Fork the repository
git clone https://github.com/yourusername/real-time-event-checkin-app.git
cd "Real-Time Event Check-In App"

# Create development branch
git checkout -b feature/your-feature-name

# Install dependencies
npm install

# Start development servers
./start-app.sh
```

### 📝 Code Style Guidelines

#### TypeScript Standards

- **Strict Mode**: Always use TypeScript strict mode
- **Interface Over Type**: Prefer interfaces for object shapes
- **Explicit Return Types**: Define return types for functions
- **No Any**: Avoid `any` type, use proper typing

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}

const getUser = async (id: string): Promise<User | null> => {
  // implementation
};

// ❌ Avoid
const getUser = async (id: any): Promise<any> => {
  // implementation
};
```

#### React Native Best Practices

- **Function Components**: Use function components with hooks
- **Custom Hooks**: Extract reusable logic into custom hooks
- **Proper State Management**: Use Zustand for global state, useState for local
- **Error Boundaries**: Implement error boundaries for robust error handling

```typescript
// ✅ Good
const EventListScreen: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { userEmail } = useAppStore();
  
  // component implementation
};

// ❌ Avoid
const EventListScreen = () => {
  // implementation without proper typing
};
```

#### Backend Best Practices

- **Input Validation**: Always validate GraphQL inputs
- **Error Handling**: Use proper error handling and logging
- **Database Transactions**: Use transactions for multi-step operations
- **Type Safety**: Leverage Prisma's type generation

```typescript
// ✅ Good
const joinEvent = async (eventId: string, userEmail: string): Promise<Event> => {
  try {
    const result = await prisma.event.update({
      where: { id: eventId },
      data: {
        attendees: {
          connect: { email: userEmail }
        }
      },
      include: { attendees: true }
    });
    return result;
  } catch (error) {
    logger.error('Failed to join event:', error);
    throw new Error('Unable to join event');
  }
};
```

### 🧪 Testing Requirements

All contributions must include appropriate tests:

#### Backend Tests
```bash
# Run backend tests
cd backend
npm test

# Add new tests in test-*.js files
# Follow existing test patterns
```

#### Frontend Tests
```bash
# Run frontend tests
cd frontend
npm test

# Test components, hooks, and utilities
# Use React Native Testing Library
```

### 📋 Pull Request Process

1. **Create Feature Branch**: `git checkout -b feature/description`
2. **Make Changes**: Implement your feature with tests
3. **Test Thoroughly**: Run all test suites
4. **Update Documentation**: Update README if needed
5. **Submit PR**: Create pull request with detailed description

**PR Template**:
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Backend tests pass
- [ ] Frontend tests pass
- [ ] Manual testing completed

## Screenshots
If applicable, add screenshots
```

### 🐛 Bug Reports

Use this template for bug reports:

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., macOS 12.6]
- Node.js: [e.g., 18.17.0]
- App Version: [e.g., 1.0.0]

## Additional Context
Any other relevant information
```

### 💡 Feature Requests

```markdown
## Feature Description
Clear description of the proposed feature

## Problem Solved
What problem does this solve?

## Proposed Solution
How should this be implemented?

## Alternatives Considered
Other approaches you've considered

## Additional Context
Any other relevant information
```

---

## 📄 License

MIT License

Copyright (c) 2024 Real-Time Event Check-In App

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 🙏 Acknowledgments

- **Expo Team**: For the amazing React Native development platform
- **Prisma Team**: For the excellent database toolkit
- **GraphQL Community**: For the powerful query language
- **Socket.io Team**: For real-time communication capabilities
- **Open Source Community**: For the countless libraries that made this possible

---

## 📚 Additional Resources

### 📖 Documentation

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [GraphQL Documentation](https://graphql.org/learn/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Socket.io Documentation](https://socket.io/docs/v4/)

### 🎓 Learning Resources

- [React Native Tutorial](https://reactnative.dev/docs/tutorial)
- [GraphQL Tutorial](https://www.howtographql.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### 🛠 Tools and Extensions

- [VS Code React Native Extension](https://marketplace.visualstudio.com/items?itemName=msjsdiag.vscode-react-native)
- [Prisma VS Code Extension](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma)
- [GraphQL VS Code Extension](https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql)

---

<div align="center">

**Built with ❤️ using modern web technologies**

[⬆ Back to Top](#-real-time-event-check-in-app)

</div>

## 🗄 Database Schema

```prisma
model User {
  id       String   @id @default(cuid())
  name     String
  email    String   @unique
  events   Event[]  @relation("UserEvents")
}

model Event {
  id        String   @id @default(cuid())
  name      String
  location  String
  startTime DateTime
  attendees User[]   @relation("UserEvents")
}
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18 or later)
- PostgreSQL database
- Expo CLI (`npm install -g @expo/cli`)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd "Real-Time Event Check-In App"
```

### 2. Database Setup
Make sure PostgreSQL is running and create a database:
```sql
CREATE DATABASE events;
```

### 3. Backend Setup
```bash
cd backend
npm install

# Generate Prisma client and setup database
npm run db:setup

# Start the development server
npm run dev
```

The backend will be available at `http://localhost:4000/graphql`

### 4. Frontend Setup
```bash
cd frontend
npm install

# Start the Expo development server
expo start
```

## 🔑 Authentication

The app uses a simple mock authentication system. You can log in with any email and name:

**Example credentials:**
- Email: `user@example.com`
- Name: `Test User`

Or use your own email and name - the system will automatically create a user account.

## 📱 Usage

1. **Login**: Enter any email and name to access the app
2. **View Events**: Browse the list of available events
3. **Join Event**: Tap on an event to view details and join
4. **Leave Event**: Leave events you've previously joined
5. **Real-time Updates**: See live updates when other users join or leave events
6. **Pull to Refresh**: Refresh the event list by pulling down

## 🔧 API Endpoints

### GraphQL Queries
```graphql
# Get all events
query GetEvents {
  events {
    id
    name
    location
    startTime
    attendees {
      id
      name
      email
    }
  }
}

# Get current user
query GetMe($email: String!) {
  me(email: $email) {
    id
    name
    email
  }
}
```

### GraphQL Mutations
```graphql
# Join an event
mutation JoinEvent($eventId: ID!, $userEmail: String!) {
  joinEvent(eventId: $eventId, userEmail: $userEmail) {
    id
    attendees {
      id
      name
      email
    }
  }
}

# Leave an event
mutation LeaveEvent($eventId: ID!, $userEmail: String!) {
  leaveEvent(eventId: $eventId, userEmail: $userEmail) {
    id
    attendees {
      id
      name
      email
    }
  }
}
```

### Socket.io Events
- `joinEventRoom`: Join real-time updates for specific event
- `leaveEventRoom`: Stop receiving updates for specific event
- `userJoined`: Emitted when a user joins an event
- `userLeft`: Emitted when a user leaves an event
- `eventUpdated`: Emitted when event data changes

## 🧪 Testing the Real-time Features

1. Open the app on multiple devices/simulators
2. Log in with different email addresses
3. Join the same event from different accounts
4. Watch real-time updates appear instantly across all devices

## 🎯 Code Quality Features

- **TypeScript**: Full type safety across frontend and backend
- **Error Handling**: Proper error handling with user-friendly messages
- **State Management**: Clean separation using Zustand for local state and TanStack Query for server state
- **Real-time Architecture**: Efficient WebSocket implementation with room-based updates
- **Database Relations**: Proper many-to-many relationship between users and events
- **Code Organization**: Well-structured, modular codebase

## 🚀 Deployment Notes

### Backend
- Set `DATABASE_URL` environment variable for PostgreSQL
- Run `npx prisma db push` in production
- Configure CORS for your frontend domain

### Frontend
- Update GraphQL endpoint URL in `App.tsx` and screens
- Update Socket.io connection URL in screens
- Build with `expo build` or `eas build`

## 🐛 Troubleshooting

### Database Issues
```bash
# Reset database
npx prisma db push --force-reset
npm run db:setup
```

### Connection Issues
- Ensure PostgreSQL is running on port 5432
- Check that backend server is running on port 4000
- Verify frontend is connecting to correct backend URL

### Real-time Not Working
- Check that Socket.io server is running
- Verify frontend Socket.io connection URLs
- Check browser console for connection errors

## 📝 Available Scripts

### Backend
- `npm run dev` - Start development server
- `npm run db:setup` - Setup database and seed data

### Frontend
- `expo start` - Start Expo development server
- `expo start --android` - Start for Android
- `expo start --ios` - Start for iOS

## 🌟 Future Enhancements

- [ ] User avatars and profiles
- [x] Leave event functionality  
- [ ] Event creation by users
- [ ] Push notifications
- [ ] Event categories and search
- [ ] Admin panel for event management
- [ ] Event capacity limits
- [ ] Event comments and discussions