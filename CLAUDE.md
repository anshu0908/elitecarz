@AGENTS.md

# EliteCarz rebuild — working notes

The full project brief is in @BRIEF.md (Part B wins over Section 12 where they conflict).

## Stack decisions (as built)
- Next.js 16 App Router + TypeScript + Tailwind v4. Request APIs (`params`, `searchParams`, `cookies()`) are async; middleware is `proxy.ts`.
- Prisma 7 (`prisma-client` generator → `lib/generated/prisma`, config in `prisma.config.ts`) with the libSQL driver adapter. SQLite locally (`prisma/dev.db`); schema kept portable to Postgres. Arrays/JSON columns are stored as JSON strings in SQLite and parsed in `lib/` mappers.
- Auth: own email+password (bcrypt) with a signed JWT session cookie (`jose`). Roles/permissions live in `lib/permissions.ts` — check them in every server action, not just in the UI.
- Public reads go through `lib/cars.ts` `publicCarSelect` — never return purchase price, refurb cost, internal notes, full reg number, or unpublished cars from public code paths (covered by a test).

## Conventions
- Indian formatting via `lib/format.ts`: `₹14,75,000`, `₹14.75 L`, `+91 97111 63000`.
- Anything invented for the demo (inspection results, EMI rate, features) is flagged `DEMO` in data and visibly in the UI.
- No fabricated testimonials. Review cards use paraphrased Google review themes with attribution, marked as such.
- `data/source-cars.json` is a snapshot of the public elitecarz.in inventory (scripts/scrape-elitecarz.mjs) and is the seed source.
