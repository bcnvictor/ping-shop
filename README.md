# Ping Shop

A shop management system with role-based access, order processing, stock tracking, and activity logs.

**Authors:** Reda Berrada Allam, Victor Biancini, Amiel Fabreguettes, Enzo Francil, Thomas Scheepers

---

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Quarkus, Hibernate ORM, PostgreSQL |
| Auth | JWT (SmallRye JWT) |
| Frontend | React 19, TypeScript, Vite |
| API contract | OpenAPI (`backend/src/main/resources/openapi.yml`) |

---

## Structure

```
ping-shop/
├── backend/    # Quarkus REST API
└── frontend/   # React SPA
```

---

## Backend

### Prerequisites

- Java 17+
- Maven 3.8+
- PostgreSQL running on `localhost:5432` with a database named `ping`
- A `privateKey.pem` / `publicKey.pem` RSA key pair for JWT signing (not committed, generate with the commands below)

### Generate JWT keys

```bash
openssl genrsa -out backend/src/main/resources/privateKey.pem 2048
openssl rsa -pubout -in backend/src/main/resources/privateKey.pem \
            -out backend/src/main/resources/publicKey.pem
```

### Run

```bash
cd backend
mvn quarkus:dev
```

API available at `http://localhost:8080`.

### Database

The schema is initialized automatically by Hibernate on first run (`hibernate.ddl-auto=update`). A seed script is available at `backend/src/main/resources/migration/initdb.sql`.

---

## Frontend

### Prerequisites

- Node.js 18+
- Yarn or npm

### Run

```bash
cd frontend
yarn install   # or npm install
yarn dev       # or npm run dev
```

App available at `http://localhost:5173`.

---

## Features

- **Shop** : browse products by category, add to cart, place orders
- **Stock management** : create/update products, CSV import/export, low-stock alerts
- **Order management** : seller interface to confirm or reject pending orders
- **Logs** : filterable activity log viewer
- **Stats** : sales and stock statistics
- **Roles** : admin, seller, and customer access levels enforced on both API and UI
