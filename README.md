# Task Board - Kanban Application

A modern, real-time kanban board application built with Next.js, Supabase, and TypeScript.

## Features

- 🎯 Drag and drop cards between lists
- 🔄 Real-time synchronization across users
- 👥 Team collaboration with member management
- 🏷️ Labels and due dates for cards
- 📱 Mobile-responsive design
- 🔐 Secure authentication with Supabase
- ⚡ Optimistic UI updates for instant feedback

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Express.js, WebSocket, Supabase
- **Database**: PostgreSQL (via Supabase)
- **State Management**: Zustand
- **Drag & Drop**: @hello-pangea/dnd
- **Authentication**: Supabase Auth

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd doitnow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project at https://supabase.com
   - Run the database migrations from `src/backend/db/schema.sql`
   - Copy your Supabase URL and keys

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend API on http://localhost:4000
   - Frontend on http://localhost:3000

## Project Structure

```
doitnow/
├── src/
│   ├── backend/         # Express.js API server
│   │   ├── api/        # API endpoints
│   │   ├── db/         # Database schema
│   │   ├── lib/        # WebSocket & Supabase setup
│   │   └── routes/     # Route handlers
│   ├── frontend/       # Next.js application
│   │   ├── app/        # App router pages
│   │   ├── components/ # React components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── stores/     # Zustand stores
│   │   └── styles/     # Global styles
│   └── shared/         # Shared types & utilities
├── docs/               # Specification documents
└── scripts/           # Build scripts
```

## Development

### Database Migrations

To run database migrations:
```bash
# Connect to your Supabase database
psql [your-database-url] -f src/backend/db/schema.sql
```

### Running Tests

```bash
npm run test        # Run all tests
npm run test:unit   # Run unit tests
npm run test:e2e    # Run end-to-end tests
```

### Building for Production

```bash
npm run build
npm run start
```

## Architecture Decisions

- **Monorepo Structure**: Frontend and backend in a single repository for easier development
- **Real-time Updates**: WebSocket for instant synchronization across clients
- **Optimistic UI**: Updates appear immediately while syncing with server
- **Type Safety**: Full TypeScript coverage with shared types
- **Component-based**: Modular React components following design system
- **Mobile-first**: Responsive design that works on all devices

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.