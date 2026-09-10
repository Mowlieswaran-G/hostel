<div align="center">

# 🏠 SmartHostel

### Transparent, fair, and secure hostel management for Residents, Wardens & Technicians

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express%205-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#license)

**[🚀 Live Demo](https://bookmybedbitsathy.vercel.app)**

</div>

---

SmartHostel is a role-based web application for managing day-to-day hostel operations: room
booking, maintenance requests, outing requests, announcements, and a complaint heatmap for
technicians. The frontend is a React SPA that talks directly to **Firebase (Auth + Firestore)**
for data and identity, with a lightweight **Express** service scaffolded for future/custom API
endpoints.

## 🔗 Live Demo

> 👉 **[https://bookmybedbitsathy.vercel.app](https://bookmybedbitsathy.vercel.app)**

## 📑 Table of Contents

- [Live Demo](#-live-demo)
- [Features](#-features)
- [Tech Stack](#1-tech-stack)
- [Project Structure](#2-project-structure)
- [Architecture](#3-architecture--how-the-pieces-talk-to-each-other)
- [Prerequisites](#4-prerequisites)
- [Environment Variables](#5-environment-variables)
- [Installation](#6-installation)
- [Seeding Firestore](#7-seeding-firestore-with-demo-data)
- [Running Locally](#8-running-the-app-locally)
- [Execution Flow](#9-end-to-end-execution-flow)
- [Notes & Recommendations](#10-notes--recommendations)
- [Contributing](#contributing)
- [License](#license)

## 📸 Preview

<div align="center">
  <img src="./docs/Screenshot 2026-09-10 102759.png" alt="SmartHostel dashboard preview" width="800" />
</div>

> Add a real screenshot or GIF at `docs/screenshot-dashboard.png` (create the `docs/` folder in
> your repo and drop the image in) — GitHub will render it inline above once pushed. A short
> screen-recording GIF of the booking/approval flow works even better than a static image.

## ✨ Features

**Resident**
- 🔍 Browse rooms and submit group booking requests
- 🛠️ Raise maintenance requests with category & priority
- 🧳 Request outings and track approval status
- 📢 View hostel announcements

**Warden**
- ✅ Approve / reject room bookings, adjusting live occupancy
- 🧰 Assign technicians to maintenance requests and track resolution
- 🚦 Approve / reject resident outing requests
- 📣 Post announcements to all residents

**Technician**
- 📋 View and self-accept assigned maintenance tasks
- 🔥 Visualise complaint density by room/floor on a heatmap

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, React Router DOM 7, Tailwind CSS 4 |
| State/Data | React Context (`AuthContext`, `DataContext`), Firebase Firestore (real-time-style reads) |
| Auth | Firebase Authentication |
| HTTP client | Axios (for calls to the Express API, if/when used) |
| Charts | Recharts |
| UI helpers | Headless UI, React Icons, React Hot Toast |
| Backend | Node.js, Express 5 |
| Backend auth/data | Firebase Admin SDK, express-validator |
| Linting | Oxlint |
| Deployment | Vercel (client), Node host of your choice (server) |

---

## 2. Project Structure

The repository is split into two independently-run apps plus a set of maintenance/tooling
scripts at the root:

```
hostel/
├── client/                        # React + Vite frontend ("SmartHostel" UI)
│   ├── src/
│   │   ├── main.jsx                # App entry point, mounted into index.html #root
│   │   ├── App.jsx                 # Route table (role-based routes)
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Firebase auth state, current user, profile, role
│   │   │   └── DataContext.jsx     # Central Firestore data store (rooms, requests, etc.)
│   │   ├── firebase/
│   │   │   └── config.js           # Firebase app + Firestore + Auth initialization
│   │   ├── services/
│   │   │   └── booking.js          # createBooking / approveBooking / rejectBooking helpers
│   │   ├── components/             # Navbar, Modal, Skeleton, StatusBadge, DashboardGreeting…
│   │   └── pages/
│   │       ├── Resident/           # ResidentDashboard, RoomBooking, MyBookings,
│   │       │                       # MaintenanceRequest, OutingRequest
│   │       ├── Warden/             # BookingApproval, MaintenanceMgmt, OutingApproval
│   │       └── Technician/         # TechnicianDashboard, HeatmapPage
│   ├── index.html
│   ├── vite.config.js               # Dev server (port 3000) + /api proxy to :5000
│   ├── tailwind.config.js
│   ├── vercel.json                  # SPA rewrite rules for Vercel
│   ├── .oxlintrc.json
│   ├── .env                         # VITE_* Firebase config + API base URL
│   └── package.json
│
├── server/                         # Express backend (SmartHostel Backend API)
│   ├── index.js                     # App bootstrap, CORS, JSON body parsing, health route
│   ├── .env                         # PORT, Firebase Admin credentials (not included in repo)
│   └── package.json
│
└── scripts/ (repo root)
    ├── seedRooms.mjs                # Populates Firestore `rooms` collection (30 rooms)
    ├── seedAll.mjs                  # Seeds maintenanceRequests, outingRequests,
    │                                 # announcements, bookingGroups with demo data
    ├── migrateToContext.cjs         # One-off codegen: rewrote several pages to use
    │                                 # the shared DataContext instead of ad-hoc fetches
    └── addSkeletons.cjs             # One-off codegen: swapped "Loading..." text for
                                      # <Skeleton /> placeholders across pages
```

> The `migrateToContext.cjs` and `addSkeletons.cjs` scripts are **developer tooling**, not part
> of the running app. They were used once to batch-edit source files during development and are
> safe to ignore unless you're doing a similar refactor.

---

## 3. Architecture — How the Pieces Talk to Each Other

```
┌─────────────────────────────┐
│        Browser (SPA)        │
│  React + Vite (port 3000)   │
└──────────────┬───────────────┘
               │
   ┌───────────┼─────────────────────────────┐
   │           │                             │
   ▼           ▼                             ▼
Firebase    Firebase                  Express API (port 5000)
  Auth      Firestore                 (via Axios, /api/* → proxied
(login/     (rooms, bookingGroups,     by Vite dev server)
 signup)     maintenanceRequests,
             outingRequests,
             announcements)
```

- **Authentication**: The client uses the Firebase Auth SDK directly (`src/firebase/config.js`).
  `AuthContext` listens to `onAuthStateChanged`, fetches the user's role/profile, and exposes
  `user`, `profile`, and role helpers to the rest of the app.
- **Data**: `DataContext` is the single source of truth for Firestore collections
  (`rooms`, `bookingGroups`, `maintenanceRequests`, `outingRequests`, `announcements`). Pages
  consume this via `useData()` and call `refreshCollection('<name>')` after a write so the UI
  reflects the latest state (there's no live `onSnapshot` — refresh is explicit, triggered after
  actions like approve/reject/assign).
- **Backend (Express)**: Currently a minimal scaffold — CORS, JSON parsing, dotenv, and a single
  health-check route (`GET /` → `{status: "ok"}`). It's wired up with `firebase-admin` and
  `express-validator` as dependencies, meaning it's intended to host privileged operations
  (e.g. server-verified writes, admin-only actions) that shouldn't be trusted to client-side
  Firestore rules alone — but as shipped, most reads/writes happen straight from the client to
  Firestore.
- **Dev proxy**: In development, `vite.config.js` proxies any request to `/api/*` on
  `localhost:3000` to `http://localhost:5000` (stripping the `/api` prefix), so the client can
  call the Express server without CORS friction while developing.

---

## 4. Prerequisites

- **Node.js** v18+ (v20 recommended) and npm
- A **Firebase project** with:
  - **Authentication** enabled (Email/Password, or whichever provider(s) the app uses)
  - **Firestore Database** created (in Native mode)
- (Optional, for the Express server's admin features) a **Firebase Admin service account** JSON

---

## 5. Environment Variables

### `client/.env`

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_BASE_URL=http://localhost:5000
```

> These `VITE_FIREBASE_*` values come from **Firebase Console → Project Settings → Your apps →
> SDK setup and configuration**. They identify a client-side web app and are safe to ship in a
> frontend bundle — access is actually controlled by your **Firestore Security Rules**, not by
> keeping this config secret. Still, avoid committing a real `.env` to a public repo as a matter
> of hygiene, and make sure your Firestore rules restrict reads/writes by role before going live.

### `server/.env`

```env
PORT=5000
# If/when you wire up firebase-admin routes, also add:
# GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
# or the individual FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY vars
```

The Admin SDK credentials **must** stay server-side and out of version control — this is the one
secret in the stack that actually needs protecting.

---

## 6. Installation

Clone the repo, then install each app's dependencies separately:

```bash
git clone https://github.com/Mowlieswaran-G/hostel.git
cd hostel

# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

---

## 7. Seeding Firestore with Demo Data

The root-level `.mjs` scripts populate Firestore directly using the Firebase client SDK
(they reuse the same config as `client/.env`, hard-coded inline). Run them from wherever
they live in your checkout, with Node's ES module support:

```bash
# 1. Seed the rooms collection (3 floors × 10 rooms, random occupancy)
node seedRooms.mjs

# 2. Seed maintenance requests, outing requests, announcements, and booking groups
node seedAll.mjs
```

`seedAll.mjs` **clears each target collection before reseeding it**, so re-running it is safe
for demo/dev purposes but destructive to any real data in those collections — don't run it
against a production project.

---

## 8. Running the App Locally

You need **two terminals** — the client and server run independently.

**Terminal 1 — Backend**
```bash
cd server
npm run dev        # nodemon index.js → http://localhost:5000
```

**Terminal 2 — Frontend**
```bash
cd client
npm run dev         # vite → http://localhost:3000
```

Open **http://localhost:3000** in your browser. Sign up / log in (Firebase Auth), and you'll be
routed to the dashboard matching your account's role (Resident / Warden / Technician).

Other client scripts:
```bash
npm run build       # production build → client/dist
npm run preview     # preview the production build locally
npm run lint         # run Oxlint
```

Other server scripts:
```bash
npm start           # node index.js (no auto-reload)
```

---

## 9. End-to-End Execution Flow

### 9.1 App bootstrap
1. Browser loads `index.html`, which mounts `src/main.jsx` into `<div id="root">`.
2. `main.jsx` wraps the app in `AuthContext` and `DataContext` providers, then renders `App.jsx`.
3. `AuthContext` subscribes to Firebase's `onAuthStateChanged`. If a session exists, it loads the
   user's profile/role from Firestore; otherwise the user is treated as logged out.
4. `App.jsx`'s router redirects unauthenticated users to the login/signup screen, and
   authenticated users to the dashboard for their role (`/resident`, `/warden`, or `/technician`).

### 9.2 Login / Signup
1. User submits credentials → client calls Firebase Auth SDK (`signInWithEmailAndPassword` /
   `createUserWithEmailAndPassword`) directly — no round-trip to the Express server.
2. On success, Firebase issues a session; `AuthContext` picks up the auth-state change, fetches
   the matching user profile document from Firestore, and stores the resolved `role`.
3. The router re-evaluates and sends the user to their role's dashboard.

### 9.3 Dashboard data load
1. On mount, dashboard pages call `useData()` from `DataContext`.
2. `DataContext` fetches the relevant Firestore collections once and exposes them (`rooms`,
   `bookingGroups`, `maintenanceRequests`, `outingRequests`, `announcements`) along with a
   `ready` flag pages use to show `<Skeleton />` placeholders while loading.
3. Pages filter/derive stats client-side (e.g. counts of pending/approved/resolved) rather than
   querying Firestore multiple times.

### 9.4 Room booking flow (Resident → Warden)
1. **Resident** opens *Room Booking*, browses `rooms` (colour-coded by occupancy), and clicks
   **Book** on an available room, entering optional group members' roll numbers.
2. Client calls `createBooking()` (`src/services/booking.js`), which writes a new document to
   the `bookingGroups` collection with `status: 'pending'`.
3. `DataContext.refreshCollection('bookingGroups')` re-fetches so *My Bookings* reflects the new
   pending request immediately.
4. **Warden** opens *Booking Approval*, sees the pending row, and clicks **Approve** or
   **Reject**.
   - Approve → `approveBooking()` updates the booking's status to `approved` **and** increments
     the room's `occupiedBeds` by the group's member count.
   - Reject → `rejectBooking()` sets `status: 'rejected'`.
5. Both collections (`bookingGroups`, `rooms`) are refreshed so occupancy figures and booking
   status update across the app without a full page reload.

### 9.5 Maintenance request flow (Resident → Technician/Warden)
1. **Resident** submits a request (category, issue description, priority) from
   *Maintenance Request* → writes to `maintenanceRequests` with `status: 'pending'`.
2. **Warden** (*Maintenance Mgmt*) or **Technician** (*Technician Dashboard*) sees the new
   pending item, assigns a technician (Warden) or self-accepts (Technician), which sets
   `status: 'inProgress'` and `assignedTo`.
3. Once fixed, the technician marks it **Resolve**, setting `status: 'resolved'` and
   `resolvedAt`.
4. The *Heatmap* page (Technician) aggregates `maintenanceRequests` by room/floor to visualise
   which rooms generate the most complaints.

### 9.6 Outing request flow (Resident → Warden)
1. **Resident** submits an outing request (destination, out date, return date, reason) →
   written to `outingRequests` with `status: 'pending'`.
2. **Warden** reviews pending requests in *Outing Approval* and clicks **Approve** or **Reject**
   (rejection can include a reason), updating the document's `status`.
3. The resident sees the updated status reflected on their own dashboard/history view.

### 9.7 Announcements
- Wardens post announcements (title, body, priority) which are stored in the `announcements`
  collection and surfaced to all roles on their respective dashboards, most-recent first.

### 9.8 Production build & deploy
1. `npm run build` in `client/` runs Vite's production build, code-splitting vendor libraries
   (`react`/`react-router-dom`, `firebase`, `recharts`) into separate chunks per
   `vite.config.js`'s `manualChunks`.
2. Deploying `client/` to **Vercel**: `vercel.json` rewrites every path to `/index.html`, which is
   required for a client-side-routed SPA (React Router) so deep links and refreshes don't 404.
3. `server/` can be deployed to any Node host (Render, Railway, a VM, etc.) — it's a standard
   Express app started with `npm start`. Update `VITE_API_BASE_URL` in the client's environment
   to point at that deployed backend URL.

---

## 10. Notes & Recommendations

- **Firestore Security Rules** are the actual access-control boundary for this architecture
  since the client talks to Firestore directly — make sure rules restrict writes by
  authenticated role (e.g. only wardens can update `status` on bookings/requests) before
  deploying publicly.
- The Express server is currently a thin scaffold; if you move privileged logic there (e.g.
  approvals verified server-side with `firebase-admin`), remember to also lock down the
  corresponding Firestore rules so the same actions can't be performed directly from the client.
- `seedAll.mjs` and `seedRooms.mjs` hard-code Firebase config inline — keep them pointed at a
  dev/staging project only.

---

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "feat: add your feature"`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Please keep PRs focused and run `npm run lint` in `client/` before submitting.

## License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

Made with 💜 for better hostel living

</div>
