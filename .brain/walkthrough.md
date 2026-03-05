# Artesana - Secure Authentication Upgrade

I have successfully upgraded the application to a robust, industry-standard authentication system using **NextAuth.js**.

## Key Improvements

### 1. Robust Session Management
Moved from basic `localStorage` flags to secure, cookie-based sessions. This prevents session state from being easily stolen and provides a professional foundation for growth.

### 2. Secure User Database
- **Model Added**: A new `User` model now exists in the database.
- **Encrypted Passwords**: Passwords are never stored in plain text; they are hashed using `bcrypt` before being saved to the database.

### 3. Professional Login Flow
- **Clean UI**: Usernames and passwords are no longer pre-filled, forcing a real login experience.
- **Middleware Protection**: All routes under `/admin` (except login) are automatically protected at the server level.

## Technical Details
- **Provider**: NextAuth.js (Auth.js) Credentials Provider.
- **Encryption**: `bcryptjs` for password hashing.
- **Database**: Prisma ORM with PostgreSQL (Neon) and SQLite (Local).

## Verification
- [x] Manual login with `admin@artesana.com`.
- [x] Automatic redirect to `/admin/login` when accessing the dashboard unauthenticated.
- [x] Successful logout clearing all cookies and sessions.

---
*The application is now more secure and ready for a multi-user environment if needed in the future.*
