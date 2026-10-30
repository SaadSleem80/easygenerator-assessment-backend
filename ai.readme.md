# AI Assistance & Collaboration Report (`ai.readme`)

This document outlines the adoption of AI assistance throughout the development of the **Easygenerator Assessment** backend, detailing the strategy, effective prompt designs, implemented components, and critical manual reviews and reworks performed to guarantee clean architecture and optimal performance.

---

## 1. Objective & AI Collaboration Philosophy

The goal of utilizing AI assistance was to accelerate boilerplate generation and time-consuming manual implementations—such as repetitive DTO definitions, custom validation error extractors, Mongoose schemas, and repository adapters—while maintaining complete control over:
- **Clean Architecture & Separation of Concerns**: Strict decoupling across controllers, services, repositories, schemas, and DTOs.
- **Code Maintainability & Optimization**: Writing clean, modern TypeScript adhering to NestJS best practices.
- **Security & Integrity**: Ensuring sensitive data (passwords) is never exposed, sessions are securely handled, and validation rules cannot be bypassed.

---

## 2. Components Developed with AI Assistance

### A. Session Schema & MongoDB TTL (`session.schema.ts`)
- **Generated**: Defined the Mongoose schema for `@nestjs/authentication` session records, mapping identifiers, user reference, active timestamps, and metadata.
- **Benefit**: Added the MongoDB TTL index (`expireAfterSeconds: 0` on `expiresAt`) for automated database-level session cleanup without manual cron jobs.

### B. Validation Exception Factory (`validation-exception.factory.ts`)
- **Generated**: Created a custom exception factory for NestJS's `ValidationPipe` that formats `class-validator` errors into a client-friendly key-value object (`{ [field]: "Error message" }`).
- **Ordered Error Resolution**: Implemented constraint prioritization so that `isNotEmpty` (required field check) triggers before format or regex constraints, preventing confusing UI states where an empty field shows "Password must contain a special character".

### C. DTOs & Validation Decorators (`signup.dto.ts`, `login.dto.ts`, `register.dto.ts`)
- **Generated**: Input validation models annotated with `class-validator` rules and Swagger `@ApiProperty` documentation:
  - Email format validation.
  - Name minimum length (3 chars).
  - Password complexity: $\ge 8$ characters, at least 1 letter, 1 number, and 1 special character via regex.

### D. Data Mappers (`user.mapper.ts`)
- **Generated**: Isolated mapper classes converting incoming DTOs to User Entities and database models to safe `UserResponseDto` representations (stripping hashed passwords and sensitive internals).

### E. Session Repository Adapter (`session.repository.ts`)
- **Generated**: Implemented the `SessionStore` contract required by `@nestjs/authentication`, implementing `getSession`, `createSession`, `touchSession`, and `deleteSession`.

---

## 3. Effective Prompts & Methodological Approaches

The following prompt strategies yielded the most practical and accurate results:

1. **Context-Rich Scoping with Explicit Rules**:
   - *Example Approach*: Providing exact field constraints (e.g., regex patterns, minimum length, and order of error messages) produced turnkey DTOs that needed zero follow-up corrections.
2. **Directing Output Structures for Frontend Usability**:
   - *Example Approach*: Explicitly instructing the factory to produce a `{ [field]: errorMessage }` map rather than generic string arrays from NestJS.
3. **Specifying Design Patterns**:
   - Asking for static factory methods (e.g., `User.create(data)`) and dedicated mapper classes (`UserMapper.toEntity`, `UserMapper.toResponseDto`) ensured separation of concerns without leaking ORM/Mongoose details into controllers.

---

## 4. Manual Corrections & Reworks

While AI provided great velocity, critical manual adjustments were required to resolve real-world integration issues:

### A. Mongoose ID Query Bug (`UserService.findById`)
- **Issue Discovered**: When the AI generated the user lookup for session validation:
  ```typescript
  // Initial implementation
  async findById(id: string): Promise<UserDocument | null> {
    return this.userEntity.findOne({ id });
  }
  ```
  This queried MongoDB for a field literally named `id` instead of the internal `_id` field. As a result, valid active sessions always returned `null`, triggering a **401 Unauthorized** error on protected routes (`/users/me`).
- **Correction Applied**: Reworked the query to use Mongoose's built-in `findById(id)` (which targets `_id`), immediately restoring proper session validation.

### B. ESM / TypeScript Path Aliasing Compatibility
- **Adjustment**: Ensured path aliases (`@src/*`) configured in `tsconfig.json` matched NestJS's build requirements and module resolution under NodeNext / ESM without relying on deprecated options like `baseUrl`.

### C. Cookie Security in Local Development
- **Adjustment**: Guarded cookie secure flags with environment configuration (`AUTH_COOKIE_SECURE=false` for local `http://` testing vs `true` for production `https://`), preventing browsers from silently rejecting session cookies during testing.

---

## 5. Summary

Leveraging AI as an architectural accelerator allowed rapid delivery of boilerplate-heavy tasks (DTOs, repositories, mappings, validation formatters) without sacrificing code quality. Active human oversight and targeted debugging ensured that edge cases—such as Mongoose query mechanics and cookie transmission rules—were identified and corrected.

