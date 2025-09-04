# AdSensEI - AI-Powered Fashion Marketing Platform

A comprehensive AI-powered marketing platform specifically designed for direct-to-consumer (D2C) fashion brands. Create compelling ad copy, manage campaigns, and gain insights through AI-generated recommendations.

## Features

- 🎯 **AI-Generated Ad Copy**: GPT-4 powered copy generation tailored for fashion brands
- 📊 **Campaign Management**: Complete campaign lifecycle from creation to analytics
- 🎨 **Template Library**: Pre-built templates for different fashion categories
- 📈 **Analytics Dashboard**: Track campaign performance and ROI
- 📱 **Instagram Integration**: Connect and publish directly to Instagram
- 👥 **Client Management**: Organize and communicate with clients

## Tech Stack

### Frontend
- React 18 + TypeScript + Vite
- Shadcn/UI + Radix UI components
- Tailwind CSS for styling
- TanStack Query for state management
- Wouter for routing

### Backend
- Express.js + TypeScript
- Drizzle ORM + PostgreSQL (Neon)
- OpenAI API integration
- Session-based authentication

## Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd adsensei
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Fill in your environment variables
   ```

3. **Database Setup**
   ```bash
   npm run db:push
   ```

4. **Development**
   ```bash
   npm run dev
   ```

## Environment Variables

See `.env.example` for required environment variables including:
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `SESSION_SECRET` - Secret for session encryption

## Project Structure

```
adsensei/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and configurations
├── server/                 # Express backend
│   ├── lib/                # Server utilities
│   ├── routes.ts           # API route definitions
│   └── index.ts            # Server entry point
├── shared/                 # Shared types and schemas
└── migrations/             # Database migrations
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes
- `npm run test` - Run test suite
- `npm run lint` - Run linter

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.