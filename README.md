<div align="center">

# 🏠 SmartHostel

### Transparent, Fair, and Intelligent Hostel Management System

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express%205-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-TiDB%20Cloud%20MySQL-0052CC?logo=mysql&logoColor=white)](https://tidbcloud.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Authentication-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Deployed on Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?logo=vercel&logoColor=white)](https://bookmyroom-zyro.vercel.app)
[![Deployed on Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render&logoColor=black)](https://smarthostel-api.onrender.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#license)

**[🚀 Live Demo](https://bookmyroom-zyro.vercel.app)** &nbsp;•&nbsp; **[⚡ API Backend](https://smarthostel-api.onrender.com)**

</div>

---

**SmartHostel** is a modern, full-stack, role-based web application designed to streamline daily hostel operations. It empowers **Residents**, **Wardens**, and **Technicians** through intuitive workflows for room booking, live room & occupancy management, maintenance reporting with complaint heatmaps, outing approvals, and campus-wide announcements.

The application combines a high-performance **React 19 SPA (Vercel)** with a robust **Node.js/Express 5 REST API (Render)** and a resilient cloud-native relational database powered by **TiDB Cloud (Serverless MySQL)** with **Firebase Authentication** for identity management.

---

## 🔗 Live Deployments

| Component | Platform | URL |
|---|---|---|
| **Frontend Web App** | **Vercel** | [https://bookmyroom-zyro.vercel.app](https://bookmyroom-zyro.vercel.app) |
| **Backend REST API** | **Render** | [https://smarthostel-api.onrender.com](https://smarthostel-api.onrender.com) |
| **Cloud Database** | **TiDB Cloud (AWS ap-southeast-1)** | Serverless MySQL Cluster (SSL/TLS 1.2) |

---

## 📑 Table of Contents

- [Live Deployments](#-live-deployments)
- [Preview](#-preview)
- [Key Features by Role](#-key-features-by-role)
- [Tech Stack](#1-tech-stack)
- [Architecture & System Flow](#2-architecture--system-flow)
  - [Visual System Flowchart](#21-visual-system-flowchart)
  - [Understanding the Architecture in Plain English](#22-understanding-the-architecture-in-plain-english)
  - [End-to-End Real-World User Journeys](#23-end-to-end-real-world-user-journeys)
- [Project Structure](#3-project-structure)
- [REST API Endpoints](#4-rest-api-endpoints)
- [Environment Variables](#5-environment-variables)
- [Installation & Local Setup](#6-installation--local-setup)
- [Database Initialization & Seeding](#7-database-initialization--seeding)
- [Running Locally](#8-running-the-app-locally)
- [Contributing](#contributing)
- [License](#license)

---

## 📸 Preview

<div align="center">
  <img src="./Screenshot 2026-09-10 102759.png" alt="SmartHostel Dashboard Preview" width="850" />
</div>

---

## ✨ Key Features by Role

### 👨‍🎓 Resident
- **Room Booking**: Real-time room availability browser with live occupancy visualizer; support for group bookings with co-resident roll numbers.
- **My Bookings**: Real-time status tracking for pending, approved, or rejected room reservations.
- **Maintenance Requests**: Instant issue reporting categorized by discipline (Electrical, Plumbing, Furniture, Wi-Fi, Cleaning) with custom urgency/priority levels.
- **Outing Requests**: Digital gate-pass requests with departure/arrival timestamps, destination, and purpose tracking.
- **Announcements**: Broadcast board for critical notices and administrative updates.

### 🛡️ Warden
- **Live Room Management**: Complete control to add rooms, configure capacities, update tariffs, free up occupied rooms, and delete rooms.
- **Booking Approvals**: Review room applications; single-click approval atomically updates room bed occupancy via MySQL transactions.
- **Maintenance Management**: Assign complaints to specific technicians and track resolution lifecycles.
- **Outing Approvals**: Approve or reject outing gate-passes with optional rejection explanations.
- **Announcements**: Post priority notices (Normal, Important, Urgent) accessible by all residents and staff.

### 🔧 Technician
- **Task Management Portal**: Dedicated dashboard displaying all unassigned and assigned maintenance tasks.
- **Resolution Workflow**: Self-assign complaints, add resolution notes, and mark tasks as resolved with completion timestamps.
- **Complaint Heatmap**: Visual floor-by-floor and room-by-room complaint density analysis powered by Recharts to pinpoint recurrent maintenance hotspots.

---

## 1. Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend Framework** | **React 19.2** + **Vite 8.2** | High-performance SPA with client-side routing & code-splitting |
| **Styling & UI** | **Tailwind CSS 4.3** | Custom glassmorphism, responsive dark/light modes, micro-animations |
| **UI Components** | **Headless UI**, **React Icons**, **React Hot Toast** | Accessible dialogs, toast notifications, icon suites |
| **Data Visualization** | **Recharts 3.10** | Heatmaps and complaint density distribution charts |
| **Client State Management** | **React Context API** | Centralized `AuthContext`, `DataContext`, and `ThemeContext` |
| **HTTP Client** | **Axios** | Configured with automatic Firebase Bearer Token authentication interceptor |
| **Backend API** | **Node.js** + **Express 5.2** | Structured REST API with CORS, route splitting, and error handling |
| **Database** | **TiDB Cloud (Serverless MySQL)** | Distributed MySQL-compatible cloud database with connection pooling & TLS |
| **Database Driver** | **mysql2/promise** | Asynchronous promise-based connection pool with SSL support |
| **Authentication** | **Firebase Auth** | Google Sign-in & email auth with automated backend profile sync |
| **Deployment** | **Vercel** & **Render** | Frontend continuous deployment on Vercel; Express API hosted on Render |

---

## 2. Architecture & System Flow

### 2.1 Visual System Flowchart

Here is the entire system at a glance — showing how users, the frontend web app, security authentication, backend server, and cloud database connect together:

```mermaid
flowchart TD
    subgraph USERS ["👥 1. Users (Role-Based Access)"]
        R["👨‍🎓 Resident (Student)<br/>• Browse & book rooms<br/>• Raise repair tickets<br/>• Request outing gate-pass"]
        W["🛡️ Warden (Admin)<br/>• Approve / reject room bookings<br/>• Manage room beds & capacity<br/>• Assign technicians & post notices"]
        T["🔧 Technician (Staff)<br/>• View repair work queue<br/>• Self-assign & resolve issues<br/>• Analyze complaint heatmap"]
    end

    subgraph FRONTEND ["💻 2. Frontend Web App (React 19 + Vite • Deployed on Vercel)"]
        UI["SmartHostel Web Application<br/>• Fast, responsive dashboards tailored to each role<br/>• Live room occupancy visualizer & form validations<br/>• Instant state updates via React Context"]
    end

    subgraph AUTH ["🔑 3. Identity & Security (Firebase Auth)"]
        AUTH_SYS["Firebase Authentication<br/>• Secure Google Sign-In & credential check<br/>• Generates verified digital tokens (JWT)"]
    end

    subgraph BACKEND ["⚙️ 4. Backend REST API (Node.js & Express 5 • Deployed on Render)"]
        API["Express REST API Server<br/>• Enforces hostel business rules & checks permissions<br/>• Atomic bed reservation (prevents overbooking)<br/>• Routes repairs, outing gate-passes & announcements"]
    end

    subgraph DATABASE ["🗄️ 5. Cloud Database (TiDB Cloud Serverless MySQL)"]
        DB[("Persistent Cloud Relational Database<br/>• users (profiles & roles)<br/>• rooms (beds, tariffs & occupancy)<br/>• booking_groups (student applications)<br/>• maintenance_requests (tickets & status)<br/>• outing_requests (dates & permissions)<br/>• announcements (campus notices)")]
    end

    R -->|Opens browser| UI
    W -->|Opens browser| UI
    T -->|Opens browser| UI

    UI <-->|Verify login & issue secure token| AUTH_SYS
    UI <-->|Send API requests with token (HTTPS)| API
    API <-->|Read & write data safely (SSL/TLS)| DB
```

---

### 2.2 Understanding the Architecture in Plain English

If you are new to the project, here is how the 5 layers work together:

1. **The Users (`Resident`, `Warden`, `Technician`)**:
   - **Residents**: Students who need a room, want to report a broken light/tap, or need permission to leave campus for the weekend.
   - **Wardens**: Administrators who have full authority to manage room capacities, approve or reject bookings, assign technicians, and broadcast announcements.
   - **Technicians**: Hostel maintenance staff who pick up reported complaints, fix them on site, and mark them as resolved.

2. **The Frontend Web App (React 19 on Vercel)**:
   - What the user sees and clicks in their browser.
   - Built with **React 19**, **Tailwind CSS**, and **Vite** for blazing fast page loads.
   - Adapts its navigation and screens based on who is logged in so each person only sees what they are permitted to access.

3. **The Security Gatekeeper (Firebase Authentication)**:
   - Verifies who you are. When a resident logs in with Google, Firebase confirms their identity and gives the browser a secure digital key (JWT Token).
   - This key is automatically attached to every request so the backend knows the user is genuine.

4. **The Brain (Express REST API on Render)**:
   - A Node.js and Express 5 server hosted on the cloud.
   - It executes all the hostel logic:
     - *"Are there vacant beds available before letting a student book?"*
     - *"Only let the Warden approve room bookings or change room capacity."*
     - *"When a booking is approved, atomically update the bed count so two students never get the same bed."*

5. **The Safe Vault (TiDB Cloud MySQL Database)**:
   - An enterprise-grade, distributed relational MySQL database hosted in the cloud.
   - It permanently stores all student profiles, room lists, booking records, maintenance tickets, and gate-passes with high availability and SSL encryption.

---

### 2.3 End-to-End Real-World User Journeys

#### 🛏️ 1. Room Booking & Occupancy Allocation
1. **Resident** opens the *Room Booking* page, browses vacant rooms (with live color-coded bed occupancy), and submits a booking with roommate roll numbers.
2. The request is saved with status `pending`.
3. **Warden** opens *Booking Approvals*, reviews the application, and clicks **Approve**.
4. The backend runs a safe database transaction: it marks the booking as `approved` and immediately increments the room's `occupied_beds` count.
5. The resident's dashboard updates instantly to show their confirmed room number.

#### 🛠️ 2. Maintenance & Complaint Resolution
1. **Resident** files a repair ticket (e.g., *Plumbing - Tap leaking in Room 102*, Priority: *Medium*).
2. **Warden** reviews pending tickets and assigns them to an available technician (or the technician self-accepts directly).
3. The ticket status moves from `pending` to `inProgress`.
4. Once repaired, the **Technician** marks it `resolved` and adds resolution notes.
5. The **Technician Heatmap** dynamically aggregates all complaints by floor and room number, helping staff spot recurring maintenance issues across the building.

#### 🚪 3. Outing Gate-Pass Approval
1. **Resident** applies for a weekend leave or hackathon outing, specifying departure time, destination, and return date.
2. The request appears on the **Warden's** *Outing Approval* board.
3. The Warden clicks **Approve** (or **Reject** with a reason).
4. The Resident receives a live approved digital gate-pass on their screen that can be shown at the hostel gate.

#### 📢 4. Campus Announcements
1. The **Warden** posts a notice (marked as *Normal*, *Important*, or *Urgent*).
2. The announcement is broadcast across all Resident, Warden, and Technician dashboards immediately.

## 3. Project Structure

```
hostel/
├── client/                              # Frontend React 19 + Vite Application
│   ├── src/
│   │   ├── main.jsx                      # App entry point with Context Providers
│   │   ├── App.jsx                       # Route registry with role guards
│   │   ├── context/
│   │   │   ├── AuthContext.jsx           # Firebase auth listener & MySQL sync
│   │   │   ├── DataContext.jsx           # In-memory centralized data store
│   │   │   └── ThemeContext.jsx          # Dark / Light theme provider
│   │   ├── services/
│   │   │   ├── api.js                    # Axios instance with auth interceptor
│   │   │   ├── booking.js                # Room booking API helpers
│   │   │   ├── rooms.js                  # Room management API helpers
│   │   │   ├── maintenance.js            # Maintenance request API helpers
│   │   │   ├── outing.js                 # Outing permission API helpers
│   │   │   └── technician.js             # Technician task API helpers
│   │   ├── firebase/
│   │   │   ├── config.js                 # Firebase Client SDK initialization
│   │   │   └── auth.js                   # Google sign-in & sign-out handlers
│   │   ├── components/                   # Navbar, RoleSelector, Modals, Badges...
│   │   └── pages/
│   │       ├── Login/                    # LoginPage & RoleSelector
│   │       ├── Register/                 # User registration page
│   │       ├── Resident/                 # Resident Dashboard, RoomBooking, MyBookings,
│   │       │                             # MaintenanceRequest, OutingRequest
│   │       ├── Warden/                   # Warden Dashboard, RoomManagement,
│   │       │                             # BookingApproval, MaintenanceMgmt, OutingApproval
│   │       └── Technician/               # Technician Dashboard, HeatmapPage
│   ├── .env                             # Local development environment variables
│   ├── .env.production                  # Production environment variables (Render backend URL)
│   ├── vite.config.js                   # Vite configuration with /api proxy & chunk splitting
│   ├── vercel.json                      # Single Page App rewrite rule for Vercel
│   └── package.json
│
├── server/                              # Backend Express 5 REST API
│   ├── config/
│   │   └── db.js                        # TiDB Cloud MySQL connection pool (mysql2)
│   ├── routes/
│   │   ├── auth.js                      # User profile sync, login, registration
│   │   ├── rooms.js                     # CRUD rooms & occupancy management
│   │   ├── bookings.js                  # Booking submission & transactional approval
│   │   ├── maintenance.js               # Maintenance ticketing & technician assignment
│   │   ├── outing.js                    # Outing request submission & warden approvals
│   │   ├── technician.js                # Technician tasks & status resolution
│   │   └── announcements.js             # Campus announcements management
│   ├── index.js                         # Express bootstrap, CORS & route mounting
│   ├── initDb.js                        # Automated table creation & seed script
│   ├── .env                             # Database connection credentials
│   ├── .env.example                     # Reference environment configuration
│   └── package.json
│
└── README.md
```

---

## 4. REST API Endpoints

All endpoints are mounted under `/api/*` (as well as the root for convenience):

### Authentication (`/api/auth`)
- `POST /api/auth/sync` — Synchronize Firebase user profile to MySQL database
- `POST /api/auth/login` — Authenticate users with credentials and role
- `POST /api/auth/register` — Register a new resident, warden, or technician
- `GET /api/auth/profile/:identifier` — Fetch profile by UID or email

### Room Management (`/api/rooms`)
- `GET /api/rooms` — Fetch all hostel rooms with live bed occupancy
- `GET /api/rooms/:id` — Fetch details for a specific room
- `POST /api/rooms` — Create a new room (Warden)
- `PUT /api/rooms/:id` — Update room details, capacity, or occupancy (Warden)
- `PUT /api/rooms/:id/free` — Reset room beds to 0 and mark available (Warden)
- `DELETE /api/rooms/:id` — Remove a room record (Warden)

### Bookings (`/api/bookings`)
- `GET /api/bookings` — Fetch all booking applications
- `GET /api/bookings/status/:uid` — Fetch booking status for a specific student
- `POST /api/bookings` — Submit a new room booking (Resident)
- `PUT /api/bookings/approve` — Approve booking & atomically update room beds (Warden)
- `PUT /api/bookings/:id/reject` — Reject a booking request with feedback (Warden)

### Maintenance (`/api/maintenance` & `/api/technician`)
- `GET /api/maintenance/all` — Fetch all maintenance tickets
- `POST /api/maintenance` — Submit a new maintenance ticket (Resident)
- `PUT /api/maintenance/assign` — Assign a technician to a complaint (Warden)
- `PUT /api/maintenance/complete` — Mark a ticket as resolved (Technician)
- `GET /api/technician/tasks` — Fetch tasks filtered by technician or pending status
- `PUT /api/technician/update` — Update task progress, notes, or resolution

### Outings (`/api/outing`)
- `GET /api/outing/all` — List all student outing requests
- `POST /api/outing` — Submit a digital gate-pass request (Resident)
- `PUT /api/outing/approve` — Approve or reject an outing request (Warden)

### Announcements (`/api/announcements`)
- `GET /api/announcements` — List latest notices
- `POST /api/announcements` — Broadcast a new announcement (Warden)
- `DELETE /api/announcements/:id` — Delete an announcement (Warden)

---

## 5. Environment Variables

### Client (`client/.env`)

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_BASE_URL=http://localhost:5000
```

> In production (`client/.env.production`), `VITE_API_BASE_URL` points to the Render backend:  
> `VITE_API_BASE_URL=https://smarthostel-api.onrender.com`

### Server (`server/.env`)

```env
PORT=5000
DB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DB_PORT=3306
DB_USER=your_tidb_username
DB_PASSWORD=your_tidb_password
DB_NAME=hostel_management
DB_SSL=true
```

---

## 6. Installation & Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/Mowlieswaran-G/hostel.git
cd hostel
```

### 2. Install Server Dependencies
```bash
cd server
npm install
```

### 3. Install Client Dependencies
```bash
cd ../client
npm install
```

---

## 7. Database Initialization & Seeding

The server includes an automated setup script that creates the required MySQL database tables and seeds demo accounts, sample rooms, announcements, and mock complaints:

```bash
cd server
node initDb.js
```

### Pre-configured Demo Accounts
| Role | Email | Password |
|---|---|---|
| **Warden** | `warden@smarthostel.com` | `warden@123` |
| **Technician** | `technician@smarthostel.com` | `tech@123` |
| **Resident** | `mowlie@student.edu` | `student@123` (or use Google Sign-In) |

---

## 8. Running the App Locally

Start the backend and frontend in separate terminals:

### Terminal 1 — Backend (Express API)
```bash
cd server
npm run dev        # nodemon index.js -> http://localhost:5000
```

### Terminal 2 — Frontend (Vite)
```bash
cd client
npm run dev        # vite -> http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Contributing

Contributions are warmly welcomed! To get started:
1. Fork the project.
2. Create your feature branch (`git checkout -b feat/your-feature-name`).
3. Commit your changes (`git commit -m "feat: add your feature"`).
4. Push to your branch (`git push origin feat/your-feature-name`).
5. Open a Pull Request.

---

## License

This project is licensed under the [MIT License](LICENSE).

<div align="center">

Made with 💜 for efficient and modern hostel living

</div>
