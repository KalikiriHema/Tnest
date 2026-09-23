# Creative Services Marketplace (CreativeHub)

A requirement-driven creative talent platform connecting brands, startups, and clients with verified creative specialists (video editors, UGC creators, thumbnail designers, scriptwriters) with deterministic matching, dynamic scoping wizards, two-way discovery, real-time negotiation, deliverable cycles, and gated reviews.

## Architecture & Tech Stack

- **Backend**: .NET 10 / C# Modular Monolith with ASP.NET Core Web API, EF Core (SQLite / PostgreSQL), Argon2id password hashing, JWT authentication, and SignalR WebSocket real-time chat.
- **Frontend**: React + TypeScript + Vite with custom dark glassmorphic CSS design system, micro-animations, and responsive layouts.

## Project Structure

```
creative-hub/
├── backend/
│   ├── CreativeHub.sln
│   ├── src/
│   │   ├── CreativeHub.Api/             # Controllers, SignalR Hubs, API Configuration
│   │   ├── CreativeHub.Core/            # Domain Entities, Enums, DTOs
│   │   └── CreativeHub.Infrastructure/  # EF Core DbContext, Security, Match Engine
│   └── tests/
│       └── CreativeHub.Tests/           # Unit & Domain Tests
└── frontend/
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── components/                  # UI Components (Wizard, Matches, Chat, Projects, Directory)
        ├── context/                     # Auth Context & State Management
        ├── api.ts                       # Backend API Client & WebSocket Integration
        └── types.ts                     # TypeScript Type Definitions
```

## Getting Started

### 1. Backend Setup
```bash
cd backend
dotnet restore
dotnet build
dotnet run --project src/CreativeHub.Api/CreativeHub.Api.csproj --urls "http://localhost:5145"
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.
