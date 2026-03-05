# Secure Authentication Implementation Plan (NextAuth.js)

The goal is to replace the current basic authentication with a robust, session-based system using **NextAuth.js** (Auth.js) and secure password hashing with **bcryptjs**.

## User Review Required

> [!IMPORTANT]
> - **Real User in DB**: We will create a `User` table in the database. I will provide a way to create the first user (e.g., a special script or seed) so you don't depend on a hardcoded "admin" username.
> - **Session Management**: Authentication will no longer rely on `localStorage`, but on secure, HttpOnly cookies managed by NextAuth.
> - **UI Changes**: The "Username" (email) and "Password" fields will be empty by default, requiring the administrator to type their credentials manually.

## Proposed Changes

### [Dependencies]
- Install `next-auth@beta` (Auth.js) and `bcryptjs`.
- Install `@types/bcryptjs` for development.

### [Database & Prisma]
#### [MODIFY] [schema.prisma](file:///c:/Users/andreslmorenom/tiendaluz/prisma/schema.prisma)
- Add a `User` model to store admin credentials:
```prisma
model User {
  id       String @id @default(cuid())
  email    String @unique
  password String // Hashed
}
```

### [Authentication Logic]
#### [NEW] [auth.ts](file:///c:/Users/andreslmorenom/tiendaluz/src/auth.ts)
- Configure NextAuth with the `Credentials` provider.
- Implement the `authorize` function to verify the hashed password against the database.

#### [NEW] [route.ts](file:///c:/Users/andreslmorenom/tiendaluz/src/app/api/auth/[...nextauth]/route.ts)
- Export the NextAuth GET and POST handlers.

#### [NEW] [middleware.ts](file:///c:/Users/andreslmorenom/tiendaluz/src/middleware.ts)
- Protect all `/admin` routes (except `/admin/login`) using NextAuth middleware.

### [Frontend UI]
#### [MODIFY] [login/page.tsx](file:///c:/Users/andreslmorenom/tiendaluz/src/app/admin/login/page.tsx)
- Remove the `username` input field.
- Update the form to use `signIn` from `next-auth/react`.
- Update error handling for the new authentication flow.

#### [MODIFY] [SettingsContext.tsx](file:///c:/Users/andreslmorenom/tiendaluz/src/context/SettingsContext.tsx)
- Remove the local `isAuthenticated` state and `login` function as they will be handled by NextAuth session.

## Verification Plan

### Automated Tests
- Verify the build process completes without errors.
- Check the logs for successful Prisma generation and build.

### Manual Verification
1. Access `/admin` without being logged in -> Verify redirect to `/admin/login`.
2. Login with correct credentials -> Verify session creation and redirect to dashboard.
3. Verify that removing the `is_admin_auth` flag from `localStorage` no longer logs you out (since sessions are cookie-based now).
4. Verify the "Username" field is gone from the UI.
