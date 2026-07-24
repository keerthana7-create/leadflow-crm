# Flask Lead Management Backend — API Contract & Architecture Guide

> **Stack**: Python 3.10+ • Flask 3.0 • SQLAlchemy 2.0 • Flask-JWT-Extended • MySQL / SQLite • Pytest

---

## 🔑 Demo Credentials (Working Accounts)

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@leadflow.com` | `password123` | Full access, user management, reassign leads, view analytics |
| **Member** | `john@leadflow.com` | `password123` | Assigned leads only, status updates, notes thread |
| **Member 2** | `sarah@leadflow.com` | `password123` | Assigned leads only, status updates, notes thread |

---

## 🏛️ Architectural Choices & Interview Defense

### 1. Flask App Factory Pattern (`create_app`)
- **Why?** Avoids global mutable application state. Allows instant switching between SQLite in-memory (`TestingConfig`), local SQLite (`DevelopmentConfig`), and production MySQL (`ProductionConfig`) without modifying code.

### 2. Singleton Extensions (`app/extensions.py`)
- **Why?** Solves circular dependency issues cleanly. Models import `db`, blueprints import `db`, but neither needs to import the `app` instance.

### 3. Route-Level Role Enforcement (`@admin_required`, `@member_or_admin_required`)
- **Why decorators over middleware?** Flask middleware (`before_request`) runs globally. Route decorators explicitly document security intent at the endpoint definition and return 401/403 before any handler logic executes.

### 4. Controller-Service Pattern (`LeadService`, `ActivityService`)
- **Why?** Keeps Flask route handlers ultra-thin (HTTP adapters only). All business logic, pagination, and RBAC data scoping are pure Python methods testable without spinning up an HTTP server.

---

## 🔌 API Contract & Endpoint Documentation

### Auth Module (`/api/auth`)

#### `POST /api/auth/login`
- **Auth**: Public
- **Request Body**:
  ```json
  { "email": "admin@leadflow.com", "password": "password123" }
  ```
- **Responses**:
  - `200 OK`: `{ "success": true, "access_token": "JWT...", "user": { "id": 1, "name": "Admin User", "email": "...", "role": "admin" } }`
  - `400 Bad Request`: Missing email or password
  - `401 Unauthorized`: Invalid credentials or deactivated account

#### `GET /api/auth/me`
- **Auth**: Required (`Bearer <token>`)
- **Responses**:
  - `200 OK`: `{ "success": true, "user": { ... } }`
  - `401 Unauthorized`: Missing or invalid JWT

---

### Leads Module (`/api/leads`)

#### `POST /api/leads/capture`
- **Auth**: Public (Marketing Form Intake)
- **Request Body**:
  ```json
  { "name": "John Doe", "email": "john@acme.com", "phone": "+1 555-0192", "company": "Acme", "message": "Demo request" }
  ```
- **Responses**:
  - `201 Created`: `{ "success": true, "data": { "id": 10, "status": "New", ... } }`
  - `400 Bad Request`: Missing name or invalid email format

#### `GET /api/leads`
- **Auth**: Required
- **Query Params**: `?page=1&limit=20&status=Qualified&assigned_to=2`
- **Role Scoping**: Admins see all leads; Members automatically get filtered to `assigned_to == current_user.id`.
- **Responses**:
  - `200 OK`: `{ "success": true, "data": [...], "pagination": { "total": 45, "page": 1, "limit": 20, "pages": 3 } }`
  - `401 Unauthorized`

#### `GET /api/leads/:id`
- **Auth**: Required
- **Responses**:
  - `200 OK`: `{ "success": true, "data": { ... } }`
  - `403 Forbidden`: Member attempting to view lead assigned to another rep
  - `404 Not Found`

#### `PUT /api/leads/:id`
- **Auth**: Required
- **Request Body**: `{ "status": "Proposal Sent", "phone": "+1 555-9988" }`
- **Responses**:
  - `200 OK`: `{ "success": true, "data": { ... } }`
  - `403 Forbidden`: Member attempting to modify lead not assigned to them
  - `404 Not Found`

#### `POST /api/leads/:id/assign`
- **Auth**: Admin Only
- **Request Body**: `{ "user_id": 2 }`
- **Responses**:
  - `200 OK`: `{ "success": true, "data": { ... } }`
  - `403 Forbidden`: Non-admin user calling endpoint
  - `404 Not Found`

#### `DELETE /api/leads/:id`
- **Auth**: Admin Only
- **Responses**:
  - `200 OK`: `{ "success": true, "message": "Lead deleted" }`
  - `403 Forbidden`
  - `404 Not Found`

#### `GET /api/leads/:id/activity`
- **Auth**: Required
- **Responses**:
  - `200 OK`: `{ "success": true, "data": [ { "id": 1, "action": "Lead assigned to John", "actor": { ... }, "timestamp": "ISO..." } ] }`

#### `POST /api/leads/:id/notes`
- **Auth**: Required
- **Request Body**: `{ "body": "Spoke with prospect. Next call on Thursday." }`
- **Responses**:
  - `201 Created`: `{ "success": true, "data": { "id": 5, "body": "...", "author": { ... } } }`
  - `400 Bad Request`: Empty body

---

### User Management Module (`/api/users`) — Admin Only

- `GET /api/users` → List all team members
- `POST /api/users` → Create user (`{ name, email, password, role }`)
- `PUT /api/users/:id` → Update user details or active status
- `DELETE /api/users/:id` → Delete user

---

## 🚀 Running Local Setup & Tests

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Run Database Seed Script
```bash
python seed.py
```

### Run Flask Server
```bash
python run.py
```
Server starts on `http://localhost:5001`.

### Run Automated Pytest Test Suite
```bash
pytest -v
```
Runs isolated tests against in-memory SQLite database.
