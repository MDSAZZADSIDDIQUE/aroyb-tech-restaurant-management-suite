# Aroyb OrderHub - Restaurant Order Management Demo

A high-conversion demo of the Aroyb OrderHub, a restaurant order management system built with **Next.js 16**, **TypeScript**, and **Tailwind CSS**.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

**Demo Login Password:** `aroyb2024`

## ✨ Features

### Order Management

- **Multi-channel Order Inbox** - Web, App, QR, Marketplace orders
- **Order Accept/Decline** with toast notifications
- **Status Workflow** - Pending → Accepted → Preparing → Ready → Completed
- **Allergen Warnings** displayed prominently
- **Customer Notes** visibility

### AI-Powered Features (Simulated)

- 🤖 **Prep Time Prediction** - Based on kitchen load, menu complexity, time of day
- 🚨 **Risk Scoring** - Fraud detection for high-value/suspicious orders
- 💡 **Throttle Suggestions** - Automated kitchen load management recommendations
- 💰 **Refund Suggester** - AI-recommended resolutions with customer messages
- 🍳 **Station Routing** - Auto-distribute orders to kitchen stations

### Kitchen Display

- Station-based ticket view
- Load visualization per station
- Real-time order updates

### Settings

- **Opening Hours** with holiday overrides
- **Delivery Zones** with fees and minimums
- **Auto-Accept Rules** per channel
- **Menu Schedules** (breakfast, lunch, dinner)

### Reports & Analytics

- Revenue metrics
- Channel breakdown
- Top-selling items
- AI insights

## 📁 Project Structure

```
aroyb-orderhub/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (app)/          # Protected app pages
│   │   │   ├── dashboard/  # Main dashboard
│   │   │   ├── orders/     # Order list & detail
│   │   │   ├── kitchen/    # Kitchen display
│   │   │   ├── menus/      # Menu management
│   │   │   ├── reports/    # Analytics
│   │   │   └── settings/   # All settings pages
│   │   └── (auth)/         # Authentication
│   ├── components/         # React components
│   │   ├── ai/            # AI feature components
│   │   ├── layout/        # Sidebar, Header, Banner
│   │   ├── orders/        # OrderCard
│   │   └── ui/            # Badge, Toast
│   ├── data/              # Mock JSON data
│   ├── lib/               # Utilities
│   │   ├── ai/           # AI engines
│   │   ├── auth.ts       # Session management
│   │   ├── storage.ts    # localStorage persistence
│   │   └── formatting.ts # Currency, time, status formatting
│   └── types/            # TypeScript interfaces
```

## 🎮 Demo Features

1. **DEMO MODE Banner** - Always visible at top
2. **Live Order Simulator** - Toggle on/off for new orders every 20-40 seconds
3. **Reset Demo** - Clear localStorage and start fresh
4. **UK-specific data** - GBP currency, London addresses, realistic times

## 🛠 Tech Stack

- **Next.js 16** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **localStorage** for demo state persistence
- **No external dependencies** - fully self-contained

## 📝 Pages

| Page         | Route                   | Description                       |
| ------------ | ----------------------- | --------------------------------- |
| Login        | `/login`                | Demo password authentication      |
| Dashboard    | `/dashboard`            | KPIs, order queue, AI suggestions |
| Orders       | `/orders`               | Order list with filters           |
| Order Detail | `/orders/[id]`          | Full order view, timeline, refund |
| Kitchen      | `/kitchen`              | Station-based display             |
| Menus        | `/menus`                | Menu items, 86/pause              |
| Reports      | `/reports`              | Analytics & AI insights           |
| Hours        | `/settings/hours`       | Opening hours                     |
| Delivery     | `/settings/delivery`    | Zones & fees                      |
| Auto-Accept  | `/settings/auto-accept` | Channel rules                     |
| Connectors   | `/settings/connectors`  | Marketplace integrations          |

## 🔑 Environment Variables

Copy `env.example` to `.env.local`:

```bash
DEMO_ADMIN_PASSWORD=aroyb2024
NEXT_PUBLIC_APP_NAME=Aroyb OrderHub
NEXT_PUBLIC_DEMO_MODE=true
```

---

© 2024 Aroyb Technology
