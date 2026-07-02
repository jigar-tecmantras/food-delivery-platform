# Food Delivery Platform

This repository powers a demo food delivery experience with a React (Create React App) frontend and a Laravel API backend. The stack includes:

- **React frontend** (`frontend/`) featuring home, menu, checkout, and dashboard sections plus responsive styling and role-aware tabs.
- **Laravel APIs** (`backend/`) exposing endpoints for home data, menu browsing, checkout/payment simulation, order tracking, and persona dashboards.

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
npm start
```

The frontend proxies `/api` to the Laravel server (configured via the `proxy` field in `frontend/package.json`). Ensure the backend is running on port 8000.

## Key features

- **Home hero** with expressive messaging, CTA buttons, and featured dish highlights.
- **Menu grid** obtained from `GET /api/v1/menu`, styled for responsive breakpoints.
- **Checkout simulation** using `POST /api/v1/checkout` to display robust totals.
- **Order tracking** preview powered by `GET /api/v1/order-tracking/{id}`.
- **Role dashboards** for `customer`, `restaurant`, and `admin` views via `GET /api/v1/dashboard?role=`.
