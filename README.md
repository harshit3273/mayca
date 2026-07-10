# CA Firm Management Platform

A full-stack web application for Chartered Accountant firms with dual dashboards for CA staff and clients.

## Project Structure

```
Charted accountent/
├── backend/          # Node.js + Express API
└── frontend/         # React.js application
```

## Tech Stack

| Part        | Technology                     |
|-------------|-------------------------------|
| Frontend    | React.js, Tailwind CSS         |
| Icons       | React Icons                    |
| Charts      | Chart.js + react-chartjs-2     |
| Routing     | React Router v6                |
| Backend     | Node.js + Express.js           |
| Database    | MongoDB                        |
| Auth        | JWT + bcryptjs                 |
| File Upload | Multer                         |
| Calendar    | React Calendar                 |
| Toasts      | React Toastify                 |
| PDF Reports | jsPDF + jspdf-autotable        |

---

## Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm

---

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file (copy from `.env.example`):
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/ca_firm_db
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=24h
NODE_ENV=development
```

**IMPORTANT: Seed the Admin Account**
Before starting the backend, you must generate your firm's super administrator account. This account is required to create CA staff members.
```bash
node seedAdmin.js
```
*(This creates an account with email `admin@firm.com` and password `admin123`)*

Start the backend:
```bash
npm run dev
```

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The app runs on `http://localhost:3000` and proxies API calls to `http://localhost:5000`.

---

## Usage Guide (Workflow)

The platform operates using a secure three-tier hierarchy: **Admins**, **CAs**, and **Clients**.

### Step 1: Admin Configuration
1. Go to `http://localhost:3000/login` and sign in using the seeded admin credentials (`admin@firm.com` / `admin123`).
2. You will be routed to the **Admin Dashboard**.
3. Use the **Provision CA Account** form to create accounts for the Chartered Accountants working at your firm.

### Step 2: Client Registration
1. Clients visit the public portal and click **Create Account** (`/register`).
2. They fill out their details (Business Name, PAN, Phone, etc.).
3. *Note: Newly registered clients are initially "unassigned". They cannot chat with a CA until assigned.*

### Step 3: Client Assignment
1. The **Admin** logs into their dashboard and sees the newly registered client in the **Unassigned Clients** queue.
2. The Admin selects a specific CA from the dropdown and clicks **Assign**.
3. The client is now securely linked to that CA.

### Step 4: Compliance & Collaboration
- **CA Dashboard**: The assigned CA can now log in, view the client, update their GST/ITR/TDS/ROC records, confirm appointments, and securely download/upload documents.
- **Client Dashboard**: The client can log in to view their compliance statuses, upload missing documents, book appointments, and chat directly with their assigned CA.

---

## Features

### Admin Dashboard
- CA staff provisioning
- Unassigned client queue management
- Client-CA association management

### CA Dashboard
- Overview with stats and Chart.js visualizations
- Strict ownership access (CAs can only view data for their assigned clients)
- GST, ITR, TDS, ROC compliance tracking
- Payment management
- Secure document repository
- Calendar with appointment management
- Real-time messaging with clients

### Client Dashboard
- Compliance status overview (GST, ITR, Tax Due, Refund)
- Due date warning banners
- Secure document upload with MIME validation (PDF, JPG, PNG, XLSX)
- Chat with assigned CA
- Appointment booking with calendar view
