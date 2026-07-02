# Food Delivery Platform

This repository powers a demo food delivery experience with a React/Vite frontend and Laravel API backend. The stack includes:

- **React frontend** (`frontend/`) featuring home, menu, checkout, and dashboard sections plus responsive styling.
- **Laravel APIs** (`backend/`) exposing endpoints for home data, menu browsing, checkout/payment simulation, order tracking, and role-aware dashboards.

## Running locally

### Backend
```bash
cd backend
composer install
php artisan key:generate
php artisan serve --host 0.0.0.0 --port 8000
```

API entrypoint: `http://localhost:8000/api/v1/`

### Frontend
```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

The frontend proxies to `/api` - ensure the Laravel server is running on port 8000 (adjust `vite.config.js` proxy if needed).

## Key features

- **Home hero** with highlighted chefs, promotions, and stats.
- **Menu grid** pulled from the `GET /api/v1/menu` endpoint.
- **Checkout** that posts to `POST /api/v1/checkout`, simulating payment processing.
- **Order tracking** preview from `GET /api/v1/order-tracking/{id}`.
- **Role dashboards** for `customer`, `restaurant`, and `admin` views via `GET /api/v1/dashboard?role=`.
