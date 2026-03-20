# Jengibre Cerámicas

A full-stack e-commerce application for an artisanal ceramics business, built with Node.js + Express + Prisma on the backend and React + TypeScript + Tailwind CSS on the frontend.

## Architecture

```
D:/Proyecto Jengibre1.0/
├── backend/                    # Express API (Node.js + TypeScript)
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   │   ├── authController.ts
│   │   │   └── productController.ts
│   │   ├── middleware/         # Express middleware
│   │   │   ├── auth.ts         # JWT verification
│   │   │   ├── errorHandler.ts
│   │   │   └── validate.ts     # express-validator helper
│   │   ├── routes/             # Route definitions
│   │   │   ├── auth.ts
│   │   │   └── products.ts
│   │   ├── services/           # Business logic + Prisma queries
│   │   │   ├── authService.ts
│   │   │   └── productService.ts
│   │   └── app.ts              # Express app entry point
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.ts             # Seed data (admin + 12 products)
│   ├── tests/
│   │   ├── auth.test.ts
│   │   ├── products.test.ts
│   │   └── setup.ts            # Jest setup + Prisma mock
│   ├── .env.example
│   ├── jest.config.js
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # React + Vite application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── CategoryFilter.tsx
│   │   │   ├── Cart.tsx
│   │   │   └── CartItem.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx        # Public storefront
│   │   │   ├── Login.tsx       # Admin login
│   │   │   └── Admin.tsx       # Product management dashboard
│   │   ├── context/
│   │   │   ├── CartContext.tsx  # Cart state + localStorage persistence
│   │   │   └── AuthContext.tsx  # Auth state + cookie-based sessions
│   │   ├── services/
│   │   │   └── api.ts          # Axios API client
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── tests/
│   │       ├── cart.test.tsx
│   │       ├── search.test.tsx
│   │       └── filters.test.tsx
│   ├── index.html
│   ├── babel.config.js
│   ├── jest.config.js
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── README.md
```

## Tech Stack

**Backend**
- Node.js 18+ with Express 4 and TypeScript
- PostgreSQL database via Prisma ORM
- bcryptjs for password hashing (bcrypt cost factor 12)
- jsonwebtoken for JWT authentication stored in httpOnly cookies
- express-validator for input validation
- helmet + cors + cookie-parser security middleware
- express-rate-limit on auth endpoints
- Jest + Supertest for integration tests

**Frontend**
- React 18 with TypeScript and Vite
- Tailwind CSS with warm earthy color palette (stone, amber, clay, bark)
- Axios with withCredentials for cookie-based auth
- React Context API for cart and auth state
- React Router v6
- Jest + React Testing Library + Babel for unit tests
- Google Fonts: Playfair Display (headings), Inter (body)

## Prerequisites

- Node.js 18 or higher
- npm 8 or higher
- PostgreSQL 14 or higher
- Git (optional)

## Local Setup

### 1. Navigate to the project

```bash
cd "D:/Proyecto Jengibre1.0"
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

Edit `backend/.env` and configure your database connection:

```
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/jengibre_db"
JWT_SECRET="change-this-to-a-long-random-string-in-production"
JWT_EXPIRES_IN="24h"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

```bash
# Create the database (run in psql or pgAdmin):
# CREATE DATABASE jengibre_db;

# Run migrations
npx prisma migrate dev --name init

# Seed the database (creates admin user + 12 products)
npm run db:seed

# Start the development server
npm run dev
```

The backend will be running at `http://localhost:3001`

### 3. Frontend Setup

Open a new terminal:

```bash
cd "D:/Proyecto Jengibre1.0/frontend"

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be running at `http://localhost:5173`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret key for signing JWT tokens | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `24h` |
| `PORT` | Backend server port | `3001` |
| `NODE_ENV` | Environment (`development`, `production`, `test`) | `development` |
| `FRONTEND_URL` | Frontend origin for CORS | `http://localhost:5173` |

## Default Admin Credentials

After running the seed:

| Field | Value |
|-------|-------|
| Email | `admin@jengibre.com` |
| Password | `ReyPerseo2026-` |

Access the admin panel at: `http://localhost:5173/admin`

## API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/login` | No | Login with email/password, sets httpOnly cookie |
| `POST` | `/api/auth/logout` | No | Clears auth cookie |
| `GET` | `/api/auth/me` | Required | Returns current authenticated user |

**Login request body:**
```json
{
  "email": "admin@jengibre.com",
  "password": "ReyPerseo2026-"
}
```

### Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/products` | No | List products. Supports `?search=` and `?category=` |
| `GET` | `/api/products/:id` | No | Get a single product |
| `POST` | `/api/products` | Required | Create a new product |
| `PUT` | `/api/products/:id` | Required | Update a product |
| `DELETE` | `/api/products/:id` | Required | Soft-delete (deactivate) a product |

**Product categories:** `tazas`, `platos`, `decoracion`, `bowls`, `jarrones`, `set_vajilla`

**Create/Update product body:**
```json
{
  "name": "Taza Espresso",
  "price": 2800,
  "category": "tazas",
  "description": "Descripción del producto",
  "image": "/images/producto-1.jpg",
  "stock": 10
}
```

## Running Tests

### Backend tests

```bash
cd backend
npm test
```

Tests cover:
- Login with valid/invalid credentials
- Cookie-based authentication
- Protected route access
- Full CRUD for products with auth guards

### Frontend tests

```bash
cd frontend
npm test
```

Tests cover:
- CartContext: add, remove, update quantity, clear, totals calculation
- SearchBar: rendering, debounce, clear functionality, accessibility
- CategoryFilter: rendering all categories, click handling, active state, accessibility

## Security Measures

- **httpOnly cookies**: JWT is stored in httpOnly cookies, inaccessible to JavaScript (XSS protection)
- **Password hashing**: bcrypt with cost factor 12
- **Helmet**: HTTP security headers (CSP, HSTS, X-Frame-Options, etc.)
- **CORS**: Restricted to the frontend origin
- **Rate limiting**: Auth endpoints limited to 20 requests per 15 minutes
- **Input validation**: All inputs validated with express-validator before processing
- **Soft deletes**: Products are deactivated rather than permanently deleted
- **No password in responses**: User objects never expose the hashed password
- **Environment variables**: All secrets via .env (never hardcoded)

## Future Improvements

- **Stripe payments**: Integrate Stripe Checkout for real payment processing
- **Order management**: Order model in Prisma, order history for admin, email notifications
- **User accounts**: Customer registration and login, order tracking
- **Image uploads**: Replace URL strings with file upload to S3/Cloudinary
- **Product variants**: Size, color or material options per product
- **Inventory alerts**: Email notification when stock falls below threshold
- **Deployment**: Docker Compose configuration, deploy backend to Railway/Render, frontend to Vercel/Netlify
- **Analytics**: Admin dashboard with sales charts and product performance metrics
- **Internationalization**: Multi-currency support (ARS + USD)
