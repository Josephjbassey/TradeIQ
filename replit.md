# Overview

TradeIQ is an AI-powered trading journal application built with React, Express, and TypeScript. The platform helps traders track their trades, analyze performance, and receive AI-generated insights to improve their trading strategies. The application features a comprehensive dashboard, trade management, portfolio analytics, risk assessment tools, and educational resources.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side uses **React with TypeScript** and follows a component-based architecture:
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for client-side routing
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

## Backend Architecture
The server uses **Express.js with TypeScript**:
- **API Design**: RESTful endpoints with structured error handling
- **Database Layer**: Drizzle ORM with PostgreSQL schema definitions
- **Storage Abstraction**: Interface-based storage layer with in-memory implementation for development
- **Validation**: Zod schemas shared between client and server
- **Middleware**: Custom logging, JSON parsing, and error handling

## Database Design
**PostgreSQL** with Drizzle ORM:
- **trades**: Core trading data with P&L tracking
- **aiAnalyses**: AI-generated insights and recommendations
- **portfolioSnapshots**: Historical performance metrics
- **Schema Management**: Migrations handled through Drizzle Kit

## AI Integration
**OpenAI GPT-4o** integration for trading analysis:
- **Trade Analysis**: Individual trade performance evaluation
- **Portfolio Analysis**: Overall trading pattern recognition
- **Educational Content**: Personalized trading tips and insights
- **Risk Assessment**: Automated risk evaluation and alerts

## Development Features
- **Development Tools**: Replit-specific plugins for enhanced development experience
- **Hot Reload**: Vite HMR for fast development cycles
- **Error Overlay**: Runtime error modal for debugging
- **TypeScript**: Full type safety across the entire stack

# External Dependencies

## Core Technologies
- **@neondatabase/serverless**: PostgreSQL serverless driver for database connectivity
- **OpenAI API**: GPT-4o model for AI-powered trading analysis and insights
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect

## UI/UX Libraries
- **Radix UI**: Comprehensive component library for accessible UI primitives
- **shadcn/ui**: Pre-built component collection based on Radix UI
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Recharts**: Chart library for performance visualizations

## Development and Build Tools
- **Vite**: Frontend build tool and development server
- **ESBuild**: Fast JavaScript bundler for server-side code
- **TanStack Query**: Data fetching and caching solution
- **React Hook Form**: Form state management with validation
- **Zod**: Runtime type validation for forms and API endpoints

## Fonts and Assets
- **Google Fonts**: Inter, Geist Mono, Architects Daughter, DM Sans, and Fira Code
- **Lucide React**: Icon library for consistent iconography