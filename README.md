# User Management: CodeIgniter 4 API + React

A user management app (list, create, edit, delete) with a **CodeIgniter 4 REST API** backend and a **React + TypeScript (Vite)** frontend, talking over JSON.

```
user-management/
├── backend/    CodeIgniter 4.7 REST API (PHP 8.1+, MySQL)
└── frontend/   React 19 + TypeScript, built with Vite
```

| Part | Default URL |
|---|---|
| API (backend) | `http://localhost:8080` |
| Web app (frontend) | `http://localhost:5173` |

**The frontend expects the API at `http://localhost:8080`.** This is set with `VITE_API_BASE_URL` in `frontend/.env`.

---

## Requirements

- PHP **8.1+** with the `intl`, `mbstring` and `mysqli` extensions
- [Composer](https://getcomposer.org/) 2
- MySQL 8 or MariaDB 10.4+
- Node.js **20.19+** (or 22.12+) and npm

---

## 1. Backend setup

```bash
cd backend
composer install
cp .env.example .env          # Windows: copy .env.example .env
```

Edit `.env` with your database credentials, then create the two databases (the second is used only by the automated tests and is wiped on every test run):

```sql
CREATE DATABASE user_management      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE user_management_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Create the table, load 12 sample users and start the API:

```bash
php spark migrate
php spark db:seed UserSeeder
php spark serve               # http://localhost:8080
```

Check it works: open <http://localhost:8080/users>.

### Run the tests

```bash
composer test
```

`tests/feature/UsersApiTest.php` has integration tests that send real HTTP requests through the routes, controller, model and validation, against the MySQL test database. They cover every endpoint and status code, including duplicate emails and missing fields.

## 2. Frontend setup

In a second terminal (keep the API running):

```bash
cd frontend
npm install
cp .env.example .env          # Windows: copy .env.example .env
npm run dev                   # http://localhost:5173
```

Other scripts: `npm run build` (type-check + production build), `npm run lint`.

---

## API

Base URL: `http://localhost:8080`. All requests and responses are JSON.

| Method | Path | Success | Errors |
|---|---|---|---|
| `GET` | `/users` | `200` list of users | |
| `GET` | `/users/{id}` | `200` user | `404` |
| `POST` | `/users` | `201` created user | `422` validation |
| `PUT` | `/users/{id}` | `200` updated user | `404`, `422` |
| `DELETE` | `/users/{id}` | `204` no body | `404` |

**User object**

```json
{
  "id": 1,
  "first_name": "Ana",
  "last_name": "García",
  "email": "ana.garcia@example.com",
  "gender": "female",
  "telephone": "+57 300 123 4567",
  "age": 29,
  "created_at": "2026-10-10 14:00:00",
  "updated_at": "2026-10-10 14:00:00"
}
```

**Error format** (same shape for every error, so the frontend can map messages to form fields):

```json
{
  "message": "Validation failed.",
  "errors": { "email": "This email is already registered." }
}
```

**Validation rules**

| Field | Rule |
|---|---|
| `first_name`, `last_name` | required, max 100 characters |
| `email` | required, valid format, max 255, **unique** |
| `gender` | required, one of `male`, `female`, `other` |
| `telephone` | optional; 7–30 characters of digits, spaces, `+`, `-`, `( )` |
| `age` | required, whole number 1–120 |

Example:

```bash
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Test","last_name":"User","email":"test@example.com","gender":"other","age":30}'
```

---

## How the code is organised

**Backend (`backend/app`)**

| File | Responsibility |
|---|---|
| `Database/Migrations/…CreateUsersTable.php` | Table schema, including a **unique index on `email`** |
| `Database/Seeds/UserSeeder.php` | 12 fixed sample users, inserted through the model so they pass the same validation |
| `Models/UserModel.php` | Query Builder access, allowed fields, type casts and **all validation rules** |
| `Services/UserService.php` | Use cases (list, find, create, update, delete), with no HTTP code, so a future CLI or cron job can reuse them. Registered as `service('userService')` in `Config/Services.php` |
| `Controllers/Users.php` | Thin controller: reads the request, calls `UserService`, maps the result to an HTTP status |
| `Config/Routes.php` | Explicit routes (`(:num)` ids only), CORS filter, `OPTIONS` preflight routes |
| `Config/Cors.php` | Allowed origins read from `CORS_ALLOWED_ORIGINS` in `.env` |

**Frontend (`frontend/src`)**

| File | Responsibility |
|---|---|
| `api/client.ts` | `fetch` wrapper: base URL, JSON headers, turns error responses into a typed `ApiError` |
| `api/users.ts` | One function per endpoint |
| `hooks/useUsers.ts` | Holds the users list; updates it from the server's responses after create/edit/delete; cancels stale requests with `AbortController` |
| `validation/userForm.ts` | Client-side validation (same rules as the backend) |
| `components/` | `UserTable`, `UserForm` (used for both create and edit), `Modal`, `ConfirmDialog`, `FormField`, `Alert`, `Spinner` |
| `App.tsx` | Page layout and UI state (which dialog is open, notices) |

---

## Decisions and assumptions

- **Table name `users` instead of `USER`.** `USER` is a reserved word in standard SQL and PostgreSQL, and plural table names are the CodeIgniter convention. The fields and rules match the specification.
- **Gender** is limited to `male`, `female`, `other`, and validated on both sides. It is stored as `VARCHAR` rather than `ENUM`, so adding an option needs no schema change.
- **Age** must be a whole number from 1 to 120. **Telephone** is free-form but limited to phone characters, because international formats vary.
- **Email uniqueness is enforced twice:** by the model's `is_unique` rule, which returns a friendly 422, and by a unique index in the database, which still protects against two requests arriving at the same moment.
- **Layers:** controller (HTTP only) → `UserService` (use cases and future business rules) → `UserModel` (data access and validation rules) → database constraints. A scheduled job would call `UserService` directly.
- **Validation lives in the model**, so every caller (API, seeder, a future CLI job) uses the same rules. The client-side rules are only for fast feedback; the server is the source of truth.
- **`PUT` is a full replacement:** all required fields must be sent. `PATCH` is not exposed.
- **Mass-assignment protection:** only the six user fields in `$allowedFields` can be written. Fields like `id` or `created_at` sent by a client are ignored.
- **No authentication** and **no pagination**. Both are out of scope for this test; how I would add them is described in the technical answers.
- **No UI or data libraries** in the frontend (only React and `fetch`), to keep the project small and every part visible. For a larger app I would use TanStack Query for server data.
