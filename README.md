# stuRENT 🏠

**Student Rental Management System** — A modern Django REST API + React Single Page Application designed specifically for student accommodations, room rentals, equipment rentals, and peer-to-peer buying/selling.

🔗 **Live Link**: [sturent.mirzashafi.com](https://sturent.mirzashafi.com/)

---

## 🌟 Core Features & Recent Updates

### 1. 🏠 Specialized Housing Module
*   **Dynamic Attribute Engine**: Supports specific property details including City, Area, House Type (Apartment, Sublet, Hostel, etc.), Flat Size (sqft), Rooms, Bathrooms, AC Status, and Furnishing Status.
*   **Advanced Filtering Navbar**: Dynamic, interactive filter bar embedded on the catalog page. Location filters dynamically load area recommendations based on selected cities.
*   **Monthly Rental Billing**: Housing listings automatically transition pricing units from `/day` to `/month` across search results, details pages, cart views, and payment checkout lists.
*   **Refundable Security Deposit**: Implements a standard 2-month refundable security deposit calculation automatically added to the checkout flow for housing rentals.
*   **Custom Presentation**: Eliminates e-commerce generic widgets (like quantity selectors or "add to cart") for housing listings. Replaced with direct "Rent/Buy" modals and trusted real estate signals (e.g., Verified Landlord, Physical Key Exchange, and Signed Lease Agreement).

### 2. 💰 Flexible Pricing & Listing Types
*   **Listing Configurations**: Supports three transaction modes:
    *   *Rent Only*: Daily/monthly rental price is required; purchase price is hidden.
    *   *Buy Only (Permanent Buy)*: Flat purchase price is required; daily/monthly rental price is removed/hidden.
    *   *Rent & Buy*: Both rental and purchase options are offered simultaneously.
*   **Dynamic Price Ranges**: Client-side filtering sliders automatically rescale their limits based on listing types (scaling up to $1,000,000 for housing purchases).

### 3. 💬 Direct Messaging & Real-Time Chat
*   **Landlord Inquiry**: Direct chat button on listing pages allows prospective tenants/buyers to open conversation channels immediately with listing owners.
*   **Inbox Interface**: Interactive messenger layout to retrieve, view, and send direct messages, organized dynamically by conversation threads.

### 4. 🔐 Dual-Auth & Admin Workflow
*   **User Roles**: Separation between Student profiles and Admin (Owner/Landlord) accounts.
*   **Admin Access Requests**: Users can apply for Admin privileges. Access request queues are managed directly through a secure workflow where superusers approve/reject applicants.
*   **Google OAuth Support**: Integrated social login buttons for quick onboarding.

### 5. 📊 Management & Performance Dashboards
*   **Admin Hub**: Dedicated interface for managing customer accounts, viewing active orders, validating and approving/rejecting user-submitted product listings.
*   **Unified KPI Stats**: Analytics charts showing rental revenue, transaction volume, active listings, and user registrations.

---

## 🛠️ Tech Stack

| Layer | Technology | Key Features |
|---|---|---|
| **Backend API** | Django 4.2 + Django REST Framework | Clean architecture, relational mapping, validation |
| **Authentication** | JWT (`djangorestframework-simplejwt`) | Secure token rotation, silent token refresh, Google OAuth |
| **Frontend** | React 18 + Vite | Single Page Application routing, fast local bundles |
| **Routing** | React Router v6 | Nested layouts, private routes, search parameter parsing |
| **HTTP Client** | Axios | Request interceptors, error handling, token refresh integration |
| **Styling** | Vanilla CSS | CSS variables, glassmorphism, responsive grids, dark mode |
| **Database** | SQLite (Dev) / PostgreSQL (Prod) | Scalable database schemas |

---

## 📂 Project Layout

```
stuRENT/
├── backend/                      ← Django REST API
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env                      ← Secrets and variables
│   ├── .env.example
│   ├── db.sqlite3
│   ├── static/
│   ├── sturent/
│   │   └── settings/
│   │       ├── base.py
│   │       ├── development.py
│   │       └── production.py
│   └── apps/
│       ├── accounts/             ← Identity & Admin Request workflows
│       └── rental/               ← Core domains (Products, Orders, Chat)
│           ├── models/           ← Customer, Product, Message, Order, etc.
│           ├── serializers/      ← DRF data parsers with custom validators
│           ├── services/         ← Business logic & KPI computation
│           ├── views/            ← Thin REST endpoints
│           └── filters.py
└── client/                       ← React SPA (Vite)
    └── src/
        ├── services/             ← Axios API connectors
        │   ├── api.js            ← JWT interceptor & refresh trigger
        │   ├── authService.js
        │   ├── studentService.js
        │   ├── productService.js
        │   └── orderService.js
        ├── context/
        │   └── AuthContext.jsx   ← Global authentication & user state
        ├── hooks/
        │   └── useApi.js         ← API request utility hook
        ├── pages/
        │   ├── auth/             ← Registration, Logins
        │   ├── Dashboard.jsx     ← Visual analytics dashboard
        │   ├── products/         ← Admin product listings & management
        │   ├── student/          ← Student product catalog & chat interface
        │   └── AllProducts.jsx   ← Global catalog with custom housing filters
        └── components/
            ├── layout/           ← Shared header, sidebar, footer wrappers
            └── ui/               ← Reusable cards, sliders, modals, tags
```

---

## 🔌 API Endpoints

### Auth Services (`/api/v1/auth/`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/auth/register/` | Register a new account |
| **POST** | `/auth/login/` | Log in and receive JWT access/refresh tokens |
| **POST** | `/auth/admin-login/` | Authenticate as an administrator/moderator |
| **POST** | `/auth/token/refresh/` | Obtain a new access token using a refresh token |
| **POST** | `/auth/logout/` | Terminate session and blacklist refresh token |
| **GET** | `/auth/me/` | Fetch current user account profile |
| **POST** | `/auth/google/` | Authenticate with Google OAuth credential |
| **POST** | `/auth/admin-request/` | Submit a request for admin account elevation |
| **POST** | `/auth/admin-request/<id>/<action>/` | Approve or reject a pending admin privilege request |

### Rental & Chat Services (`/api/v1/`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/dashboard/` | Retrieve admin dashboard analytical metrics |
| **GET/POST** | `/customers/` | List all system customers or create a customer |
| **GET/PUT/PATCH/DELETE** | `/customers/<id>/` | Fetch, modify, or delete a specific customer |
| **GET** | `/customers/<id>/orders/` | Retrieve order history for a particular customer |
| **GET/POST** | `/products/` | Retrieve all inventory products or create a listing |
| **GET/PUT/PATCH/DELETE** | `/products/<id>/` | View, update, or remove a product listing |
| **POST** | `/products/<id>/approve/` | Approve a user-submitted product listing |
| **POST** | `/products/<id>/reject/` | Reject a user-submitted product listing |
| **GET/POST** | `/orders/` | List all orders or create a new order |
| **GET/PUT/PATCH/DELETE** | `/orders/<id>/` | View or adjust an order details |
| **GET** | `/student/products/` | Fetch list of approved catalog items (student catalog) |
| **GET** | `/student/products/<id>/` | View full details of a catalog product |
| **POST** | `/student/rent/` | Process rental/buy checkout transactions |
| **GET** | `/student/my-orders/` | Fetch orders placed by the current student |
| **GET** | `/student/my-products/` | Fetch listings created by the current student |
| **GET** | `/chat/conversations/` | Retrieve chat conversations and thread participants |
| **GET/POST** | `/chat/messages/` | Fetch messages in a thread or send a new chat message |

---

## 🚀 Getting Started

### 1. Django Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env    # edit configuration variables

# Run database migrations
python3 manage.py migrate --settings=sturent.settings.development

# Create Django superuser
python3 manage.py createsuperuser --settings=sturent.settings.development

# Start API server
python3 manage.py runserver --settings=sturent.settings.development
```

*   **API Host**: `http://localhost:8000`
*   **Django Admin Console**: `http://localhost:8000/admin/`

### 2. Frontend React Setup

```bash
cd client

# Install packages
npm install

# Start Vite dev server
npm run dev
```

*   **App UI Host**: `http://localhost:5173`
*   Note: *Vite proxies `/api/` calls to `http://localhost:8000` automatically.*

---

## 🔒 Security & Optimization
*   **Relational Validation**: The backend validates price bounds based on product type prior to save, clearing redundant fields to keep DB clean.
*   **Silent JWT Refresh**: Token rotation interceptors in `api.js` automatically renew user access tokens before expiration without user interruption.
*   **Bundled Styles**: Large inline CSS blocks are extracted into external stylesheets, boosting hydration times and cacheability.
