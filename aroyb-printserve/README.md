# Aroyb PrintServe Demo

A restaurant printing system demo: receipts, kitchen dockets, packing labels, and a local print bridge simulator.

## Quick Start

```bash
cd aroyb-printserve
npm install
npm run dev
```

Open http://localhost:3000 (Login: `aroyb2024`)

## Features

### Print Types

- **Receipts** - Header, items, totals, payment, VAT, footer
- **Kitchen Dockets** - Station grouping, allergen banners, copy count
- **Packing Labels** - Grid layout, AI-formatted text, handling icons
- **Allergen Labels** - Clear warnings, legal disclaimers

### AI Features

| Feature              | Description                                        |
| -------------------- | -------------------------------------------------- |
| 🤖 Packing Checklist | Auto-generates items, extras, and high-risk checks |
| 🤖 Label Formatting  | Abbreviates, highlights critical modifiers         |
| 🤖 Troubleshooter    | Decision tree for 7 common printer issues          |

### Pages

| Route             | Description                    |
| ----------------- | ------------------------------ |
| `/login`          | Demo login                     |
| `/dashboard`      | Stats overview                 |
| `/orders`         | Order list + print bundle      |
| `/printers`       | Printer status + demo toggles  |
| `/jobs`           | Job queue + reprint            |
| `/templates`      | Template editor + live preview |
| `/packer`         | Large-button checklist view    |
| `/troubleshooter` | AI printer diagnosis           |
| `/formatting`     | Before/after label formatting  |
| `/bridge`         | Print bridge simulator         |

## Project Structure

```
src/
├── app/
│   ├── (auth)/login          # Login
│   ├── (app)/...             # Admin pages (dashboard, orders, etc.)
│   └── bridge                # Print bridge simulator
├── components/print/         # ReceiptPreview, DocketPreview, LabelPreview
├── data/                     # Seed data (20 orders, 10 printers, 2 branches)
├── lib/
│   ├── ai/                   # Packing checklist, label formatter, troubleshooter
│   ├── storage.ts            # localStorage persistence
│   └── auth.ts               # Demo session
└── types/                    # TypeScript interfaces
```

## Demo Data

- **20 orders** with various items, modifiers, allergens
- **10 printers** across 2 branches (various statuses)
- **2 branches** (Camden Town, Shoreditch)

## Demo Controls

- **Printer status toggles** - Simulate online/offline/paper low/error
- **Auto-process jobs** - Bridge auto-completes pending jobs
- **Reset** - Clear all localStorage data

---

© 2024 Aroyb Technology
