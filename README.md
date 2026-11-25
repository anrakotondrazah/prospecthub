# ProspectHub

CRM SaaS multi-tenant pour la prospection B2B en France.

## Stack

- **Frontend**: Next.js 15, React, TypeScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Deployment**: Vercel + Supabase Cloud

## Features

- Multi-tenant architecture avec isolation des donnees
- RBAC (Role-Based Access Control) style HubSpot
- 4 plans d'abonnement : Free, Starter (29 EUR), Pro (79 EUR), Enterprise (199 EUR)
- Base partagee d'entreprises France (SIRET, NAF)
- Leads, Companies, Deals, Tasks, Activities
- Pipeline Kanban personnalisable
- Import/Export CSV
- Enrichissement automatique des donnees

## Getting Started

### Prerequisites

- Node.js 18+
- npm ou yarn
- Compte Supabase

### Installation

```bash
# Clone
git clone https://github.com/anrakotondrazah/prospecthub.git
cd prospecthub

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run migrations on Supabase
# Go to Supabase SQL Editor and run supabase/migrations/001_initial_schema.sql

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
  app/              # Next.js App Router pages
    auth/           # Authentication pages
    dashboard/      # Dashboard
    leads/          # Leads management
    companies/      # Companies management
    deals/          # Deals pipeline
    tasks/          # Task management
    settings/       # Settings
  components/       # React components
    ui/             # Base UI components
    layout/         # Layout components
    forms/          # Form components
  lib/              # Utilities
    supabase/       # Supabase client config
    utils/          # Helper functions
  types/            # TypeScript types
  hooks/            # Custom React hooks
supabase/
  migrations/       # SQL migrations
```

## Database Schema

20+ tables including:
- `subscription_plans` - Subscription tiers
- `organizations` - Tenant organizations
- `profiles` - User profiles (extends auth.users)
- `roles` / `permissions` / `role_permissions` - RBAC
- `leads` / `companies` / `deals` - CRM entities
- `pipeline_stages` - Custom pipeline per org
- `tasks` / `activities` - Productivity
- `shared_companies` - Shared French B2B database

## Contributing

This is a private project. Contact the maintainers for contribution guidelines.

## License

Proprietary - All rights reserved
