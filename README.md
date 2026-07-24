# LeadFlow CRM — Production Lead Management Platform

> **Manage, Track and Convert Leads Efficiently.**  
> A production-ready SaaS application built for modern sales teams to capture public leads, manage lead lifecycles, log activity audit trails, and optimize deal conversion rates.

---

## 🌟 Overview

LeadFlow CRM is a full-stack Lead Management SaaS platform. It combines a public marketing lead capture site with a secure, role-based internal workspace. 

### Key Capabilities
- **Public Lead Capture Form**: Automatically receives lead submissions from prospects and writes structured records into MongoDB.
- **Role-Based Access Control (RBAC)**: Distinct permissions for **Admin** (full team control, assignment, deletion, metrics) and **Member** (sales rep assigned lead pipeline, notes, status updates).
- **Lead Lifecycle Management**: Visual status progression (`New` → `Contacted` → `Qualified` → `Proposal Sent` → `Won` → `Lost`).
- **Activity Audit Timeline**: Automated tracking for every status change, note creation, and team reassignment.
- **Notes & Collaboration**: Unlimited timestamped notes per lead attached to specific team members.
- **Interactive Analytics**: Stat cards, lead status distribution pie chart, and pipeline velocity bar charts powered by Recharts.
- **CSV Data Export**: Instant CSV report generation for filtered lead sets.
- **Modern Responsive Design**: TailwindCSS styling with dark mode support, glassmorphism headers, and smooth micro-animations.

---

## 🏗️ Project Structure

```
leadflow-crm/
├── backend/
│   ├── config/          # Database connection & env config
│   ├── controllers/     # HTTP Request handlers
│   ├── middleware/      # Auth (JWT), RBAC & error handlers
│   ├── models/          # Mongoose schemas (User, Lead, Note, Activity)
│   ├── routes/          # Express route definitions
│   ├── services/        # Core business logic layer
│   ├── tests/           # Jest & Supertest integration test suite
│   ├── utils/           # Activity logger, CSV exporter, response helpers
│   ├── validators/      # Express-validator schema rules
│   ├── app.js           # Express app setup
│   ├── seed.js          # Database seed script
│   └── server.js        # Server entry point
│
└── frontend/
    ├── src/
    │   ├── components/  # Reusable UI, Badges, Modals, Navbar, Sidebar, Footer
    │   ├── context/     # AuthContext (JWT state) & ThemeContext (Dark mode)
    │   ├── hooks/       # Custom React hooks
    │   ├── layouts/     # PublicLayout & DashboardLayout
    │   ├── pages/       # Home, Features, Pricing, Contact, Login, Dashboards
    │   ├── services/    # Axios API wrappers (auth, leads, users)
    │   ├── utils/       # Date formatting, status color tokens, CSV download
    │   ├── App.jsx      # Router & Protected Route guards
    │   └── main.jsx     # React entry point
    ├── index.html       # HTML entry with SEO meta tags & Inter font
    └── tailwind.config.js # Tailwind CSS design system configuration
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite**
- **TailwindCSS** (Custom palette & dark mode)
- **React Router v6** (Protected & Role-based routes)
- **Axios** (JWT header interceptors & 401 redirect handling)
- **React Hook Form** (Form validation & error feedback)
- **Recharts** (Interactive pie and bar charts)
- **Lucide React** (Modern iconography)
- **React Hot Toast** (Toast notifications)

### Backend
- **Node.js** + **Express.js**
- **MongoDB Atlas** + **Mongoose ORM**
- **JWT (JSON Web Tokens)** + **bcryptjs** (Password hashing)
- **Express Validator** (Input sanitization & schema validation)
- **Jest** + **Supertest** + **MongoMemoryServer** (Automated API testing)

---

## 🔑 Role Permissions Matrix

| Feature / Action | Admin | Member (Sales Rep) |
| :--- | :---: | :---: |
| **Public Lead Capture Form** | ✅ | ✅ |
| **View All System Leads** | ✅ | ❌ (Only Assigned) |
| **Assign Leads to Reps** | ✅ | ❌ |
| **Create & Edit Users** | ✅ | ❌ |
| **Delete Users or Leads** | ✅ | ❌ |
| **Update Lead Status** | ✅ | ✅ |
| **Add Lead Notes** | ✅ | ✅ |
| **View Analytics & Charts** | ✅ | ❌ |
| **Export CSV Reports** | ✅ | ✅ (Assigned only) |
| **Edit Own Profile** | ✅ | ✅ |

---

## 🔌 REST API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new user account
- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET /api/auth/me` — Fetch current user profile `(Protected)`

### Users (`/api/users`)
- `GET /api/users` — Get all team members `(Admin Only)`
- `POST /api/users` — Create team member `(Admin Only)`
- `PUT /api/users/:id` — Update user details or active status `(Admin Only)`
- `DELETE /api/users/:id` — Delete team member `(Admin Only)`

### Leads (`/api/leads`)
- `POST /api/leads` — Public lead capture submission `(Public)`
- `GET /api/leads` — List leads with search, filter & pagination `(Protected)`
- `GET /api/leads/dashboard` — Fetch dashboard statistics & recent activity `(Admin Only)`
- `GET /api/leads/export` — Download CSV export file `(Protected)`
- `GET /api/leads/:id` — Fetch single lead details `(Protected)`
- `PUT /api/leads/:id` — Update lead status or fields `(Protected)`
- `DELETE /api/leads/:id` — Delete lead record `(Admin Only)`
- `POST /api/leads/:id/assign` — Assign lead to team member `(Admin Only)`
- `POST /api/leads/:id/note` — Add timestamped note to lead `(Protected)`
- `GET /api/leads/:id/notes` — Get notes for lead `(Protected)`
- `GET /api/leads/:id/activity` — Get activity audit timeline for lead `(Protected)`

---

## ⚡ Quick Start & Local Setup

### 1. Clone & Install Dependencies

#### Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in `backend/`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/leadflow?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

Seed initial admin and sales rep demo data:
```bash
npm run seed
```

Run dev server:
```bash
npm run dev
```

#### Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Running Automated Tests

Run backend Jest test suite using MongoDB Memory Server:
```bash
cd backend
npm test
```

---

## 🚀 Deployment Guide

### Frontend → Vercel
1. Push project repository to GitHub.
2. Connect repository to Vercel.
3. Set **Root Directory** to `frontend`.
4. Set Build Command: `npm run build`
5. Set Output Directory: `dist`
6. Add Environment Variable: `VITE_API_URL=https://your-backend.onrender.com/api`

### Backend → Render
1. Create a new **Web Service** on Render.
2. Set **Root Directory** to `backend`.
3. Set Build Command: `npm install`
4. Set Start Command: `npm start`
5. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas URI
   - `JWT_SECRET`: Random 32+ char secret
   - `FRONTEND_URL`: Your Vercel frontend URL

### Database → MongoDB Atlas
1. Create a free Cluster on MongoDB Atlas.
2. Network Access: Allow `0.0.0.0/0` (or Render IP addresses).
3. Create Database User and retrieve connection string.

---

## 📝 Footer & Attribution

Built for **[Digital Heroes Training Task](https://digitalheroesco.com)**.
