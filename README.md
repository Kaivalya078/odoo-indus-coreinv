# CoreINV — Inventory Management System

A production-grade, modular Inventory Management System built with FastAPI, PostgreSQL, and SQLAlchemy.

## Features

- Multi-warehouse and multi-location stock tracking
- Ledger-based inventory (append-only stock movements)
- Receipts, Deliveries, Internal Transfers, Stock Adjustments
- JWT authentication with role-based access
- Dashboard analytics and low-stock alerts
- RESTful API designed for future frontend integration

## Tech Stack

| Layer | Technology |
|---|---|
| Backend Framework | FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Migrations | Alembic |
| Validation | Pydantic |
| Auth | JWT (python-jose) + bcrypt |

## Project Structure

```
backend/
├── app/
│   ├── main.py
│   ├── core/          # Config, security, dependencies
│   ├── models/        # SQLAlchemy ORM models
│   ├── schemas/       # Pydantic request/response schemas
│   ├── routers/       # API endpoint definitions
│   ├── services/      # Business logic layer
│   ├── database/      # DB session and base
│   └── utils/         # Helpers (reference generator, etc.)
├── migrations/        # Alembic migrations
├── requirements.txt
└── .env
```

## Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

API docs available at `http://localhost:8000/docs`

## Inventory Flow

```
Supplier ──Receipt──▶ Warehouse/Location ──Delivery──▶ Customer
                           │       ▲
                   Transfer│       │Transfer
                           ▼       │
                     Warehouse/Location
                           │
                     Adjustment (±)
```

All stock changes produce immutable stock movement records. Current stock is always derived from the movement ledger.

## License

MIT
