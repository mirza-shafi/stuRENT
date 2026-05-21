# stuRENT 🏠

**Student Rental Management System** — Django REST API + React SPA

---

## Project Layout

```
stuRENT-main/
├── backend/                      ← Django REST API
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env                      ← secrets (not committed)
│   ├── .env.example
│   ├── db.sqlite3
│   ├── static/
│   ├── sturent/
│   │   └── settings/
│   │       ├── base.py
│   │       ├── development.py
│   │       └── production.py
│   └── apps/
│       ├── accounts/             ← Auth (JWT register/login/logout)
│       └── rental/               ← Core business domain
│           ├── models/           ← Customer, Product, Tag, Order
│           ├── serializers/
│           ├── services/         ← Business logic layer
│           ├── views/            ← Thin REST controllers
│           └── filters.py
└── client/                       ← React SPA (Vite)
    └── src/
        ├── services/             ← API controllers (Axios)
        │   ├── api.js            ← JWT interceptors + silent refresh
        │   ├── authService.js
        │   ├── customerService.js
        │   ├── productService.js
        │   └── orderService.js
        ├── context/
        │   └── AuthContext.jsx   ← Global auth state
        ├── hooks/
        │   └── useApi.js         ← Generic fetch hook
        ├── pages/
        │   ├── auth/             ← Login, Register
        │   ├── Dashboard.jsx
        │   ├── customers/
        │   ├── products/
        │   └── orders/
        └── components/
            ├── layout/           ← Sidebar, Layout
            └── ui/               ← Badge, StatCard
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend API | Django 4.2 + Django REST Framework |
| Authentication | JWT (`djangorestframework-simplejwt`) |
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| HTTP Client | Axios (silent token refresh) |
| Styling | Vanilla CSS — dark mode, glassmorphism |
| Database | SQLite (dev) / PostgreSQL (prod) |

---

## API Endpoints

### Auth — `/api/v1/auth/`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register/` | Create account |
| POST | `/auth/login/` | Get JWT tokens |
| POST | `/auth/token/refresh/` | Refresh access token |
| POST | `/auth/logout/` | Blacklist refresh token |
| GET | `/auth/me/` | Current user profile |

### Rental — `/api/v1/`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/` | KPI stats + recent orders |
| GET/POST | `/customers/` | List / create customers |
| GET/PUT/PATCH/DELETE | `/customers/<id>/` | Customer CRUD |
| GET | `/customers/<id>/orders/` | Customer order history |
| GET/POST | `/products/` | List / create products |
| GET/PUT/PATCH/DELETE | `/products/<id>/` | Product CRUD |
| GET/POST | `/orders/` | List / create orders |
| GET/PUT/PATCH/DELETE | `/orders/<id>/` | Order CRUD |

---

## Setup

### Backend

```bash
cd backend

# 1. Create virtual env (first time only)
python3 -m venv .venv && source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env    # then edit SECRET_KEY

# 4. Run migrations
python3 manage.py migrate --settings=sturent.settings.development

# 5. Create superuser
python3 manage.py createsuperuser --settings=sturent.settings.development

# 6. Start dev server
python3 manage.py runserver --settings=sturent.settings.development
```

Backend → **http://localhost:8000**
Admin panel → **http://localhost:8000/admin/**

### Client

```bash
cd client
npm install
npm run dev
```

Client → **http://localhost:5173**

> Vite proxies all `/api/` requests to Django automatically — no CORS config needed in dev.
