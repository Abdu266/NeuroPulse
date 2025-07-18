# NeuroRelief - Migraine Management Application

## Overview

NeuroRelief is a comprehensive migraine management application designed to help users track episodes, monitor patterns, and manage their care with medical-grade precision. The application features real-time monitoring, smart analytics, and medical report generation capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful endpoints under `/api` prefix

### Mobile-First Design
- Responsive design optimized for mobile devices
- Bottom navigation for easy thumb navigation
- Touch-friendly interface components
- PWA-ready architecture

## Key Components

### Authentication System
- **Provider**: Replit Auth integration
- **Session Storage**: PostgreSQL-backed sessions
- **Security**: HTTP-only cookies, CSRF protection
- **User Management**: Automatic user creation/updates from OpenID claims

### Data Models
- **Users**: Profile information and preferences
- **Migraine Episodes**: Detailed episode tracking with intensity, symptoms, triggers
- **Medications**: User's medication inventory and dosing information
- **Medication Logs**: Tracking when medications are taken
- **Triggers**: Personalized trigger identification and correlation
- **Device Data**: Integration with wearable devices for real-time monitoring
- **Medical Reports**: Generated reports for healthcare providers

### Core Features
- **Real-time Monitoring**: Device integration for continuous health tracking
- **Episode Tracking**: Comprehensive migraine episode logging
- **Medication Management**: Dosing reminders and effectiveness tracking
- **Analytics**: Pattern recognition and trigger identification
- **Report Generation**: Medical-grade reports for healthcare providers

## Data Flow

### Client-Server Communication
1. **Authentication Flow**: OpenID Connect with Replit Auth
2. **API Requests**: RESTful endpoints with JSON payloads
3. **Real-time Updates**: Polling-based updates for device data
4. **Error Handling**: Centralized error handling with user-friendly messages

### Database Operations
1. **Connection**: Neon PostgreSQL with connection pooling
2. **ORM**: Drizzle ORM for type-safe database operations
3. **Migrations**: Drizzle Kit for schema management
4. **Queries**: Optimized queries with proper indexing

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Database ORM and query builder
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: Accessible UI components
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight routing library

### Authentication
- **openid-client**: OpenID Connect client implementation
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session storage

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Type checking and development
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot reload
- **Database**: Neon PostgreSQL development instance
- **Authentication**: Replit Auth development configuration

### Production Build
- **Frontend**: Vite production build to `dist/public`
- **Backend**: ESBuild bundle to `dist/index.js`
- **Static Assets**: Served by Express in production
- **Environment**: Node.js runtime with environment variables

### Configuration Management
- **Environment Variables**: Database URL, session secrets, auth configuration
- **Build Scripts**: Separate development and production commands
- **Health Checks**: Basic server health monitoring

### Security Considerations
- **HTTPS**: Required for authentication cookies
- **CORS**: Configured for secure cross-origin requests
- **Session Security**: HTTP-only cookies with secure flags
- **Input Validation**: Zod schemas for request validation
- **Error Handling**: Sanitized error messages in production