# AdminManagement — Project Guide

## Project Overview

This is the **AdminManagement** system — a backend service for administrators to manage:
- **Users & Subscriptions** — which users are subscribed to which plans
- **Product Types** — categories of products/plans (e.g. Basic, Pro, Enterprise)
- **Product Features** — individual features that belong to a product type (addable, removable)

> **Integration note:** This project does NOT handle payment processing. Money/billing is delegated to a separate subscription service (external project). This project consumes subscription status from that system and manages what features/access each subscription tier unlocks.

---

## Architecture

```
AdminManagement/
├── app/
│   ├── (admin)/            # Admin-only layout & pages
│   │   ├── users/          # User management pages
│   │   ├── subscriptions/  # Subscription management pages
│   │   ├── product-types/  # ProductType pages
│   │   └── product-features/ # Feature management pages
│   ├── api/
│   │   ├── users/          # Route handlers for users
│   │   ├── subscriptions/  # Route handlers for subscriptions
│   │   ├── product-types/  # Route handlers for product types
│   │   ├── product-features/ # Route handlers for features
│   │   └── webhooks/       # External billing webhook receiver
│   └── layout.tsx
├── components/             # Shared UI components (Tailwind)
├── lib/
│   ├── db.ts               # Prisma client singleton
│   ├── auth.ts             # NextAuth config
│   └── utils.ts            # Shared helpers
├── prisma/
│   ├── schema.prisma       # DB schema
│   └── migrations/
└── CLAUDE.md
```

---

## Core Domain Models

### User
- `id`, `email`, `name`, `role` (admin | user), `createdAt`
- A user can have one active subscription at a time

### ProductType
- `id`, `name`, `description`, `isActive`
- Examples: `free`, `basic`, `pro`, `enterprise`
- Extensible — new product types can be added without code changes

### ProductFeature
- `id`, `productTypeId` (FK), `name`, `key`, `description`, `isEnabled`
- Each feature belongs to exactly one ProductType
- Features can be **added dynamically** by admins at runtime
- `key` is a unique slug used to check feature access in code (e.g. `"export_csv"`, `"api_access"`)

### Subscription
- `id`, `userId` (FK), `productTypeId` (FK), `status` (active | cancelled | expired)
- `externalSubscriptionId` — ID from the external payment/billing service
- `startDate`, `endDate`

---

## Key Principles

1. **Features are data, not code** — Admins add/remove features from product types via the admin UI or API. No deployment needed.
2. **Payment is external** — This service only stores subscription status synced from the billing system. Never process payments here.
3. **Role-based access** — All admin endpoints require `role = admin`. User-facing read endpoints require authentication.
4. **Soft deletes** — ProductTypes and Features use `isActive` / `isEnabled` flags rather than hard deletes to preserve subscription history.

---

## API Endpoint Conventions

| Resource | Route Handler Path |
|---|---|
| Product Types | `app/api/product-types/route.ts` → `GET` / `POST` |
| Product Type by ID | `app/api/product-types/[id]/route.ts` → `GET` / `PATCH` / `DELETE` |
| Features for a type | `app/api/product-types/[id]/features/route.ts` → `GET` / `POST` |
| Feature by ID | `app/api/product-features/[id]/route.ts` → `GET` / `PATCH` / `DELETE` |
| Users | `app/api/users/route.ts` → `GET` / `POST` |
| User subscription | `app/api/users/[id]/subscription/route.ts` → `GET` |
| All subscriptions | `app/api/subscriptions/route.ts` → `GET` / `POST` |
| Subscription by ID | `app/api/subscriptions/[id]/route.ts` → `GET` / `PATCH` |
| Billing webhook | `app/api/webhooks/billing/route.ts` → `POST` |

---

## Integration with External Billing System

- The billing system sends webhook events (e.g. `subscription.created`, `subscription.cancelled`) to this service
- This service stores `externalSubscriptionId` to link records
- Subscription status is updated via webhook handler — **never manually set status without a matching external event**
- When checking if a user has access to a feature: look up their active subscription → get productTypeId → check if feature key is enabled on that product type

---

## Admin Use Cases

1. **Create a new product type** — define name, description
2. **Add features to a product type** — add a feature with a unique `key` and toggle `isEnabled`
3. **Assign a subscription to a user** — link user + productType + externalSubscriptionId
4. **View all users and their current subscription status**
5. **Deactivate a product type** — sets `isActive = false`; existing subscriptions are preserved but no new subscriptions can be created for it

---

## Tech Stack

- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** NextAuth.js with JWT / role claims
- **API:** Next.js Route Handlers (`app/api/...`)
- **External billing:** (specify the billing system name here, e.g. Stripe, Paddle, custom)

---

## Development Notes

- When adding a new feature to a ProductType, always use the `key` field as the stable identifier — display names can change but keys should not
- Feature flag checks in other services should call this API using the `key`, not the feature `id` or `name`
- The external billing project is a separate repo; coordinate schema changes to `externalSubscriptionId` format with that team
