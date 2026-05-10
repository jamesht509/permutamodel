# CollabShoot / PermutaModel

**The premier TFP network for photographers and models.**

Connect with talented creatives, build your portfolio through collaborative TFP (Trade for Print) shoots, and grow your network.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend:** Supabase (Auth + PostgreSQL + Storage + Realtime + Edge Functions)
- **Animations:** Framer Motion
- **State:** React Query + React Context
- **PWA:** vite-plugin-pwa
- **i18n:** English (US) + Portuguese (BR) — auto-detected by domain

## Features

- **Discover** — Browse photographers and models with filters (role, style, location, experience)
- **TFP Requests** — Send and manage collaboration requests
- **Real-time Chat** — Messaging with typing indicators and read receipts
- **Portfolio** — Upload, reorder, and showcase your work
- **Casting Calls** — Create and apply to casting calls
- **Reviews** — Rate collaborators on professionalism, punctuality, and quality
- **Sessions** — Track upcoming and completed shoots
- **Favorites** — Save profiles for later
- **Notifications** — Real-time alerts for requests, messages, and castings
- **PWA** — Installable on mobile with offline support
- **White-label** — CollabShoot (US) / PermutaModel (BR) via domain detection

## Getting Started

```bash
npm install
npm run dev
```

Create a `.env` file with your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

## Deploy

Deployed on Vercel. The `vercel.json` handles SPA rewrites for client-side routing.

## Author

Made by **Jemson Marius** — photographer, developer, creator.
