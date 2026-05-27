<div align="center">

<!-- HERO BANNER -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=14,20,24&height=180&section=header&text=KiranaFlow&fontSize=64&fontColor=ffffff&fontAlignY=38&desc=The%20operating%20system%20for%20India's%20neighborhood%20grocery%20stores&descAlignY=62&descSize=16" alt="KiranaFlow" />

<br/>

<!-- INLINE SVG LOGO / HERO GRAPHIC -->
<svg width="720" height="280" viewBox="0 0 720 280" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a"/>
      <stop offset="100%" style="stop-color:#1e293b"/>
    </linearGradient>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#3b82f6"/>
      <stop offset="100%" style="stop-color:#6366f1"/>
    </linearGradient>
    <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#10b981"/>
      <stop offset="100%" style="stop-color:#3b82f6"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="720" height="280" fill="url(#bgGrad)" rx="16"/>

  <!-- Grid lines for depth -->
  <line x1="0" y1="70" x2="720" y2="70" stroke="#1e3a5f" stroke-width="1" opacity="0.4"/>
  <line x1="0" y1="140" x2="720" y2="140" stroke="#1e3a5f" stroke-width="1" opacity="0.4"/>
  <line x1="0" y1="210" x2="720" y2="210" stroke="#1e3a5f" stroke-width="1" opacity="0.4"/>
  <line x1="180" y1="0" x2="180" y2="280" stroke="#1e3a5f" stroke-width="1" opacity="0.4"/>
  <line x1="360" y1="0" x2="360" y2="280" stroke="#1e3a5f" stroke-width="1" opacity="0.4"/>
  <line x1="540" y1="0" x2="540" y2="280" stroke="#1e3a5f" stroke-width="1" opacity="0.4"/>

  <!-- Glowing accent circle top-right -->
  <circle cx="660" cy="40" r="60" fill="#3b82f6" opacity="0.06"/>
  <circle cx="80" cy="240" r="50" fill="#10b981" opacity="0.06"/>

  <!-- STORE icon — left column -->
  <rect x="60" y="90" width="88" height="100" rx="12" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5"/>
  <rect x="68" y="120" width="72" height="70" rx="6" fill="#0f172a"/>
  <rect x="68" y="90" width="72" height="36" rx="8" fill="#2563eb" opacity="0.8"/>
  <text x="104" y="113" font-family="monospace" font-size="12" fill="white" text-anchor="middle" font-weight="700">STORE</text>
  <rect x="82" y="130" width="20" height="24" rx="3" fill="#3b82f6" opacity="0.6"/>
  <rect x="107" y="130" width="20" height="24" rx="3" fill="#3b82f6" opacity="0.6"/>
  <rect x="88" y="154" width="32" height="16" rx="3" fill="#6366f1"/>
  <text x="104" y="218" font-family="monospace" font-size="9" fill="#64748b" text-anchor="middle">KIRANA OWNER</text>
  <text x="104" y="230" font-family="monospace" font-size="8" fill="#475569" text-anchor="middle">React Native App</text>

  <!-- Arrow 1: Store → Backend -->
  <line x1="152" y1="140" x2="228" y2="140" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4,3"/>
  <polygon points="228,136 236,140 228,144" fill="#3b82f6"/>
  <text x="190" y="133" font-family="monospace" font-size="8" fill="#60a5fa" text-anchor="middle">REST + WS</text>

  <!-- BACKEND box — center -->
  <rect x="238" y="70" width="120" height="160" rx="12" fill="#1e293b" stroke="#6366f1" stroke-width="1.5"/>
  <rect x="238" y="70" width="120" height="36" rx="10" fill="url(#blueGrad)" opacity="0.9"/>
  <text x="298" y="93" font-family="monospace" font-size="11" fill="white" text-anchor="middle" font-weight="700">API SERVER</text>
  <!-- internal boxes -->
  <rect x="248" y="116" width="46" height="18" rx="4" fill="#312e81" opacity="0.8"/>
  <text x="271" y="128" font-family="monospace" font-size="7" fill="#a5b4fc" text-anchor="middle">Auth JWT</text>
  <rect x="300" y="116" width="46" height="18" rx="4" fill="#1e3a5f" opacity="0.8"/>
  <text x="323" y="128" font-family="monospace" font-size="7" fill="#93c5fd" text-anchor="middle">Socket.io</text>
  <rect x="248" y="140" width="46" height="18" rx="4" fill="#064e3b" opacity="0.8"/>
  <text x="271" y="152" font-family="monospace" font-size="7" fill="#6ee7b7" text-anchor="middle">Bull Queue</text>
  <rect x="300" y="140" width="46" height="18" rx="4" fill="#1c1917" opacity="0.8"/>
  <text x="323" y="152" font-family="monospace" font-size="7" fill="#fcd34d" text-anchor="middle">Helmet</text>
  <rect x="248" y="164" width="98" height="18" rx="4" fill="#1e293b" stroke="#475569" stroke-width="1"/>
  <text x="297" y="176" font-family="monospace" font-size="7" fill="#94a3b8" text-anchor="middle">Node.js + Express</text>
  <rect x="248" y="188" width="98" height="18" rx="4" fill="#1e293b" stroke="#475569" stroke-width="1"/>
  <text x="297" y="200" font-family="monospace" font-size="7" fill="#94a3b8" text-anchor="middle">Prisma ORM</text>
  <text x="298" y="245" font-family="monospace" font-size="8" fill="#64748b" text-anchor="middle">Express v4 · Node 20+</text>

  <!-- Arrow 2: Backend → DB -->
  <line x1="298" y1="230" x2="298" y2="257" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,3"/>
  <polygon points="294,257 298,264 302,257" fill="#475569"/>

  <!-- DB box below center -->
  <rect x="248" y="257" width="100" height="22" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="1"/>
  <text x="298" y="272" font-family="monospace" font-size="8" fill="#6ee7b7" text-anchor="middle">PostgreSQL + Redis</text>

  <!-- Arrow 3: Backend → Claude AI -->
  <line x1="358" y1="140" x2="418" y2="140" stroke="#8b5cf6" stroke-width="2" stroke-dasharray="4,3"/>
  <polygon points="418,136 426,140 418,144" fill="#8b5cf6"/>
  <text x="388" y="133" font-family="monospace" font-size="8" fill="#a78bfa" text-anchor="middle">Anthropic</text>

  <!-- CLAUDE AI box -->
  <rect x="428" y="90" width="110" height="110" rx="12" fill="#1e293b" stroke="#8b5cf6" stroke-width="1.5"/>
  <rect x="428" y="90" width="110" height="36" rx="10" fill="#4c1d95" opacity="0.9"/>
  <text x="483" y="113" font-family="monospace" font-size="11" fill="white" text-anchor="middle" font-weight="700">CLAUDE AI</text>
  <circle cx="483" cy="148" r="22" fill="#2e1065" stroke="#7c3aed" stroke-width="1"/>
  <text x="483" y="145" font-family="monospace" font-size="8" fill="#c4b5fd" text-anchor="middle">Demand</text>
  <text x="483" y="156" font-family="monospace" font-size="8" fill="#c4b5fd" text-anchor="middle">Forecast</text>
  <text x="483" y="170" font-family="monospace" font-size="7" fill="#7c3aed" text-anchor="middle">+ Order Parse</text>
  <text x="483" y="180" font-family="monospace" font-size="7" fill="#7c3aed" text-anchor="middle">+ Insights</text>
  <text x="483" y="220" font-family="monospace" font-size="8" fill="#64748b" text-anchor="middle">claude-sonnet-4</text>

  <!-- Arrow: Backend → WhatsApp -->
  <line x1="358" y1="170" x2="428" y2="190" stroke="#10b981" stroke-width="1.5" stroke-dasharray="3,3"/>

  <!-- WHATSAPP box -->
  <rect x="428" y="200" width="110" height="50" rx="10" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
  <text x="483" y="222" font-family="monospace" font-size="10" fill="#6ee7b7" text-anchor="middle" font-weight="700">WhatsApp</text>
  <text x="483" y="237" font-family="monospace" font-size="8" fill="#475569" text-anchor="middle">Twilio Webhook</text>

  <!-- TRACKING PWA — right -->
  <rect x="564" y="90" width="98" height="110" rx="12" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
  <rect x="564" y="90" width="98" height="36" rx="10" fill="#92400e" opacity="0.8"/>
  <text x="613" y="108" font-family="monospace" font-size="9" fill="white" text-anchor="middle" font-weight="700">TRACKING</text>
  <text x="613" y="119" font-family="monospace" font-size="8" fill="#fbbf24" text-anchor="middle">PWA</text>
  <!-- mini map icon -->
  <rect x="578" y="134" width="70" height="50" rx="6" fill="#0f172a"/>
  <circle cx="593" cy="150" r="5" fill="#10b981" opacity="0.8"/>
  <circle cx="628" cy="155" r="5" fill="#3b82f6" opacity="0.8"/>
  <circle cx="610" cy="165" r="6" fill="#f59e0b"/>
  <line x1="593" y1="150" x2="610" y2="165" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="3,2"/>
  <line x1="610" y1="165" x2="628" y2="155" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="3,2"/>
  <text x="613" y="215" font-family="monospace" font-size="8" fill="#64748b" text-anchor="middle">Next.js 14 + Leaflet</text>

  <!-- Arrow: Backend → Tracking PWA -->
  <line x1="358" y1="125" x2="562" y2="125" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4,3"/>
  <polygon points="562,121 570,125 562,129" fill="#f59e0b"/>

  <!-- DRIVER app — bottom right -->
  <rect x="564" y="220" width="98" height="50" rx="10" fill="#1e293b" stroke="#f97316" stroke-width="1.5"/>
  <text x="613" y="241" font-family="monospace" font-size="9" fill="#fb923c" text-anchor="middle" font-weight="700">DRIVER APP</text>
  <text x="613" y="255" font-family="monospace" font-size="7" fill="#475569" text-anchor="middle">React Native (Expo)</text>

  <!-- Arrow: Backend → Driver -->
  <line x1="358" y1="155" x2="560" y2="244" stroke="#f97316" stroke-width="1.5" stroke-dasharray="3,3"/>
  <polygon points="558,241 564,248 562,240" fill="#f97316"/>
</svg>

<br/>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/TypeScript-54%25-3178C6?style=flat-square&logo=typescript&logoColor=white" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Node.js-20%2B-339933?style=flat-square&logo=node.js&logoColor=white" /></a>
  <a href="#"><img src="https://img.shields.io/badge/React%20Native-Expo%2051-0EA5E9?style=flat-square&logo=expo&logoColor=white" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=next.js&logoColor=white" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Claude%20AI-Sonnet%204-7C3AED?style=flat-square&logo=anthropic&logoColor=white" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white" /></a>
</p>

</div>

---

## What this actually is

India has ~12 million kirana stores. Most of them take orders over WhatsApp, track deliveries on paper, and restock based on gut feel. KiranaFlow replaces all three.

It's a full-stack delivery coordination platform — a React Native app for store owners, a separate driver-mode app (same codebase, different nav tree), a Next.js PWA so customers can track their delivery in a browser without installing anything, and an Express backend that ties it all together with real-time WebSockets, a WhatsApp ordering bot, and Claude AI doing demand forecasting and weekly business insights.

Three repos' worth of code, one `docker-compose up`.

---

## What's inside

```
KiranaFlow/
├── backend/           Node.js + Express + Prisma + Bull + Socket.io
├── mobile-app/        React Native (Expo) — owner & driver in one APK
├── tracking-pwa/      Next.js 14 — customer-facing order tracking page
└── docker-compose.yml PostgreSQL + Redis + API + pgAdmin, all wired up
```

---

## Feature breakdown

### WhatsApp ordering bot

Customers text the store's WhatsApp number in Hindi, English, or Hinglish — "2 kg atta, 1 litre tata namak, 6 ande" — and Claude parses the order out of natural language. The bot handles multi-turn sessions: it asks clarifying questions if something's unclear, shows a numbered confirmation prompt, and creates the order in the database once confirmed. The store owner sees a live notification via Socket.io. No app install required on the customer side.

```
Customer: "bhaiya 2 kg atta aur ek litre tel chahiye"
     Bot: 📋 Aapka Order
          • 2 kg atta
          • 1 litre tel
          Confirm karen? 1 (Confirm) / 2 (Edit) / 3 (Cancel)
Customer: "1"
     Bot: ✅ Order Confirmed! KF-2025-84729
```

The Twilio webhook signature is validated in production. Sessions expire after 30 minutes. The Claude service (`backend/src/services/claude.service.js`) has a clean mock fallback so local dev works without an Anthropic key.

---

### AI demand forecasting

Every night at 11 PM, a Bull queue job pulls the last 90 days of delivered orders, aggregates product volumes, and sends them to Claude with the current inventory levels. Claude returns per-SKU predictions — 7-day demand, confidence score (0–1), urgency level (critical / high / medium / low), and reasoning in plain language. The app surfaces this in the Forecast screen with color-coded urgency chips.

```
Wheat Flour (Atta)  |  Current: 50kg  |  Predicted: 120kg/7d  |  Confidence: 85%
                    |  Urgency: CRITICAL  |  Restock: 80kg
```

The forecast job at `backend/src/jobs/forecast.job.js` writes daily rows to `DemandForecast` for each inventory item. You can also trigger it on-demand from the mobile app.

---

### Route optimization

The route optimizer hits Google's Route Optimization API to sequence multiple deliveries by minimum total distance, respecting vehicle weight limits. Drivers see their stops numbered on a map with estimated arrival times. The system falls back to a sensible mock when the Google key isn't configured, so it still works in development.

Batches are persisted in `DeliveryBatch` with full waypoint JSON — the driver app reads this to show the ordered stop list. In-progress batches emit live location updates back to the store owner's dashboard over WebSockets.

---

### Real-time tracking

When a driver marks an order as in-transit, Socket.io starts broadcasting their GPS coordinates — emitted from the driver app via `socket.emit('driver:location', {...})` — to two rooms simultaneously: the store owner's dashboard and a public `order:{id}` room that the tracking PWA subscribes to.

The tracking PWA (`tracking-pwa/`) is a Next.js 14 app that anyone can open from a link. It shows a Leaflet map with animated markers — 🏪 store, 📍 customer, 🛵 driver — and a dotted polyline connecting them. The driver marker pulses with a CSS animation. The status timeline progresses live. No account needed.

---

### Owner mobile app

The React Native app has a proper dual-navigation architecture: `OwnerTabs` (Dashboard / Orders / Drivers / Stock / Settings) and `DriverTabs` (Home / Orders / Map / History) — same binary, role determined at login.

**Owner screens:**
- Dashboard — today's orders, revenue, active drivers, pending count, recent order list
- Orders — filterable by status, date range, driver; create manual orders
- Drivers — on-duty status, live location dots, assign to batches
- Route Optimizer — select pending orders, run optimization, create batch
- Inventory — SKU list with stock levels, reorder thresholds, cost and selling price
- Forecast — Claude AI 7-day predictions with urgency flags
- Insights — weekly analysis: peak hours, top products, revenue comparison, suggestions
- Analytics — historical metrics, delivery time averages, on-time rates
- Settings — store profile, WhatsApp number, subscription plan, language toggle (Hindi / English)

**Driver screens:**
- Home — today's assigned orders, earnings summary, duty toggle
- Orders — list of assigned deliveries with status controls
- Batch Map — numbered stop list with sequenced waypoints
- Delivery — mark as picked up / in transit / delivered, proof of delivery photo
- History — past deliveries, earnings by day

---

### Authentication

OTP-based phone auth via Twilio — no passwords. Access tokens (15 min) + refresh tokens (7 days) stored in Zustand + Expo SecureStore. The JWT carries `role` (owner / driver), `storeId`, and `driverId` so every API call knows who and what without extra database lookups. The Socket.io middleware reads the same JWT from the handshake auth field.

---

## Data model (the important parts)

```
Store          — owner profile, coordinates, delivery radius, subscription plan, language
  └─ Driver    — vehicle type, capacity, GPS coords, on-duty flag, FCM token
  └─ Customer  — phone, delivery coords, order count, last order date
  └─ Order     — order number (KF-YYYY-XXXXX), items JSON, status enum (7 states),
  |              payment method (COD/UPI/credit), proof of delivery URL
  └─ DeliveryBatch — optimized route JSON, waypoints, total km, duration estimate
  |    └─ OrdersInBatches  — stop sequence join table
  └─ Inventory — SKU, stock, reorder level, cost + selling price
  └─ DemandForecast — per-item daily predictions with confidence scores
  └─ DriverLocation — GPS history per batch (speed, heading, timestamp)
  └─ StoreMetric — daily rollups: orders, revenue, delivery time, on-time rate
  └─ WhatsAppSession — conversation state machine (IDLE → GREETING → COLLECTING → CONFIRMING → DONE)
  └─ RefreshToken — persisted tokens for auth rotation
```

All timestamps are `Timestamptz`. Coordinates are `Decimal(10,7)`. Financial figures are `Decimal(10,2)`.

---

## Architecture diagram

```
                    ┌─────────────────────────────────┐
   WhatsApp         │          Express API             │
   Customer ──────► │  /api/webhook  (Twilio inbound)  │──► Claude AI (order parse)
                    │                                  │
   Owner App ──────►│  /api/orders   /api/routes       │──► Claude AI (forecasts)
   (React Native)   │  /api/drivers  /api/inventory    │──► Claude AI (insights)
                    │  /api/ai       /api/reports       │
   Driver App ─────►│  /api/auth                       │──► Google Route Optimization
   (React Native)   │                                  │
                    │  Socket.io rooms:                 │──► Twilio (WhatsApp outbound)
   Tracking PWA ───►│    store:{id}  driver:{id}       │
   (Next.js 14)     │    order:{id}                    │──► PostgreSQL (Prisma)
                    │                                  │──► Redis (Bull queues)
                    │  Bull queues:                    │
                    │    demand-forecast (daily 11PM)  │
                    │    daily-report                  │
                    │    whatsapp-outbound             │
                    └─────────────────────────────────┘
```

---

## Screens at a glance

<!-- MOBILE SCREEN MOCKUPS SVG -->
<div align="center">
<svg width="720" height="380" viewBox="0 0 720 380" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="phone1bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#f8fafc"/>
      <stop offset="100%" style="stop-color:#e2e8f0"/>
    </linearGradient>
    <linearGradient id="tabBar" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff"/>
      <stop offset="100%" style="stop-color:#f8fafc"/>
    </linearGradient>
    <filter id="phoneShadow" x="-20%" y="-10%" width="140%" height="130%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Phone 1: Dashboard -->
  <g filter="url(#phoneShadow)">
    <rect x="20" y="20" width="160" height="340" rx="20" fill="#0f172a" stroke="#334155" stroke-width="2"/>
    <rect x="26" y="44" width="148" height="292" fill="url(#phone1bg)"/>
    <!-- notch -->
    <rect x="70" y="26" width="60" height="12" rx="6" fill="#1e293b"/>
    <!-- header -->
    <rect x="26" y="44" width="148" height="44" fill="#1e293b"/>
    <text x="40" y="61" font-family="Arial" font-size="7" fill="#94a3b8">Good Morning! 👋</text>
    <text x="40" y="76" font-family="Arial" font-size="11" fill="white" font-weight="800">Dashboard</text>
    <!-- metric cards -->
    <rect x="30" y="94" width="64" height="44" rx="8" fill="#dbeafe"/>
    <text x="62" y="113" font-family="Arial" font-size="14" fill="#0f172a" text-anchor="middle" font-weight="800">47</text>
    <text x="62" y="128" font-family="Arial" font-size="7" fill="#475569" text-anchor="middle">Today's Orders</text>
    <rect x="100" y="94" width="68" height="44" rx="8" fill="#d1fae5"/>
    <text x="134" y="111" font-family="Arial" font-size="9" fill="#0f172a" text-anchor="middle" font-weight="800">₹18,240</text>
    <text x="134" y="128" font-family="Arial" font-size="7" fill="#475569" text-anchor="middle">Revenue</text>
    <rect x="30" y="143" width="64" height="44" rx="8" fill="#fef3c7"/>
    <text x="62" y="162" font-family="Arial" font-size="14" fill="#0f172a" text-anchor="middle" font-weight="800">4</text>
    <text x="134" y="162" font-family="Arial" font-size="9" fill="#0f172a" text-anchor="middle" font-weight="800">12</text>
    <text x="62" y="177" font-family="Arial" font-size="7" fill="#475569" text-anchor="middle">Drivers</text>
    <rect x="100" y="143" width="68" height="44" rx="8" fill="#ede9fe"/>
    <text x="134" y="177" font-family="Arial" font-size="7" fill="#475569" text-anchor="middle">Pending</text>
    <!-- quick action btns -->
    <rect x="30" y="194" width="64" height="22" rx="8" fill="#3b82f6"/>
    <text x="62" y="208" font-family="Arial" font-size="7" fill="white" text-anchor="middle" font-weight="600">+ New Order</text>
    <rect x="100" y="194" width="68" height="22" rx="8" fill="#8b5cf6"/>
    <text x="134" y="208" font-family="Arial" font-size="7" fill="white" text-anchor="middle" font-weight="600">Optimize Route</text>
    <!-- recent orders list -->
    <text x="30" y="228" font-family="Arial" font-size="8" fill="#0f172a" font-weight="700">Recent Orders</text>
    <rect x="30" y="234" width="138" height="26" rx="6" fill="white" stroke="#e2e8f0" stroke-width="1"/>
    <text x="38" y="244" font-family="monospace" font-size="6" fill="#0f172a" font-weight="600">KF-2025-84729</text>
    <text x="38" y="253" font-family="Arial" font-size="6" fill="#64748b">Ravi Kumar</text>
    <text x="154" y="248" font-family="Arial" font-size="7" fill="#0f172a" text-anchor="end" font-weight="700">₹340</text>
    <rect x="119" y="240" width="32" height="10" rx="4" fill="#d1fae520"/>
    <text x="135" y="248" font-family="Arial" font-size="5" fill="#10b981" text-anchor="middle">delivered</text>
    <rect x="30" y="264" width="138" height="26" rx="6" fill="white" stroke="#e2e8f0" stroke-width="1"/>
    <text x="38" y="274" font-family="monospace" font-size="6" fill="#0f172a" font-weight="600">KF-2025-84728</text>
    <text x="38" y="283" font-family="Arial" font-size="6" fill="#64748b">Priya Singh</text>
    <text x="154" y="278" font-family="Arial" font-size="7" fill="#0f172a" text-anchor="end" font-weight="700">₹520</text>
    <rect x="116" y="270" width="36" height="10" rx="4" fill="#dbeafe20"/>
    <text x="134" y="278" font-family="Arial" font-size="5" fill="#3b82f6" text-anchor="middle">in_transit</text>
    <!-- tab bar -->
    <rect x="26" y="306" width="148" height="30" fill="url(#tabBar)" stroke="#e2e8f0" stroke-width="0.5"/>
    <text x="50" y="320" font-family="Arial" font-size="9" text-anchor="middle">🏠</text>
    <text x="50" y="330" font-family="Arial" font-size="5" fill="#3b82f6" text-anchor="middle" font-weight="600">Home</text>
    <text x="82" y="320" font-family="Arial" font-size="9" text-anchor="middle">📋</text>
    <text x="82" y="330" font-family="Arial" font-size="5" fill="#94a3b8" text-anchor="middle">Orders</text>
    <text x="114" y="320" font-family="Arial" font-size="9" text-anchor="middle">👥</text>
    <text x="114" y="330" font-family="Arial" font-size="5" fill="#94a3b8" text-anchor="middle">Drivers</text>
    <text x="146" y="320" font-family="Arial" font-size="9" text-anchor="middle">📦</text>
    <text x="146" y="330" font-family="Arial" font-size="5" fill="#94a3b8" text-anchor="middle">Stock</text>
  </g>
  <text x="100" y="374" font-family="Arial" font-size="9" fill="#64748b" text-anchor="middle" font-weight="600">Owner Dashboard</text>

  <!-- Phone 2: AI Forecast -->
  <g filter="url(#phoneShadow)">
    <rect x="196" y="20" width="160" height="340" rx="20" fill="#0f172a" stroke="#334155" stroke-width="2"/>
    <rect x="202" y="44" width="148" height="292" fill="#f8fafc"/>
    <rect x="246" y="26" width="60" height="12" rx="6" fill="#1e293b"/>
    <!-- header -->
    <rect x="202" y="44" width="148" height="44" fill="#4c1d95"/>
    <text x="276" y="61" font-family="Arial" font-size="9" fill="#c4b5fd" text-anchor="middle">AI Demand Forecast</text>
    <text x="276" y="76" font-family="Arial" font-size="7" fill="#7c3aed" text-anchor="middle">7-day prediction · Claude AI</text>
    <!-- Generate btn -->
    <rect x="218" y="92" width="120" height="20" rx="8" fill="#7c3aed"/>
    <text x="278" y="105" font-family="Arial" font-size="7" fill="white" text-anchor="middle" font-weight="600">⟳ Generate Forecast</text>
    <!-- Forecast card 1 - critical -->
    <rect x="210" y="118" width="132" height="60" rx="8" fill="white" stroke="#e2e8f0" stroke-width="1"/>
    <text x="218" y="131" font-family="Arial" font-size="8" fill="#0f172a" font-weight="700">Wheat Flour (Atta)</text>
    <rect x="290" y="122" width="44" height="13" rx="4" fill="#fee2e2"/>
    <text x="312" y="132" font-family="Arial" font-size="6" fill="#ef4444" text-anchor="middle" font-weight="700">CRITICAL</text>
    <rect x="214" y="137" width="36" height="30" rx="4" fill="#f8fafc"/>
    <text x="232" y="149" font-family="Arial" font-size="6" fill="#64748b" text-anchor="middle">Current</text>
    <text x="232" y="161" font-family="Arial" font-size="9" fill="#0f172a" text-anchor="middle" font-weight="800">50kg</text>
    <rect x="254" y="137" width="36" height="30" rx="4" fill="#fef3c7"/>
    <text x="272" y="149" font-family="Arial" font-size="6" fill="#64748b" text-anchor="middle">7-day</text>
    <text x="272" y="161" font-family="Arial" font-size="9" fill="#f59e0b" text-anchor="middle" font-weight="800">120kg</text>
    <rect x="294" y="137" width="40" height="30" rx="4" fill="#dbeafe"/>
    <text x="314" y="149" font-family="Arial" font-size="6" fill="#64748b" text-anchor="middle">Confidence</text>
    <text x="314" y="161" font-family="Arial" font-size="9" fill="#3b82f6" text-anchor="middle" font-weight="800">85%</text>
    <!-- Forecast card 2 - high -->
    <rect x="210" y="183" width="132" height="60" rx="8" fill="white" stroke="#e2e8f0" stroke-width="1"/>
    <text x="218" y="196" font-family="Arial" font-size="8" fill="#0f172a" font-weight="700">Cooking Oil</text>
    <rect x="294" y="186" width="40" height="13" rx="4" fill="#fef3c7"/>
    <text x="314" y="196" font-family="Arial" font-size="6" fill="#f59e0b" text-anchor="middle" font-weight="700">HIGH</text>
    <rect x="214" y="202" width="36" height="30" rx="4" fill="#f8fafc"/>
    <text x="232" y="214" font-family="Arial" font-size="6" fill="#64748b" text-anchor="middle">Current</text>
    <text x="232" y="226" font-family="Arial" font-size="9" fill="#0f172a" text-anchor="middle" font-weight="800">18L</text>
    <rect x="254" y="202" width="36" height="30" rx="4" fill="#fef3c7"/>
    <text x="272" y="214" font-family="Arial" font-size="6" fill="#64748b" text-anchor="middle">7-day</text>
    <text x="272" y="226" font-family="Arial" font-size="9" fill="#f59e0b" text-anchor="middle" font-weight="800">65L</text>
    <rect x="294" y="202" width="40" height="30" rx="4" fill="#dbeafe"/>
    <text x="314" y="226" font-family="Arial" font-size="9" fill="#3b82f6" text-anchor="middle" font-weight="800">78%</text>
    <!-- Forecast card 3 - medium -->
    <rect x="210" y="248" width="132" height="44" rx="8" fill="white" stroke="#e2e8f0" stroke-width="1"/>
    <text x="218" y="261" font-family="Arial" font-size="8" fill="#0f172a" font-weight="700">Tata Salt</text>
    <rect x="294" y="252" width="40" height="13" rx="4" fill="#dbeafe"/>
    <text x="314" y="262" font-family="Arial" font-size="6" fill="#3b82f6" text-anchor="middle" font-weight="700">MEDIUM</text>
    <text x="218" y="278" font-family="Arial" font-size="6" fill="#64748b">Stock: 42kg  →  Predicted: 38kg</text>
    <!-- tab bar -->
    <rect x="202" y="306" width="148" height="30" fill="white" stroke="#e2e8f0" stroke-width="0.5"/>
    <text x="226" y="325" font-family="Arial" font-size="5" fill="#94a3b8" text-anchor="middle">🏠 Home</text>
    <text x="258" y="325" font-family="Arial" font-size="5" fill="#94a3b8" text-anchor="middle">📋 Orders</text>
    <text x="290" y="325" font-family="Arial" font-size="5" fill="#94a3b8" text-anchor="middle">👥 Drivers</text>
    <text x="326" y="325" font-family="Arial" font-size="5" fill="#7c3aed" text-anchor="middle">📦 Stock</text>
  </g>
  <text x="276" y="374" font-family="Arial" font-size="9" fill="#64748b" text-anchor="middle" font-weight="600">AI Forecast Screen</text>

  <!-- Phone 3: Driver Map -->
  <g filter="url(#phoneShadow)">
    <rect x="372" y="20" width="160" height="340" rx="20" fill="#0f172a" stroke="#334155" stroke-width="2"/>
    <rect x="378" y="44" width="148" height="292" fill="#f8fafc"/>
    <rect x="422" y="26" width="60" height="12" rx="6" fill="#1e293b"/>
    <!-- header -->
    <rect x="378" y="44" width="148" height="44" fill="#92400e"/>
    <text x="452" y="61" font-family="Arial" font-size="10" fill="white" text-anchor="middle" font-weight="800">Delivery Route</text>
    <text x="452" y="76" font-family="Arial" font-size="7" fill="#fbbf24" text-anchor="middle">Map view · optimized stops</text>
    <!-- mini map -->
    <rect x="384" y="92" width="136" height="100" rx="8" fill="#e5e7eb"/>
    <!-- map roads -->
    <line x1="384" y1="142" x2="520" y2="142" stroke="white" stroke-width="3"/>
    <line x1="420" y1="92" x2="420" y2="192" stroke="white" stroke-width="3"/>
    <!-- route polyline -->
    <polyline points="395,175 420,155 450,135 480,148 505,125" stroke="#3b82f6" stroke-width="2.5" stroke-dasharray="4,3" fill="none"/>
    <!-- markers -->
    <circle cx="395" cy="175" r="7" fill="#10b981"/>
    <text x="395" y="178" font-family="Arial" font-size="7" fill="white" text-anchor="middle">🏪</text>
    <circle cx="450" cy="135" r="8" fill="#f59e0b" stroke="white" stroke-width="2"/>
    <text x="450" y="138" font-family="Arial" font-size="8" text-anchor="middle">🛵</text>
    <circle cx="505" cy="125" r="7" fill="#3b82f6"/>
    <text x="505" y="128" font-family="Arial" font-size="7" fill="white" text-anchor="middle">📍</text>
    <!-- map info -->
    <text x="392" y="186" font-family="Arial" font-size="6" fill="#374151">3 stops · 4.5 km · ~36 min</text>
    <!-- stop cards -->
    <rect x="384" y="197" width="136" height="28" rx="6" fill="white" stroke="#e2e8f0" stroke-width="1"/>
    <circle cx="396" cy="211" r="8" fill="#3b82f6"/>
    <text x="396" y="214" font-family="Arial" font-size="7" fill="white" text-anchor="middle" font-weight="700">1</text>
    <text x="408" y="208" font-family="Arial" font-size="7" fill="#0f172a" font-weight="600">Ravi Kumar</text>
    <text x="408" y="218" font-family="Arial" font-size="6" fill="#64748b">12 MG Road, Sector 4</text>
    <rect x="487" y="202" width="28" height="16" rx="4" fill="#f0fdf4" stroke="#10b981" stroke-width="1"/>
    <text x="501" y="213" font-family="Arial" font-size="6" fill="#10b981" text-anchor="middle">Deliver</text>

    <rect x="384" y="229" width="136" height="28" rx="6" fill="white" stroke="#e2e8f0" stroke-width="1"/>
    <circle cx="396" cy="243" r="8" fill="#3b82f6"/>
    <text x="396" y="246" font-family="Arial" font-size="7" fill="white" text-anchor="middle" font-weight="700">2</text>
    <text x="408" y="240" font-family="Arial" font-size="7" fill="#0f172a" font-weight="600">Priya Singh</text>
    <text x="408" y="250" font-family="Arial" font-size="6" fill="#64748b">45 Park Avenue, Opp ATM</text>
    <rect x="487" y="234" width="28" height="16" rx="4" fill="#f0fdf4" stroke="#10b981" stroke-width="1"/>
    <text x="501" y="245" font-family="Arial" font-size="6" fill="#10b981" text-anchor="middle">Deliver</text>

    <rect x="384" y="261" width="136" height="28" rx="6" fill="white" stroke="#e2e8f0" stroke-width="1"/>
    <circle cx="396" cy="275" r="8" fill="#3b82f6"/>
    <text x="396" y="278" font-family="Arial" font-size="7" fill="white" text-anchor="middle" font-weight="700">3</text>
    <text x="408" y="272" font-family="Arial" font-size="7" fill="#0f172a" font-weight="600">Suresh Verma</text>
    <text x="408" y="282" font-family="Arial" font-size="6" fill="#64748b">7 Gandhi Nagar Colony</text>
    <rect x="487" y="266" width="28" height="16" rx="4" fill="#f0fdf4" stroke="#10b981" stroke-width="1"/>
    <text x="501" y="277" font-family="Arial" font-size="6" fill="#10b981" text-anchor="middle">Deliver</text>

    <!-- tab bar -->
    <rect x="378" y="306" width="148" height="30" fill="white" stroke="#e2e8f0" stroke-width="0.5"/>
    <text x="400" y="325" font-family="Arial" font-size="5" fill="#94a3b8" text-anchor="middle">🏠 Home</text>
    <text x="430" y="325" font-family="Arial" font-size="5" fill="#94a3b8" text-anchor="middle">📋 Orders</text>
    <text x="462" y="325" font-family="Arial" font-size="5" fill="#f97316" text-anchor="middle" font-weight="700">🗺️ Map</text>
    <text x="498" y="325" font-family="Arial" font-size="5" fill="#94a3b8" text-anchor="middle">📊 History</text>
  </g>
  <text x="452" y="374" font-family="Arial" font-size="9" fill="#64748b" text-anchor="middle" font-weight="600">Driver Route Map</text>

  <!-- Phone 4: Tracking PWA -->
  <g filter="url(#phoneShadow)">
    <rect x="548" y="20" width="160" height="340" rx="20" fill="#0f172a" stroke="#334155" stroke-width="2"/>
    <rect x="554" y="44" width="148" height="292" fill="#0f172a"/>
    <rect x="598" y="26" width="60" height="12" rx="6" fill="#1e293b"/>
    <!-- Glass card - store header -->
    <rect x="560" y="50" width="136" height="56" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1"/>
    <circle cx="577" cy="68" r="9" fill="#3b82f6"/>
    <text x="577" y="72" font-family="Arial" font-size="7" fill="white" text-anchor="middle" font-weight="700">KF</text>
    <text x="620" y="64" font-family="Arial" font-size="8" fill="white" font-weight="700">Sharma Kirana</text>
    <text x="620" y="74" font-family="monospace" font-size="7" fill="#94a3b8">KF-2025-84729</text>
    <rect x="562" y="82" width="60" height="14" rx="6" fill="#10b981" opacity="0.2"/>
    <text x="592" y="92" font-family="Arial" font-size="6" fill="#10b981" text-anchor="middle">🛵 On the Way</text>
    <!-- Status steps -->
    <rect x="560" y="112" width="136" height="28" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1"/>
    <circle cx="574" cy="126" r="5" fill="#10b981"/>
    <text x="574" y="129" font-family="Arial" font-size="6" fill="white" text-anchor="middle">✓</text>
    <line x1="579" y1="126" x2="591" y2="126" stroke="#10b981" stroke-width="1.5"/>
    <circle cx="596" cy="126" r="5" fill="#10b981"/>
    <text x="596" y="129" font-family="Arial" font-size="6" fill="white" text-anchor="middle">✓</text>
    <line x1="601" y1="126" x2="613" y2="126" stroke="#10b981" stroke-width="1.5"/>
    <circle cx="618" cy="126" r="5" fill="#3b82f6" stroke="#60a5fa" stroke-width="1.5"/>
    <text x="618" y="129" font-family="Arial" font-size="6" fill="white" text-anchor="middle">🛵</text>
    <line x1="623" y1="126" x2="635" y2="126" stroke="#475569" stroke-width="1.5"/>
    <circle cx="640" cy="126" r="5" fill="#334155"/>
    <text x="640" y="129" font-family="Arial" font-size="6" fill="#64748b" text-anchor="middle">🎉</text>
    <!-- ETA section -->
    <rect x="560" y="146" width="136" height="38" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1"/>
    <text x="628" y="163" font-family="Arial" font-size="11" fill="white" text-anchor="middle" font-weight="800">~12 min</text>
    <text x="628" y="177" font-family="Arial" font-size="6" fill="#64748b" text-anchor="middle">Ramesh is on the way</text>
    <!-- Leaflet Map -->
    <rect x="560" y="190" width="136" height="80" rx="8" fill="#e5e7eb"/>
    <rect x="560" y="190" width="136" height="80" rx="8" fill="#d1d5db" opacity="0.3"/>
    <!-- roads -->
    <line x1="560" y1="230" x2="696" y2="230" stroke="white" stroke-width="2.5"/>
    <line x1="620" y1="190" x2="620" y2="270" stroke="white" stroke-width="2.5"/>
    <!-- route polyline -->
    <polyline points="568,258 595,240 620,225 650,235 680,210" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4,3" fill="none"/>
    <!-- store marker -->
    <rect x="562" y="252" width="12" height="12" rx="3" fill="#10b981"/>
    <text x="568" y="261" font-family="Arial" font-size="7" text-anchor="middle">🏪</text>
    <!-- customer marker -->
    <rect x="675" y="204" width="12" height="12" rx="3" fill="#3b82f6"/>
    <text x="681" y="213" font-family="Arial" font-size="7" text-anchor="middle">📍</text>
    <!-- driver marker (pulsing) -->
    <circle cx="640" cy="232" r="8" fill="#f59e0b" stroke="white" stroke-width="2"/>
    <text x="640" y="235" font-family="Arial" font-size="8" text-anchor="middle">🛵</text>
    <!-- Action buttons -->
    <rect x="562" y="276" width="62" height="18" rx="6" fill="#3b82f6"/>
    <text x="593" y="288" font-family="Arial" font-size="6" fill="white" text-anchor="middle" font-weight="600">📞 Call Store</text>
    <rect x="630" y="276" width="64" height="18" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
    <text x="662" y="288" font-family="Arial" font-size="6" fill="#94a3b8" text-anchor="middle" font-weight="600">💬 WhatsApp</text>
    <!-- theme toggle -->
    <circle cx="688" cy="54" r="8" fill="#1e293b" stroke="#334155" stroke-width="1"/>
    <text x="688" y="57" font-family="Arial" font-size="7" text-anchor="middle">🌙</text>
    <!-- bottom safe area -->
    <rect x="554" y="310" width="148" height="26" fill="#1e293b" rx="0"/>
    <rect x="596" y="320" width="56" height="4" rx="2" fill="#334155"/>
  </g>
  <text x="628" y="374" font-family="Arial" font-size="9" fill="#64748b" text-anchor="middle" font-weight="600">Customer Tracking PWA</text>
</svg>
</div>

---

## Stack

| Layer | Technology | Why |
|---|---|---|
| Backend runtime | Node.js 20 + Express | Lightweight, fast enough for this scale |
| ORM | Prisma 5 | Type-safe queries, clean migrations, schema as source of truth |
| Database | PostgreSQL 16 | Decimal precision for coordinates and money, proper enum types |
| Cache / Queues | Redis 7 + Bull | Job queues for forecasts and reports, rate-limit storage |
| Real-time | Socket.io 4 | Rooms per store, per driver, per order — fits the data model exactly |
| AI | Claude API (claude-sonnet-4) | WhatsApp order parsing, demand forecasting, weekly insights |
| WhatsApp | Twilio | Webhook ingestion and outbound messaging |
| Route optimization | Google Route Optimization API | Real VRP solver, falls back to mock in dev |
| Mobile | React Native (Expo 51) | Single codebase for iOS, Android, owner, and driver |
| State management | Zustand | Auth state, token storage |
| Server state | TanStack Query | Caching, background refresh, loading states |
| Internationalization | i18next | Hindi and English, string keys throughout |
| Tracking PWA | Next.js 14 App Router | SSR-safe lazy-loaded Leaflet map |
| Maps (PWA) | react-leaflet + OpenStreetMap | No API key required for the customer-facing page |
| Containerization | Docker Compose | `docker-compose up` and you're running |

---

## Getting started

### Prerequisites

- Docker + Docker Compose
- Node.js 20+ (for local dev without Docker)
- A Twilio account (optional — WhatsApp bot won't work without it)
- An Anthropic API key (optional — AI features fall back to mocks)
- A Google Cloud project with Route Optimization API enabled (optional)

### With Docker (recommended)

```bash
git clone https://github.com/sat1828/KiranaFlow.git
cd KiranaFlow
docker-compose up
```

That starts PostgreSQL on `:5432`, Redis on `:6379`, the API on `:3000`, and pgAdmin on `:5050`. The API container runs `prisma migrate deploy` on boot.

### Without Docker

```bash
# Terminal 1: start the API
cd backend
cp .env.example .env        # fill in DATABASE_URL, REDIS_URL, JWT secrets
npm install
npx prisma migrate dev
node prisma/seed.js         # optional seed data
npm run dev

# Terminal 2: start the tracking PWA
cd tracking-pwa
npm install
npm run dev                 # http://localhost:3001

# Terminal 3: start the mobile app
cd mobile-app
npm install
npx expo start
```

### Environment variables

The backend reads from `.env`. Minimum required:

```
DATABASE_URL=postgresql://kiranaflow:kiranaflow@localhost:5432/kiranaflow
REDIS_URL=redis://localhost:6379
JWT_SECRET=at-least-32-chars-random-string
JWT_REFRESH_SECRET=different-at-least-32-chars-string
```

Optional (features degrade gracefully without them):

```
ANTHROPIC_API_KEY=sk-ant-...             # AI order parsing, forecasting, insights
TWILIO_ACCOUNT_SID=AC...                 # WhatsApp bot inbound/outbound
TWILIO_AUTH_TOKEN=...                    # WhatsApp bot inbound/outbound
TWILIO_WHATSAPP_NUMBER=+1415...          # WhatsApp bot inbound/outbound
GOOGLE_MAPS_API_KEY=AIza...              # Directions API
GOOGLE_ROUTE_OPTIMIZATION_KEY=...        # Route optimization
GOOGLE_PROJECT_ID=...                    # Route optimization
```

---

## API routes

```
POST   /api/auth/send-otp
POST   /api/auth/verify-otp
POST   /api/auth/refresh
POST   /api/auth/logout

GET    /api/store/dashboard
GET    /api/store/profile
PUT    /api/store/profile

GET    /api/orders
POST   /api/orders
GET    /api/orders/:id
PATCH  /api/orders/:id/status
POST   /api/orders/:id/assign

GET    /api/drivers
POST   /api/drivers
PATCH  /api/drivers/:id/duty

GET    /api/routes/batches
POST   /api/routes/optimize
POST   /api/routes/batches
PATCH  /api/routes/batches/:id/start

GET    /api/inventory
POST   /api/inventory
PATCH  /api/inventory/:id

GET    /api/ai/forecast
POST   /api/ai/forecast/run
GET    /api/ai/insights
GET    /api/reports/daily
GET    /api/reports/weekly

POST   /api/webhook/whatsapp           # Twilio webhook
GET    /api/track/:orderId             # Public, no auth
GET    /health
```

---

## Database subscriptions plan

The `Store` model has a `subscriptionPlan` enum — `free | basic | pro`. The schema and seed are in place. Gating logic per plan is a natural next step.

---

## What's not here yet

- Push notifications — `fcmToken` is on the `Driver` model, the wiring to Firebase is not done
- Proof of delivery photo upload — `proofOfDeliveryUrl` exists on `Order`, Multer is installed, the upload endpoint isn't wired yet
- Customer-facing order history — the `Customer` model tracks `orderCount` and `lastOrderAt` but there's no customer portal
- Payment gateway — UPI is in the enum, the actual Razorpay/PayU integration is a stub

---

## License

MIT
