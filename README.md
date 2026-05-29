<div align="center">

![KiranaFlow Hero](assets/hero.svg)

<br/>

<p>
  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React_Native-0.74-0EA5E9?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/Claude-Sonnet_4-7C3AED?style=flat-square&logo=anthropic&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.io-4.7-010101?style=flat-square&logo=socket.io&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat-square&logo=typescript&logoColor=white" />
</p>

**The full-stack operating system for India's neighborhood grocery stores.**
WhatsApp ordering bot → AI demand forecasting → route optimization → live GPS tracking.
Three apps. One `docker-compose up`.

</div>

---

## What this is

India has ~12 million kirana stores. Most of them take orders over WhatsApp in Hindi, track deliveries on paper, and restock on gut feel. This project replaces all three with a production-grade platform built from scratch.

**Three separate applications in one monorepo:**

| App | Stack | Who uses it |
|---|---|---|
| `backend/` | Node.js 20 · Express 4 · Prisma · Socket.io · Bull | All clients |
| `mobile-app/` | React Native 0.74 · Expo 51 · Zustand · TanStack Query | Store owners + Delivery drivers |
| `tracking-pwa/` | Next.js 14 · Leaflet · Socket.io-client | Customers (browser, no install) |

---

## Architecture

![Architecture](assets/architecture.svg)

The backend is a single Express server. It handles REST for the mobile apps, WebSocket rooms for real-time updates, Bull queues for background AI jobs, and a Twilio webhook for WhatsApp. Every service — Postgres, Redis, API, pgAdmin — runs in Docker.

---

## Tech Stack

![Tech Stack](assets/tech-stack.svg)

### Backend — `backend/`

| Package | Version | Purpose |
|---|---|---|
| express | 4.19.2 | HTTP server |
| prisma + @prisma/client | 5.14.0 | ORM + type-safe queries |
| socket.io | 4.7.5 | WebSocket rooms |
| bull | 4.12.9 | Background job queues |
| ioredis | 5.4.1 | Redis client |
| jsonwebtoken | 9.0.2 | JWT access + refresh tokens |
| twilio | 5.2.2 | WhatsApp webhook + outbound |
| helmet | 7.1.0 | Security headers |
| express-rate-limit + rate-limit-redis | 7.2.0 | Redis-backed API rate limiting |
| compression | 1.7.4 | gzip responses |
| winston | 3.13.0 | Structured logging |
| morgan | 1.10.0 | HTTP request logging |
| joi | 17.13.1 | Request validation |
| multer | 1.4.5 | File upload (POD photos, wired) |

### Mobile — `mobile-app/`

| Package | Version | Purpose |
|---|---|---|
| react-native | 0.74.2 | Core |
| expo | ~51.0.8 | Build + native modules |
| react-native-paper | 5.12.3 | Material Design UI |
| @react-navigation/\* | 6.x | Stack + tabs + top-tabs |
| @tanstack/react-query | 5.40.0 | Server state + caching |
| zustand | 4.5.2 | Auth state + local store |
| expo-secure-store | 13.0.1 | Token persistence |
| expo-location | 17.0.1 | GPS (driver app) |
| socket.io-client | 4.7.5 | Real-time connection |
| react-native-maps | 1.14.0 | Map view |
| i18next + react-i18next | 23.x | Hindi/English i18n |

### Tracking PWA — `tracking-pwa/`

| Package | Version | Purpose |
|---|---|---|
| next | 14.2.3 | App Router + SSR |
| leaflet + react-leaflet | 1.9.4 / 4.2.1 | Interactive map |
| socket.io-client | 4.7.5 | Live driver location |
| clsx | 2.1.1 | Conditional class names |
| sharp | 0.33.4 | Image optimization |

---

## Features

### WhatsApp Ordering Bot

![WhatsApp Flow](assets/whatsapp-flow.svg)

Customers text the store's WhatsApp number in Hindi, English, or Hinglish. Claude (`claude-sonnet-4-20250514`) parses the natural language message into a structured `{items, qty, unit}` array. The session state machine has 5 states: `IDLE → GREETING → COLLECTING → CONFIRMING → DONE`. Sessions auto-expire after 30 minutes. Twilio signature verification runs in production. The Claude service has a full mock fallback so local dev works without an Anthropic key.

**Real prompt from the codebase:**
```
"2 kg atta, 1 litre tata namak" → {
  items: [{name:"atta",qty:2,unit:"kg"},{name:"tata namak",qty:1,unit:"litre"}],
  isOrderComplete: true,
  needsClarification: false
}
```

The WhatsApp controller handles inbound Twilio webhooks at `POST /api/webhook/whatsapp`. The outbound message queue (`whatsapp-outbound` Bull queue) handles all confirmations, dispatch notifications, and delivery receipts.

---

### AI Demand Forecasting + Insights

![AI Pipeline](assets/ai-pipeline.svg)

A Bull cron job fires at `23:00` every night. It pulls the last 90 days of delivered orders, aggregates by SKU, sends to `generateDemandForecasts()` with current inventory levels, and writes per-item `DemandForecast` rows. The response schema:

```json
{
  "forecasts": [{
    "inventory_id": "uuid",
    "product_name": "Wheat Flour (Atta)",
    "current_stock": 50,
    "predicted_7day_demand": 120,
    "recommended_restock_quantity": 80,
    "confidence": 0.85,
    "reasoning": "Based on 90-day history, atta sales average 17 units/day...",
    "urgency": "critical"
  }],
  "weekly_insight": "string"
}
```

Four Claude service functions:
- `parseWhatsAppOrder(message, language)` — NLP order parsing
- `generateDemandForecasts(orderHistory, inventory, store)` — 7-day SKU predictions
- `generateDailyReport(ownerName, city, language, metrics)` — bullet-point daily summary
- `generateWeeklyInsights(store, metrics, language)` — peak hours, top products, driver ranking, suggestions

---

### Real-Time GPS Tracking

![Real-Time Tracking](assets/realtime-tracking.svg)

Three Socket.io rooms run simultaneously:

| Room | Who joins | What flows |
|---|---|---|
| `store:{storeId}` | Owner app | `order:new`, `order:status_update`, `driver:location`, `forecast:ready` |
| `driver:{driverId}` | Driver app | `batch:started`, new assignment notifications |
| `order:{orderId}` | Tracking PWA | `driver:location`, `order:status_update` — **no auth required** |

The driver app emits `driver:location` with `{lat, lng, speed, heading}`. The server broadcasts to both `store:{id}` and `order:{id}` simultaneously. The tracking PWA subscribes to `order:{id}` and updates the Leaflet map marker in real time. JWT is verified in the `handshake.auth` field — public routes like tracking use the order room without authentication.

---

### Route Optimization

The route optimizer calls Google's Route Optimization API with a full VRP payload — vehicle weight limits, delivery coordinates, time windows. The response sequences the stops by minimum total distance and persists the result as `optimizedRoute` + `waypoints` JSON on the `DeliveryBatch` record. The driver app reads `stopSequence` from `OrdersInBatches` to show numbered stops.

Falls back to a mock optimizer in dev (no Google key needed).

---

## Data Model

![Data Model](assets/data-model.svg)

**13 Prisma models. Key design decisions:**

- Coordinates stored as `Decimal(10,7)` — 7 decimal places ≈ 1.1cm precision
- All money fields as `Decimal(10,2)` or `Decimal(8,2)` — no float rounding errors
- All timestamps as `@db.Timestamptz()` — timezone-aware, stored in UTC
- `OrderNumber` generated as `KF-YYYY-NNNNN` format — human-readable, unique
- `Order.items` stored as `Json` — flexible, no join needed for display
- `Order.source` differentiates `"whatsapp"` vs `"manual"` — analytics split
- `DeliveryBatch.optimizedRoute` and `waypoints` stored as `Json` — full Google response preserved
- `WhatsAppSession.sessionData` as `Json` — partial order state between messages
- `RefreshToken` persisted in DB — supports revocation by deleting rows

**4 enums:**
- `OrderStatus` — `pending | confirmed | assigned | picked_up | in_transit | delivered | cancelled`
- `SubscriptionPlan` — `free | basic | pro`
- `PaymentMethod` — `cod | upi | credit`
- `BatchStatus` — `planned | in_progress | completed`

---

## API Routes

![API Routes](assets/api-routes.svg)

---

## Quick Start

![Quick Start](assets/quickstart.svg)

### Docker (one command)

```bash
git clone https://github.com/sat1828/KiranaFlow.git
cd KiranaFlow
docker-compose up
```

Starts 4 containers. The API container runs `prisma migrate deploy` automatically on boot. Postgres healthcheck runs every 5s before the API starts — no race conditions.

| Service | URL | Notes |
|---|---|---|
| API | `http://localhost:3000` | `GET /health` → `{status:"ok"}` |
| PostgreSQL | `localhost:5432` | user/pass: `kiranaflow/kiranaflow` |
| Redis | `localhost:6379` | `appendonly yes` persistence |
| pgAdmin | `http://localhost:5050` | `admin@kiranaflow.app` / `admin` |

### Without Docker

```bash
# Backend
cd backend
cp .env.example .env        # fill DATABASE_URL, REDIS_URL, JWT secrets
npm install
npx prisma migrate dev
node prisma/seed.js         # optional
npm run dev                 # nodemon, restarts on change

# Tracking PWA
cd tracking-pwa
npm install
npm run dev                 # http://localhost:3001

# Mobile app
cd mobile-app
npm install
npx expo start              # scan QR with Expo Go
```

### Environment Variables

**Required (no feature works without these):**

```env
DATABASE_URL=postgresql://kiranaflow:kiranaflow@localhost:5432/kiranaflow
REDIS_URL=redis://localhost:6379
JWT_SECRET=min-32-chars-random-string-here
JWT_REFRESH_SECRET=different-min-32-chars-random-string
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
PORT=3000
```

**Optional (features degrade gracefully):**

```env
# AI features — falls back to mock responses in dev
ANTHROPIC_API_KEY=sk-ant-...

# WhatsApp bot — bot won't work without this
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Route optimization — falls back to mock
GOOGLE_MAPS_API_KEY=AIza...
GOOGLE_ROUTE_OPTIMIZATION_KEY=AIza...
GOOGLE_PROJECT_ID=your-project-id

NODE_ENV=development
```

**CORS in production** — the server allows exactly three origins:
```
https://kiranaflow.app
https://admin.kiranaflow.app
https://track.kiranaflow.app
```

---

## Mobile App Screens

### Owner Navigation (`OwnerTabs`)

| Screen | What it does |
|---|---|
| **Dashboard** | Today's orders, revenue, active drivers, pending count, 7-day revenue bar chart, quick-action buttons |
| **Orders** | Segmented filter (Pending / Active / Done / Cancelled), search, status chips with exact `getStatusColor()` logic |
| **Drivers** | On/off duty cards, duty toggle, vehicle type, active order count, add driver FAB |
| **Route Optimizer** | Select driver (filtered to `isOnDuty`), multi-select orders, call Google VRP, display result, start batch |
| **Inventory** | SKU cards with stock bars, `getStockColor()` urgency (critical/low/out_of_stock), cost + selling price, reorder level |
| **Forecast** | Claude AI 7-day predictions, urgency chips (critical/high/medium/low), confidence scores, reasoning text |
| **Insights** | Weekly summary, peak hour bar chart, top products, 3 colour-coded suggestion cards |
| **Analytics** | 7d/30d/90d toggle, 4-metric grid, top products list, on-time rate |
| **Settings** | Store profile, dark mode toggle, notification toggle, language picker (Hindi/English), subscription plan |

### Driver Navigation (`DriverTabs`)

| Screen | What it does |
|---|---|
| **Home** | Duty toggle (green Switch), active orders count, today's deliveries, earnings summary |
| **Orders** | Assigned order list with status controls |
| **Batch Map** | Active batch with numbered stops, stop sequence from `OrdersInBatches`, Deliver button per stop |
| **Delivery** | Customer name/phone/address, items list, COD collect badge, delivery notes, Mark Delivered button |
| **History** | Past deliveries, earnings by day |

### Auth Flow

OTP-based phone auth via Twilio. `WelcomeScreen` → `PhoneScreen` → `OTPScreen` (6-box input, 22s resend countdown) → role-based navigator. Tokens stored in `expo-secure-store`. The JWT payload carries `role`, `storeId`, `driverId` so every authenticated request knows context without extra DB lookups.

---

## Project Structure

```
KiranaFlow/
│
├── backend/
│   ├── src/
│   │   ├── app.js                   # Express server, middleware, graceful shutdown
│   │   ├── config/
│   │   │   ├── index.js             # env config object
│   │   │   ├── database.js          # Prisma connect/disconnect
│   │   │   ├── redis.js             # ioredis client
│   │   │   ├── queue.js             # Bull queue factory + shutdown
│   │   │   └── logger.js            # Winston structured logger
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── order.controller.js
│   │   │   ├── driver.controller.js
│   │   │   ├── store.controller.js
│   │   │   ├── inventory.controller.js
│   │   │   ├── route.controller.js
│   │   │   ├── ai.controller.js
│   │   │   ├── report.controller.js
│   │   │   ├── track.controller.js
│   │   │   └── whatsapp.controller.js
│   │   ├── services/
│   │   │   ├── claude.service.js    # 4 AI functions + mock fallback
│   │   │   └── route.service.js     # Google VRP + mock fallback
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT verify middleware
│   │   │   ├── rateLimiter.js       # Redis-backed rate limiting
│   │   │   └── errorHandler.js      # 404 + 5xx handlers
│   │   ├── routes/                  # 10 route modules
│   │   ├── jobs/
│   │   │   ├── forecast.job.js      # Bull cron 23:00 — demand forecast
│   │   │   └── report.job.js        # Bull cron — daily metrics
│   │   └── socket/
│   │       └── index.js             # Socket.io rooms + JWT auth
│   ├── prisma/
│   │   ├── schema.prisma            # 13 models, 4 enums
│   │   └── seed.js                  # seed data
│   └── Dockerfile                   # node:20-alpine, health check
│
├── mobile-app/
│   ├── App.tsx                      # dual nav tree: OwnerTabs / DriverTabs
│   └── src/
│       ├── screens/
│       │   ├── owner/               # Dashboard, Orders, Drivers, RouteOptimizer,
│       │   │                        # Inventory, Forecast, Insights, Analytics, Settings
│       │   ├── driver/              # Home, Orders, BatchMap, Delivery, History
│       │   └── auth/                # Welcome, Phone, OTP
│       ├── services/api.ts          # all API calls
│       ├── store/authStore.ts       # Zustand auth state
│       └── i18n/index.ts            # Hindi + English strings
│
├── tracking-pwa/
│   └── src/
│       └── app/
│           └── track/[orderId]/     # public tracking page
│               └── page.tsx         # SSR + Socket.io + Leaflet
│
└── docker-compose.yml               # postgres:16 · redis:7 · api · pgadmin
```

---

## What's Not Done Yet

These fields exist in the schema and the groundwork is laid — they're just not wired end-to-end:

| Feature | State |
|---|---|
| Push notifications | `fcmToken` on `Driver` model — Firebase integration not written |
| Proof of delivery photo | `proofOfDeliveryUrl` on `Order`, `multer` installed — upload endpoint not connected |
| Customer portal | `Customer` model tracks `orderCount` + `lastOrderAt` — no customer-facing login |
| UPI payment gateway | `paymentMethod: upi` in enum — Razorpay/PayU not integrated |
| Subscription gating | `subscriptionPlan: free|basic|pro` on `Store` — feature flags not implemented |
| Driver earnings calc | Delivery history stored — earnings computation not built |

---

## License

MIT — build on it, fork it, learn from it.

---

<div align="center">

Built for India's 12 million kirana stores 🏪

*Node.js · React Native · Next.js · PostgreSQL · Redis · Claude AI · Socket.io · Docker*

</div>
