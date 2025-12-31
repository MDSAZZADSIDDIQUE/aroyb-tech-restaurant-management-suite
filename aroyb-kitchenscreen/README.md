# Aroyb KitchenScreen (KDS) Demo

A tablet-friendly Kitchen Display System demo for UK restaurants. Features live tickets, station routing, AI-powered insights, and "busy kitchen" realism.

## Quick Start

```bash
cd aroyb-kitchenscreen
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Features

### Core KDS

- **4-Column Board**: New → Cooking → Ready → Completed
- **Station Routing**: Grill, Fry, Pizza, Bar, Prep filters
- **Bump/Recall**: Touch-friendly ticket actions
- **Live Timers**: Color-coded urgency (green → amber → red)
- **Allergen Warnings**: Prominent allergy alerts

### AI Features (Demo)

- **🤖 Priority Scoring**: Time + complexity + coordination
- **🤖 Modifier Rewriter**: "no onion" → "HOLD: ONION"
- **🤖 Bottleneck Detection**: Station alerts with suggestions
- **🤖 Mistake Patterns**: Remake tracking and insights

### Demo Controls

- **Simulate Rush**: Auto-generates orders every 15-20s
- **Kitchen Load**: Slider affects AI calculations
- **Reset Demo**: Clear all data

## Routes

| Route                    | Description                     |
| ------------------------ | ------------------------------- |
| `/kds`                   | Main kitchen display board      |
| `/kds/station/[station]` | Station-specific view           |
| `/expo`                  | Expo/handoff for ready orders   |
| `/stats`                 | Performance stats & AI insights |
| `/settings`              | Configuration                   |

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- localStorage for demo state

## Project Structure

```
src/
├── app/(kds)/           # KDS routes
├── components/
│   ├── kds/             # TicketCard, StationTabs
│   ├── layout/          # KDSHeader, DemoBanner
│   └── ui/              # Badges, Toast
├── data/                # Seed data (32 tickets, stations, menu items)
├── lib/
│   ├── ai/              # Prioritizer, Rewriter, Bottleneck, Mistakes
│   ├── storage.ts       # localStorage persistence
│   └── formatting.ts    # Utilities
└── types/               # TypeScript interfaces
```

## Demo Data

- **32 seed tickets** in various states
- **5 stations**: Grill, Fry, Pizza, Bar, Prep
- **24 menu items** with cook times and complexity
- **Multi-station orders** for coordination testing

---

© 2024 Aroyb Technology
