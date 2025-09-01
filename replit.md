# Overview

This is a Star Wars Aurebesh translator web application built with React and Express. The application allows users to translate between English and Aurebesh (the fictional script from Star Wars), featuring an interactive keyboard, translation history, saved phrases, and educational games like flashcards and word search. The app includes multiple Star Wars-themed UI themes and provides OCR functionality for image-based translation.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite for development and building
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **State Management**: React Query (TanStack Query) for server state management and React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom CSS variables for theming, VT323 font for Star Wars aesthetic
- **Component Architecture**: Modular component structure with reusable UI components, custom hooks for business logic

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Storage Interface**: Abstract storage interface with in-memory implementation (designed for easy database integration)
- **Validation**: Zod schemas for request/response validation
- **File Handling**: Multer for image upload processing
- **Development**: Hot module replacement via Vite integration

## Data Storage Solutions
- **Current Implementation**: In-memory storage with Map-based data structures
- **Database Ready**: Drizzle ORM configured for PostgreSQL with Neon Database serverless connection
- **Schema Design**: Separate entities for history entries, saved phrases, game progress, and user settings
- **Migration Support**: Drizzle Kit configured for database schema migrations

## Authentication and Authorization
- **Current State**: No authentication implemented
- **Session Preparation**: Express session middleware configured (connect-pg-simple) for future user sessions
- **Architecture**: Designed for easy addition of user authentication with session-based approach

## Key Features
- **Translation Engine**: Custom Aurebesh ligature mapping with bidirectional English-Aurebesh conversion
- **Interactive Keyboard**: Virtual Aurebesh keyboard with ligature support
- **Theme System**: Five Star Wars-themed UI variants (Rebel, Imperial, Light Side, Dark Side, Bounty Hunter)
- **Educational Games**: Flashcards with tier-based progression and word search puzzle generation
- **Storage Features**: Translation history, saved phrases, and persistent game progress
- **OCR Integration**: Image upload with OCR processing endpoint (implementation pending)
- **Audio Feedback**: Sound effects for game interactions
- **Responsive Design**: Mobile-optimized interface with touch-friendly interactions

# External Dependencies

## Database
- **Neon Database**: Serverless PostgreSQL database
- **Drizzle ORM**: Database toolkit and query builder
- **Connection**: @neondatabase/serverless for database connectivity

## UI and Styling
- **Radix UI**: Headless UI components (@radix-ui/react-* packages)
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Icon library for UI elements
- **Google Fonts**: VT323 and other fonts for theming

## Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type system and compiler
- **ESBuild**: JavaScript bundler for production builds
- **PostCSS**: CSS processing with Autoprefixer

## Runtime Libraries
- **React Query**: Server state management and caching
- **React Hook Form**: Form handling with validation
- **Wouter**: Lightweight routing library
- **Date-fns**: Date utility library
- **Class Variance Authority**: Utility for conditional CSS classes
- **CLSX**: Conditional className utility

## Future Integrations
- **OCR Service**: Planned integration for image-to-text conversion
- **Audio API**: Web Audio API for enhanced sound effects
- **File Storage**: Potential cloud storage for user-uploaded images