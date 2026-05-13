# AdminManagement — Project Guide

## Project Overview

This is the **AdminManagement** system — the control plane for the OnlinePosSystem SaaS product. It manages:

- **Users & Subscriptions** — which companies (represented as users) are on which plans
- **Product Types** — subscription plans (e.g. Basic, Pro, Enterprise) with pricing
- **Product Features** — individual feature flags per plan (toggled at runtime, no deploy needed)
- **System Settings** — global config: trial duration, KHQR payment merchant info
- **Payment Requests** — view pending payments submitted from OnlinePosSystem

> **Integration note:** Payment processing (KHQR QR generation, payment request creation) happens in OnlinePosSystem. This project stores the resulting subscription records and exposes service APIs that OnlinePosSystem calls to check feature access and pricing.

---

## Architecture

```
AdminManagement/
├── src/
│   ├── app/
│   │   ├── admin/                   # Admin-only pages (requires role=admin)
│   │   │   ├── page.tsx             # Dashboard (stats)
│   │   │   ├── layout.tsx           # Admin nav sidebar
│   │   │   ├── users/               # User management
│   │   │   ├── subscriptions/       # Subscription list
│   │   │   ├── product-types/       # Plan management + pricing
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx         # Plan detail + features list
│   │   │   │       └── PricingForm.tsx  # Monthly/yearly price editor
│   │   │   ├── product-features/    # Feature flag editing
│   │   │   ├── payment-requests/    # Links to POS payment confirmation
│   │   │   └── settings/            # Global system settings (trial, KHQR)
│   │   ├── api/
│   │   │   ├── admin/settings/      # GET/PATCH system settings
│   │   │   ├── users/               # User CRUD
│   │   │   ├── subscriptions/       # Subscription CRUD
│   │   │   ├── product-types/       # Plan CRUD + pricing
│   │   │   ├── product-features/    # Feature CRUD
│   │   │   ├── service/
│   │   │   │   ├── subscription/    # Service API: feature keys for a user
│   │   │   │   └── pricing/         # Service API: plans, pricing, trial days, KHQR config
│   │   │   └── webhooks/billing/    # External billing webhook receiver
│   │   ├── api-docs/                # Swagger UI
│   │   ├── login/
│   │   └── unauthorized/
│   ├── lib/
│   │   ├── db.ts        # Prisma client singleton
│   │   ├── auth.ts      # NextAuth config (admin role check)
│   │   └── utils.ts
│   ├── middleware.ts     # Redirects unauthenticated to /login
│   └── types/next-auth.d.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── CLAUDE.md
```

---

## Commands

```bash
npm run dev        # Start development server (port 3001)
npm run build      # Production build
npm run db:migrate # Run DB migrations (prisma migrate dev)
npm run db:studio  # Open Prisma Studio
npm run db:seed    # Seed the database
```

---

## Core Domain Models

### User
- `id`, `email`, `name`, `password`, `role` (admin | user), `createdAt`
- Represents a **company** in the OnlinePosSystem (1:1 via `Company.adminUserId`)
- Has one active `Subscription` at a time

### ProductType (Subscription Plan)
- `id`, `name`, `description`, `isActive`
- `priceMonthly Decimal?` — monthly price in USD/KHR
- `priceYearly Decimal?` — yearly price in USD/KHR
- Examples: `free`, `basic`, `pro`, `enterprise`
- Extensible — add new plans without code changes

#### Recommended Pricing (USD, Cambodia market)

| Plan | Monthly | Yearly | Included features |
|---|---|---|---|
| Free / Trial | $0 | — | Basic sales only (trial: 30 days) |
| Basic | $9/mo | $89/yr | Sales + stock management |
| Pro | $19/mo | $179/yr | Sales + stock + reports + purchases |
| Enterprise | $39/mo | $349/yr | Everything + priority support |

- Yearly discount: ~15–20% off monthly rate
- Currency: USD (default); switch to KHR via `khqr_currency` system setting if needed
- Pricing is stored in `ProductType.priceMonthly` / `priceYearly` and editable at runtime via Admin → Product Types → [plan] → Save Pricing — no deployment needed

### ProductFeature
- `id`, `productTypeId` (FK), `name`, `key`, `description`, `isEnabled`
- `key` is a unique slug used by OnlinePosSystem to check access
- **Features are data, not code** — add/remove at runtime via admin UI

### Subscription
- `id`, `userId` (FK), `productTypeId` (FK)
- `status` (active | cancelled | expired)
- `billingCycle` (monthly | yearly)
- `externalSubscriptionId` — stores the `referenceCode` from OnlinePosSystem's `PaymentRequest`
- `startDate`, `endDate`

### SystemSetting
- Key-value store for global configuration
- Keys: `trial_days`, `khqr_account_id`, `khqr_merchant_name`, `khqr_merchant_city`, `khqr_currency`

---

## Key Principles

1. **Features are data, not code** — Admins add/remove features from product types via the admin UI. No deployment needed.
2. **Payment confirmation is automatic in OnlinePosSystem** — When a user clicks "I've Made the Payment", OnlinePosSystem verifies the transaction against the Bakong API (`check_transaction_by_md5`) and, if confirmed, calls `POST /api/subscriptions` here with a service key. No admin approval step is required. This project stores the resulting subscription record.
3. **Role-based access** — All `/admin/*` pages and `/api/*` mutation endpoints require `role = admin`. Service endpoints require `X-Service-Key` header.
4. **Soft deletes** — ProductTypes and Features use `isActive` / `isEnabled` flags. Never hard-delete to preserve subscription history.

---

## API Endpoint Conventions

### Admin-authenticated endpoints (require NextAuth session with `role = admin`)

| Resource | Path | Methods |
|---|---|---|
| Product Types | `app/api/product-types/route.ts` | GET, POST |
| Product Type by ID | `app/api/product-types/[id]/route.ts` | GET, PATCH (includes pricing), DELETE |
| Features for a type | `app/api/product-types/[id]/features/route.ts` | GET, POST |
| Feature by ID | `app/api/product-features/[id]/route.ts` | GET, PATCH, DELETE |
| Users | `app/api/users/route.ts` | GET, POST |
| User by ID | `app/api/users/[id]/route.ts` | GET, PATCH, DELETE |
| All subscriptions | `app/api/subscriptions/route.ts` | GET, POST |
| Subscription by ID | `app/api/subscriptions/[id]/route.ts` | GET, PATCH |
| System settings | `app/api/admin/settings/route.ts` | GET, PATCH |
| Billing webhook | `app/api/webhooks/billing/route.ts` | POST |

### Service-to-service endpoints (require `X-Service-Key: <SERVICE_API_KEY>` header)

| Path | Method | Purpose |
|---|---|---|
| `app/api/service/subscription` | GET `?email=` | Returns `{ features: string[] }` for the company's active subscription |
| `app/api/service/pricing` | GET | Returns all active plans with pricing, `trialDays`, and KHQR merchant config |
| `app/api/service/sync-subscription` | POST `{ email, name, planName, billingCycle, referenceCode, endDate }` | Finds-or-creates User by email, upserts Subscription. Single call for all sync needs. |

> `POST /api/subscriptions` still works (service key auth) for direct subscription creation, but `sync-subscription` is the preferred entry point from OnlinePosSystem.

---

## Integration with OnlinePosSystem

### How it works
1. OnlinePosSystem identifies companies to AdminManagement by **email** (`Company.email`, set at registration). There is no `adminUserId` stored in OnlinePosSystem.
2. On payment confirmation, OnlinePosSystem calls `POST /api/service/sync-subscription` with the company email + plan info. AdminManagement finds-or-creates the internal `User` record and upserts the `Subscription`. No pre-linking step needed.
3. OnlinePosSystem calls `GET /api/service/subscription?email=...` to check which feature keys are active for a company.
4. OnlinePosSystem calls `GET /api/service/pricing` to get plan pricing, trial duration, and KHQR config.

### Environment Variables
```env
SERVICE_API_KEY="your-shared-secret"      # Must match ADMIN_MANAGEMENT_SERVICE_KEY in OnlinePosSystem
NEXT_PUBLIC_POS_URL="http://localhost:3000" # URL of OnlinePosSystem (used in admin UI links)
```

### Feature Keys Used by OnlinePosSystem
These `key` values must exist as `ProductFeature` records in the database for feature-gating to work:

| Key | POS feature it gates |
|---|---|
| `pos_purchase` | Purchase module (purchase orders, suppliers) |
| `pos_report_sales` | Sales reports |
| `pos_report_purchase` | Purchase reports |
| `pos_report_stock` | Stock reports |
| `pos_stock_adjust` | Manual stock adjustments |

---

## Admin Use Cases

1. **Set trial duration** → Admin → Settings → Trial Duration (days)
2. **Configure KHQR** → Admin → Settings → KHQR Payment Settings (Bakong account ID, merchant name, city, currency)
3. **Create a plan** → Admin → Product Types → New → set name, description
4. **Set plan pricing** → Admin → Product Types → [plan] → Save Pricing (monthly/yearly)
5. **Add features to a plan** → Admin → Product Types → [plan] → Add Feature (set `key` carefully — it must match what OnlinePosSystem checks)
6. **Link a company** → Create a User here → copy the User ID → set it as `Company.adminUserId` in OnlinePosSystem
7. **Activate a subscription** → Happens automatically when the user clicks "I've Made the Payment" in OnlinePosSystem (no admin step). Can also be triggered manually via `POST /api/subscriptions` with the service key.
8. **View payment requests** → Admin → Payment Requests (links to OnlinePosSystem admin)

---

## Subscription Management

The `/admin/subscriptions` page is a full management UI — not read-only. Actions available per row: **Cancel**, **Reactivate**, **Change Plan**, **Delete**.

| File | Purpose |
|---|---|
| `src/app/admin/subscriptions/page.tsx` | Server component — fetches subscriptions + active plans |
| `src/app/admin/subscriptions/SubscriptionsClient.tsx` | Client component — table with Cancel/Reactivate/Change Plan/Delete buttons |
| `src/app/api/subscriptions/[id]/route.ts` | `GET`, `PATCH` (status, productTypeId, endDate), `DELETE` |
| `src/app/api/subscriptions/route.ts` | `GET` all (service key) + `POST` create/upsert (service key or admin session) |

### Why subscriptions populate automatically
OnlinePosSystem calls `POST /api/service/upsert-user` then `POST /api/subscriptions` via `lib/admin-sync.ts` on every payment confirmation. `Company.adminUserId` is set automatically — no manual linking needed. If a company was confirmed before auto-linking was implemented, `GET /api/subscription/status` in OnlinePosSystem will heal the link on the next request.

---

## KHQR System Settings

Stored in the `SystemSetting` table. Edit via Admin → Settings.

| Key | Description | Example |
|---|---|---|
| `trial_days` | Free trial duration for new companies | `30` |
| `khqr_account_id` | Bakong individual ID to receive payment | `012345678@bakong` |
| `khqr_merchant_name` | Shown on KHQR receipt (max 25 chars) | `MY POS SYSTEM` |
| `khqr_merchant_city` | City on KHQR receipt (max 15 chars) | `PHNOM PENH` |
| `khqr_currency` | Currency for all transactions | `USD` or `KHR` |

---

## Development Notes

- When adding a new feature to a ProductType, the `key` field is the stable identifier — display `name` can change but `key` must not (OnlinePosSystem hardcodes checks against it).
- `priceMonthly` and `priceYearly` on ProductType are in whatever currency `khqr_currency` is set to (default USD).
- The `POST /api/subscriptions` endpoint accepts both admin-session auth and service-key auth. Service-key calls can pass `productTypeName` instead of `productTypeId` for convenience.
- `BillingCycle` enum values are lowercase (`monthly`, `yearly`) in the DB but uppercase (`MONTHLY`, `YEARLY`) in OnlinePosSystem's schema — the confirm endpoint lowercases before sending.

---

## Database & Prisma 7 Configuration

### Prisma 7 Breaking Change: No URL in `schema.prisma`

Prisma 7 removed `url` and `directUrl` from the `datasource` block in `schema.prisma`. They are now configured exclusively in `prisma.config.ts`.

**`schema.prisma` datasource (no url fields):**
```prisma
datasource db {
  provider = "postgresql"
  schemas  = ["admin_management"]
}
```

**`prisma.config.ts` (handles connection URLs):**
```typescript
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    // Use || (not ??) so empty DIRECT_URL string falls back to DATABASE_URL
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});
```

**`src/lib/db.ts` — do NOT pass `datasourceUrl` to PrismaClient constructor:**
```typescript
new PrismaClient({ log: ["error"] });
```
Prisma 7 removed `datasourceUrl` from constructor options. The runtime client reads `DATABASE_URL` from the environment automatically (configured via `prisma.config.ts`).

### Neon PostgreSQL: Two Connection URLs

This project uses **Neon** (serverless PostgreSQL). Neon provides two URL types:

| Env Var | URL Type | When to Use |
|---|---|---|
| `DATABASE_URL` | Pooler URL (`-pooler.` in hostname) | Runtime (app queries) |
| `DIRECT_URL` | Direct URL (no `-pooler.`) | Prisma Migrate only |

Get `DIRECT_URL` from the Neon dashboard → Connection string → toggle off "Connection pooling".

**`.env`:**
```env
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/GeneraDB?sslmode=require"
DIRECT_URL=""   # Set to the direct (non-pooled) URL for migrations; leave empty in dev if not needed
```

> **`||` vs `??`**: Use `||` (logical OR) — not `??` (nullish coalescing) — when falling back from `DIRECT_URL` to `DATABASE_URL`. If `DIRECT_URL=""` (empty string), `??` treats it as a valid value and passes an empty string to Prisma, causing a "Connection url is empty" error. `||` treats empty string as falsy and correctly falls back to `DATABASE_URL`.

### Schema Isolation: `admin_management` PostgreSQL Schema

This project stores all tables in the `admin_management` PostgreSQL schema (not `public`). This is configured via:
```prisma
datasource db {
  provider = "postgresql"
  schemas  = ["admin_management"]
}
```
This isolates AdminManagement tables from other projects sharing the same Neon database.

### Database Sync: `db push` vs `migrate dev`

**In development**, use `prisma db push` to sync the schema without caring about migration history:
```bash
npx prisma db push
```

Use `prisma migrate dev` only when you need a clean, linear migration history. If the migration history is inconsistent with the actual DB state (common when provisioned via `db push` or direct SQL), `migrate dev` will report "drift detected" and fail.

**If drift is detected:**
```bash
# Mark an existing migration as already applied (it exists in files but not in _prisma_migrations)
npx prisma migrate resolve --applied 20260511061121_init

# Then retry the migration
npx prisma migrate dev --name your_change
```

If drift persists, fall back to `db push` for development and reserve `migrate dev` for production deployments with clean history.

### Upgrading Prisma Version

When upgrading Prisma, update both packages together:
```bash
npm install prisma@^7.x.x @prisma/client@^7.x.x
```
After any Prisma version upgrade, always run `npx prisma generate` to regenerate the client.
