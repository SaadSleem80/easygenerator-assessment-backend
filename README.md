# Easygenerator Assessment - Backend Service

This project is an assessment submission for **Easygenerator**. It is a robust backend service built with [NestJS](https://nestjs.com/) and [MongoDB](https://www.mongodb.com/) (via Mongoose), providing a complete authentication and user management system.

---

## Features

- **Authentication System**:
  - `POST /api/v1/auth/register`: Public registration endpoint with input validation and password hashing (bcrypt).
  - `POST /api/v1/auth/login`: Public login endpoint issuing secure, stateful server-side sessions (protected against login CSRF).
  - `POST /api/v1/auth/logout`: **Protected** route that invalidates the current session and clears cookies.
  - `GET /api/v1/users/me`: **Protected** route guarded by session authentication to retrieve the currently logged-in user profile.
- **Robust Validation & Error Handling**:
  - Global `ValidationPipe` with input whitelist and type transformation.
  - Form-friendly validation exception factory ordering constraint checks (e.g. prioritizing `isNotEmpty` before complex regex checks).
  - Standardized JSON responses for validation errors formatted as `{ [field]: errorMessage }`.
  - Custom response interceptor transforming successful API responses into consistent structures `{ message, code, data }`.
- **Security, CORS & CSRF Protection**:
  - **CORS Protection**: Configured in `src/main.ts` with `app.enableCors(...)` allowing trusted frontend origins, credentials, and standard HTTP methods.
  - **Global Application CSRF Protection**: Enabled in `src/main.ts` via `app.enableCsrfProtection({ trustedOrigins })` to guard application mutating routes against cross-site request forgery.
  - **Login CSRF Defense via `@nestjs/authentication`**: `trustedOrigins` in `session` configuration specifically protects `signIn()` from Login CSRF (preventing malicious third-party origins from posting credentials and signing a victim's browser into an attacker's session).
  - **Session Management**: Session-based authentication with MongoDB persistence, sliding idle expiration, and absolute lifetimes.
  - **Automatic Expiration**: Automated database cleanup via MongoDB TTL index (`expireAfterSeconds: 0`).
  - **Configurable Cookie Security**: Environment-controlled `AUTH_COOKIE_SECURE` flag for HTTPS environments.
- **Observability & Logging**:
  - Built-in NestJS Logger for tracking application startup, requests, and lifecycle events.
  - Swagger documentation accessible at `/docs`.

---

## Tech Stack

- **Framework**: NestJS (v12)
- **Database**: MongoDB with Mongoose (v9)
- **Authentication & Security**: `@nestjs/authentication` (Session-based, Login CSRF protection)
- **Validation**: `class-validator` & `class-transformer`
- **Configuration & Schema Validation**: `@nestjs/config` with `joi`
- **Documentation**: `@nestjs/swagger`
- **Testing**: Vitest

---

## Project Setup

### 1. Prerequisites
- Node.js (v20+ recommended)
- MongoDB instance running locally or hosted (e.g., MongoDB Atlas)

### 2. Environment Configuration
Create a `.env` file in the root directory (or update the existing one) with the following variables:

```env
# Application
APP=Easygenerators-Assessment
PORT=3000
HOST=http://localhost:3000

# Database
# Update with your MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/easygenerators-assessment

# Security & CORS
# Comma-separated list of allowed origins (used for CORS and CSRF trustedOrigins)
CORS_ORIGINS=http://localhost:5173
BCRYPT_ROUNDS=10

# Session Configuration
SESSION_MAX_AGE_DAYS=14
SESSION_IDLE_TIME_DAYS=3
# Set to true in production over HTTPS; false for local HTTP development
AUTH_COOKIE_SECURE=false
```

> **Developer Note on Security**:
> - **MongoDB URL (`MONGODB_URI`)**: Specify your local or remote database connection URI.
> - **CORS & CSRF Origins (`CORS_ORIGINS`)**: Configure comma-separated allowed origins (e.g., `http://localhost:5173,https://my-frontend.com`). This value is wired directly into:
>   1. `app.enableCors({ origin, credentials: true })` in `src/main.ts` for browser CORS headers.
>   2. `app.enableCsrfProtection({ trustedOrigins })` in `src/main.ts` for global application-level CSRF defense.
>   3. `NestAuthenticationModule.forRootAsync({ session: { trustedOrigins } })` in `src/modules/authentication/authentication.module.ts` for defending `signIn()` against Login CSRF attacks.
> - **Cookie Security (`AUTH_COOKIE_SECURE`)**: Keep `false` during local development over plain `http://` so browsers don't reject cookies. Set to `true` in production environments running on `https://`.

### 3. Installation

```bash
npm install
```

### 4. Running the Application

```bash
# Development mode with hot-reload
npm run start:dev

# Production build & run
npm run build
npm run start:prod
```

### 5. API Documentation

Once the app is running, access Swagger UI at:
```
http://localhost:3000/docs
```

---

## API Endpoints Overview

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Registers a new user account |
| `POST` | `/api/v1/auth/login` | Public | Authenticates user and issues session cookie (Login CSRF protected) |
| `POST` | `/api/v1/auth/logout` | **Protected** | Revokes current session and clears cookie |
| `GET` | `/api/v1/users/me` | **Protected** | Fetches the current authenticated user |

---

## Validation Rules for Signup

- **Email**: Must be a valid email format (`@IsEmail()`).
- **Name**: Must be at least 3 characters long (`@MinLength(3)`).
- **Password**:
  - Minimum 8 characters (`@MinLength(8)`).
  - At least one letter (`a-z` or `A-Z`).
  - At least one number (`0-9`).
  - At least one special character (e.g., `!@#$%^&*`).
