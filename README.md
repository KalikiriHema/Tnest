# Tnest - Creative Services Marketplace

A requirement-driven creative talent platform connecting brands, startups, and clients with verified creative specialists (video editors, UGC creators, thumbnail designers, scriptwriters) with deterministic matching, dynamic scoping wizards, two-way discovery, real-time negotiation, deliverable cycles, and gated reviews.

## Architecture & Tech Stack

- **Backend**: .NET 10 / C# Clean Architecture (Domain, Application, Infrastructure, API) with ASP.NET Core Web API, EF Core (SQLite / PostgreSQL), Argon2id password hashing, JWT authentication, and SignalR WebSocket real-time chat.
- **Frontend**: React + TypeScript + Vite with custom modern design system, micro-animations, and responsive layouts.

## Clean Architecture Structure

```
tnest/
├── backend/
│   ├── TNest.sln
│   ├── src/
│   │   ├── TNest.Domain/          # Pure Domain Entities, Enums, Business Rules (Zero dependencies)
│   │   ├── TNest.Application/     # Application Services, Interfaces, DTOs, Mappings
│   │   ├── TNest.Infrastructure/  # EF Core DbContext, Security (Argon2id/JWT), Match Engine
│   │   └── TNest.Api/             # ASP.NET Core Controllers, SignalR Hubs, DI Composition
│   └── tests/
│       └── TNest.Tests/           # Unit & Domain Tests (.NET 10)
└── frontend/
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── components/            # UI Components (Wizard, Matches, Chat, Projects, Directory)
        ├── context/               # Auth Context & State Management
        ├── api.ts                 # Backend API Client & WebSocket Integration
        └── types.ts               # TypeScript Type Definitions
```

## Getting Started

### 1. Backend Setup
```bash
cd backend
dotnet restore
dotnet build
dotnet test
dotnet run --project src/TNest.Api/TNest.Api.csproj --urls "http://localhost:5145"
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.
