# Aroyb MenuMaster Demo

A restaurant menu management system demo with categories, items, modifiers, combos, schedules, and AI insights.

## Quick Start

```bash
cd aroyb-menumaster
npm install
npm run dev
```

Open http://localhost:3000 (Login: `aroyb2024`)

## Features

### Menu Management

| Feature        | Description                                             |
| -------------- | ------------------------------------------------------- |
| **Categories** | Create/edit/reorder, channel visibility (web/app/qr)    |
| **Items**      | Full editor with sizes, half/half, modifiers, allergens |
| **Modifiers**  | Required/optional, min/max selection, price deltas      |
| **Combos**     | Meal deals with slots and substitutions                 |

### Scheduling

| Feature        | Description                           |
| -------------- | ------------------------------------- |
| **Schedules**  | Breakfast/Lunch/Dinner time windows   |
| **Happy Hour** | Percentage or fixed discounts by time |
| **Simulator**  | Pick date/time to see active menu     |

### Operations

| Feature           | Description                               |
| ----------------- | ----------------------------------------- |
| **86 Controls**   | Mark items/options sold out, bulk actions |
| **VAT Config**    | Rate management, CSV export               |
| **Image Library** | Upload and manage food images             |

### AI Features

| Feature             | Description                                             |
| ------------------- | ------------------------------------------------------- |
| 🤖 **Insights**     | Detect duplicates, missing info, inconsistencies        |
| 💰 **Pricing**      | Margin analysis, price optimization, bundle suggestions |
| ✍️ **Descriptions** | Brand voice presets, auto-generate descriptions         |

## Pages (15+)

- `/dashboard` - Overview
- `/menu/categories` - Category management
- `/menu/items` + `/menu/items/[id]` - Item list + editor
- `/modifiers` - Modifier groups
- `/combos` - Meal deals
- `/schedules` + `/schedules/simulator` - Time windows
- `/availability` - 86 controls
- `/tax-vat` - VAT config
- `/images` - Image library
- `/preview` - Customer menu view
- `/ai/insights` - Issue detection
- `/ai/pricing` - Price optimization
- `/ai/descriptions` - AI descriptions

## Demo Data

- **10 categories**, **60 items**, **12 modifier groups**
- **8 combos**, **3 schedules**, **2 happy hour rules**
- Realistic UK pricing (GBP) and allergens

---

© 2024 Aroyb Technology
