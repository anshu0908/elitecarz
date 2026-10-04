This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Production Deployment (Vercel + Turso)

EliteCarz uses Next.js 16 App Router with Prisma 7 and the libSQL driver adapter (SQLite locally, Turso in production).

### 1. Database Setup (Turso)
1. Create a database on [Turso](https://turso.tech/):
   ```bash
   turso db create elitecarz
   turso db show elitecarz --url
   turso db tokens create elitecarz
   ```
2. Run database migrations to your remote Turso database:
   ```bash
   # Windows PowerShell:
   $env:DATABASE_URL="libsql://<db>-<org>.turso.io"; $env:DATABASE_AUTH_TOKEN="<token>"; npm run db:remote:migrate
   # Seed inventory and demo accounts:
   $env:DATABASE_URL="libsql://<db>-<org>.turso.io"; $env:DATABASE_AUTH_TOKEN="<token>"; npm run db:seed
   ```

### 2. Environment Variables in Vercel
Add the following in your Vercel Project Settings > Environment Variables:
- `DATABASE_URL`: `libsql://<db>-<org>.turso.io` *(note: do not append `?sslmode=require`)*
- `DATABASE_AUTH_TOKEN`: `<your-turso-auth-token>`
- `SESSION_SECRET`: 32+ random characters (`openssl rand -hex 32`)
- `NEXT_PUBLIC_SITE_URL`: Your production domain (e.g. `https://elitecarz.in` or Vercel preview domain)
- `SHOW_DEMO_LOGINS`: `"true"` (for reviewer demo mode)

### 3. Reviewer Demo Admin Panel
For reviewers and stakeholders evaluating the project:
- Click the **Admin Panel [Demo]** button in the top-right header (or in the mobile menu).
- The sign-in page features 1-click quick-fill buttons for all roles:
  - **Owner (All Access)**: `owner@elitecarz.demo` / `EliteCarz@2026`
  - **Manager**: `manager@elitecarz.demo` / `EliteCarz@2026`
  - **Sales**: `sales@elitecarz.demo` / `EliteCarz@2026`
  - **Viewer (Read-only)**: `viewer@elitecarz.demo` / `EliteCarz@2026`
