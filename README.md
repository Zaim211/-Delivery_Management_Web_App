# Delivery Management Web App

A mobile-first full-stack web app to manage products, delivery zones and orders. Zones are drawn on an interactive map, and every order address is validated on the server against all zones.

- **Live site (HTTPS):** https://delivery-management-web-app.vercel.app
- **GitHub repository:** https://github.com/Zaim211/-Delivery_Management_Web_App
- **Start time of the challenge:** 2026-10-22 21:10 (Africa/Casablanca)
- **Submission time:** 2026-10-22 22:20 (Africa/Casablanca)

## Test credentials

| Field    | Value                      |
| -------- | -------------------------- |
| Email    | yousseftitazaim@gmail.com  |
| Password | Test1234!                  |

You can also create your own account from the sign-up page.

## Features

- **Authentication:** sign up, log in, log out. Passwords hashed with bcrypt, session stored as a JWT in an httpOnly cookie. All pages and API routes are protected, and each user only sees their own data.
- **Products:** create products (name, price, quantity), list them, and assign each product to one or more delivery zones.
- **Zones:** click on an OpenStreetMap map to set a center, give the zone a name and a radius, and save. All zones are shown as circles on the map.
- **Orders:** choose a product and a quantity, then pick the customer's address by clicking on the map. The server computes the distance (haversine) to every zone center:
  - inside at least one zone: the order is accepted and linked to that zone;
  - outside all zones: the order is rejected with a clear error message.
  - The stock quantity is also checked.
- **Dashboard:** list of zones with, for each one, its products and its orders, plus a map showing the zone circles.
- **Mobile-first UI:** responsive layout, bottom navigation on mobile, cards instead of wide tables, large tap targets.

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Prisma ORM + PostgreSQL (Neon)
- Zod (validation), bcryptjs (password hashing), jose (JWT)
- Leaflet + react-leaflet + OpenStreetMap tiles (no API key needed)
- Deployment on Vercel

## Project structure

```
src/
  app/            Pages and API route handlers
  components/     UI components (map, forms, cards, navigation)
  lib/            Prisma client, auth helpers, geo (haversine) helpers
prisma/
  schema.prisma   Database schema
  seed.ts         Seed script (creates the test user)
```

## Local setup

### 1. Prerequisites

- Node.js 18.18 or newer
- A PostgreSQL database (a free Neon project works well)

### 2. Install

```bash
git clone https://github.com/Zaim211/-Delivery_Management_Web_App
cd -Delivery_Management_Web_App
npm install
```

### 3. Environment variables

Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

| Variable       | Description                                              |
| -------------- | -------------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string                             |
| `JWT_SECRET`   | Long random string used to sign sessions (32+ chars)     |

Generate a secret with:

```bash
# macOS / Linux
openssl rand -base64 32

# Windows PowerShell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```


### 4. Database

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

The seed creates the test user `yousseftitazaim@gmail.com` / `Test1234!`.

### 5. Run

```bash
npm run dev
```

Open http://localhost:3000.

## Deployment (Vercel)

1. Push the repository to GitHub.
2. Create a PostgreSQL database on [Neon](https://neon.tech) and copy its connection string.
3. On [Vercel](https://vercel.com), click **Add New > Project** and import the GitHub repository.
4. In **Settings > Environment Variables**, add `DATABASE_URL` and `JWT_SECRET` (never put them in the repo).
5. Make sure the build script runs Prisma client generation:
   ```json
   "build": "prisma generate && next build"
   ```
6. Deploy. Vercel serves the site over HTTPS automatically.
7. Apply the schema and seed the production database from your machine, using the production `DATABASE_URL`:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```
8. Verify: sign in with the test credentials, refresh on several pages (the session must persist), and open the live URL on a phone.

## How the zone validation works

When an order is submitted, the server (never the client) does the check:

1. Load all zones of the user.
2. For each zone, compute the haversine distance between the chosen address and the zone center.
3. If the distance is less than or equal to the zone radius, the address is valid and the order is assigned to that zone (the closest matching zone if several overlap).
4. If no zone matches, the API returns an error and the order is not created.

## AI tools used

- **DeepSeek:** used as a pair-programming assistant to scaffold the project, generate the Prisma schema, API routes, Leaflet map components and the README, and to help debug errors.
- All generated code was reviewed, run and tested manually (sign-up/login, zone creation, valid and invalid order addresses, dashboard, mobile layout) before submission.

## Known limitations

- Zones are circles only (center + radius).
- Addresses are chosen by clicking on the map; there is no text address search or geocoding.
- Orders cannot be edited after creation.

## Author

Youssef Titazaim, [GitHub](https://github.com/Zaim211)