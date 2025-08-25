# StyleAI - AI-Powered Fashion Marketing Platform

## Overview

StyleAI is a comprehensive AI-powered marketing platform specifically designed for direct-to-consumer (D2C) fashion brands. The application helps fashion businesses create compelling ad copy, manage campaigns, and gain insights through AI-generated recommendations. Built as a full-stack web application, it combines modern frontend technologies with a robust backend API to deliver intelligent marketing solutions.

The platform targets fashion brands ranging from luxury to sustainable to streetwear, providing specialized templates and AI-generated content that understands fashion industry nuances. Key features include campaign management, template libraries, AI-powered ad copy generation, analytics dashboards, and client communication tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite for build tooling and development server
- **Routing**: Wouter for client-side routing with pages for dashboard, campaigns, templates, analytics, clients, and onboarding
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Design System**: Custom design tokens with fashion-focused color palette (sage, navy, cream, coral, golden)

### Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful API structure with dedicated routes for users, campaigns, templates, and AI services
- **Development Setup**: TSX for TypeScript execution in development, ESBuild for production bundling
- **Storage Interface**: Abstracted storage layer with in-memory implementation for development (IStorage interface)
- **AI Integration**: OpenAI API integration for ad copy generation and campaign insights

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL support, configured for Neon Database
- **Schema Structure**: 
  - Users table with brand information and authentication
  - Campaigns table with status tracking, budget management, and platform-specific data
  - Templates table with categorization and usage tracking
  - Campaign metrics for performance tracking
  - Messages table for client communication
- **Data Validation**: Zod schemas for runtime type validation shared between frontend and backend

### Authentication & Session Management
- **Session Storage**: PostgreSQL-based session storage using connect-pg-simple
- **User Management**: Custom user system with brand-specific profile data including company name and brand type

### Development & Build Pipeline
- **Monorepo Structure**: Client, server, and shared code organization
- **TypeScript Configuration**: Unified TypeScript config with path mapping for clean imports
- **Asset Handling**: Vite-based asset pipeline with support for attached assets
- **Development Tools**: Replit-specific plugins for runtime error handling and development experience

## External Dependencies

### AI Services
- **OpenAI API**: GPT-4 integration for generating fashion-specific ad copy and campaign insights
- **API Key Management**: Environment-based configuration for OpenAI authentication

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Database Migrations**: Drizzle Kit for schema management and migrations

### UI & Design Libraries
- **Radix UI**: Comprehensive set of accessible UI primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Icon library for consistent iconography
- **Google Fonts**: Custom font loading for Inter and Source Sans Pro typography

### Development & Deployment
- **Replit Platform**: Development environment with custom plugins for error handling
- **Vite Ecosystem**: Modern build tools with React plugin and PostCSS processing
- **TypeScript**: Full-stack type safety with shared schemas

### Third-Party Integrations
- **TanStack Query**: Advanced server state management with caching and synchronization
- **React Hook Form**: Form management with resolver integration
- **Date-fns**: Date manipulation and formatting utilities
- **Class Variance Authority**: Component variant management for design system