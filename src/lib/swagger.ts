export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Admin Management API",
    version: "1.0.0",
    description: "API for managing users, subscriptions, product types, and features.",
  },
  servers: [{ url: "/api", description: "Local" }],
  tags: [
    { name: "Users" },
    { name: "Product Types" },
    { name: "Product Features" },
    { name: "Subscriptions" },
    { name: "Webhooks" },
  ],
  components: {
    securitySchemes: {
      cookieAuth: { type: "apiKey", in: "cookie", name: "next-auth.session-token" },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          email: { type: "string", format: "email" },
          name: { type: "string", nullable: true },
          role: { type: "string", enum: ["admin", "user"] },
          createdAt: { type: "string", format: "date-time" },
          subscription: { $ref: "#/components/schemas/Subscription", nullable: true },
        },
      },
      ProductType: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string", nullable: true },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          features: { type: "array", items: { $ref: "#/components/schemas/ProductFeature" } },
        },
      },
      ProductFeature: {
        type: "object",
        properties: {
          id: { type: "string" },
          productTypeId: { type: "string" },
          name: { type: "string" },
          key: { type: "string", description: "Unique slug, never change after creation" },
          description: { type: "string", nullable: true },
          isEnabled: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Subscription: {
        type: "object",
        properties: {
          id: { type: "string" },
          userId: { type: "string" },
          productTypeId: { type: "string" },
          status: { type: "string", enum: ["active", "cancelled", "expired"] },
          externalSubscriptionId: { type: "string", nullable: true },
          startDate: { type: "string", format: "date-time" },
          endDate: { type: "string", format: "date-time", nullable: true },
        },
      },
      Error: {
        type: "object",
        properties: { error: { type: "string" } },
      },
    },
  },
  security: [{ cookieAuth: [] }],
  paths: {
    "/users": {
      get: {
        tags: ["Users"],
        summary: "List all users",
        responses: {
          200: { description: "Array of users", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/User" } } } } },
          403: { description: "Forbidden" },
        },
      },
      post: {
        tags: ["Users"],
        summary: "Create a user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  name: { type: "string" },
                  password: { type: "string" },
                  role: { type: "string", enum: ["admin", "user"], default: "user" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Created user", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
          400: { description: "Bad request", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get user by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "User", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
          404: { description: "Not found" },
        },
      },
      patch: {
        tags: ["Users"],
        summary: "Update user",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  role: { type: "string", enum: ["admin", "user"] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Updated user", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete user",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 204: { description: "Deleted" } },
      },
    },
    "/product-types": {
      get: {
        tags: ["Product Types"],
        summary: "List all product types",
        responses: {
          200: { description: "Array of product types", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/ProductType" } } } } },
        },
      },
      post: {
        tags: ["Product Types"],
        summary: "Create a product type",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", example: "Pro" },
                  description: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/ProductType" } } } },
          400: { description: "Bad request" },
        },
      },
    },
    "/product-types/{id}": {
      get: {
        tags: ["Product Types"],
        summary: "Get product type by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Product type", content: { "application/json": { schema: { $ref: "#/components/schemas/ProductType" } } } },
          404: { description: "Not found" },
        },
      },
      patch: {
        tags: ["Product Types"],
        summary: "Update product type",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  isActive: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Updated", content: { "application/json": { schema: { $ref: "#/components/schemas/ProductType" } } } } },
      },
      delete: {
        tags: ["Product Types"],
        summary: "Deactivate product type (soft delete)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 204: { description: "Deactivated" } },
      },
    },
    "/product-types/{id}/features": {
      get: {
        tags: ["Product Features"],
        summary: "List features for a product type",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Array of features", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/ProductFeature" } } } } },
        },
      },
      post: {
        tags: ["Product Features"],
        summary: "Add a feature to a product type",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "key"],
                properties: {
                  name: { type: "string", example: "Export CSV" },
                  key: { type: "string", example: "export_csv", description: "Unique slug — never change after creation" },
                  description: { type: "string" },
                  isEnabled: { type: "boolean", default: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/ProductFeature" } } } },
          400: { description: "Bad request" },
        },
      },
    },
    "/product-features/{id}": {
      get: {
        tags: ["Product Features"],
        summary: "Get feature by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Feature", content: { "application/json": { schema: { $ref: "#/components/schemas/ProductFeature" } } } } },
      },
      patch: {
        tags: ["Product Features"],
        summary: "Update a feature",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  isEnabled: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Updated", content: { "application/json": { schema: { $ref: "#/components/schemas/ProductFeature" } } } } },
      },
      delete: {
        tags: ["Product Features"],
        summary: "Delete a feature",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 204: { description: "Deleted" } },
      },
    },
    "/subscriptions": {
      get: {
        tags: ["Subscriptions"],
        summary: "List all subscriptions",
        responses: {
          200: { description: "Array of subscriptions", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Subscription" } } } } },
        },
      },
      post: {
        tags: ["Subscriptions"],
        summary: "Assign a subscription to a user",
        description: "Creates or replaces the user's current subscription (upsert by userId).",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId", "productTypeId"],
                properties: {
                  userId: { type: "string" },
                  productTypeId: { type: "string" },
                  externalSubscriptionId: { type: "string", description: "ID from your external billing system" },
                  endDate: { type: "string", format: "date-time", nullable: true },
                },
              },
              example: {
                userId: "clxyz123",
                productTypeId: "clpro456",
                externalSubscriptionId: "sub_abc123",
                endDate: "2027-01-01T00:00:00Z",
              },
            },
          },
        },
        responses: {
          201: { description: "Subscription assigned", content: { "application/json": { schema: { $ref: "#/components/schemas/Subscription" } } } },
          400: { description: "Bad request" },
        },
      },
    },
    "/subscriptions/{id}": {
      get: {
        tags: ["Subscriptions"],
        summary: "Get subscription by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Subscription", content: { "application/json": { schema: { $ref: "#/components/schemas/Subscription" } } } } },
      },
      patch: {
        tags: ["Subscriptions"],
        summary: "Update a subscription",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", enum: ["active", "cancelled", "expired"] },
                  productTypeId: { type: "string" },
                  endDate: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Updated", content: { "application/json": { schema: { $ref: "#/components/schemas/Subscription" } } } } },
      },
    },
    "/webhooks/billing": {
      post: {
        tags: ["Webhooks"],
        summary: "Receive billing events from external payment system",
        security: [],
        parameters: [
          { name: "x-webhook-secret", in: "header", required: true, schema: { type: "string" }, description: "Must match BILLING_WEBHOOK_SECRET env var" },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["event", "subscriptionId", "userId"],
                properties: {
                  event: { type: "string", enum: ["subscription.created", "subscription.cancelled", "subscription.expired"] },
                  subscriptionId: { type: "string", description: "ID from the billing system" },
                  userId: { type: "string" },
                  productTypeId: { type: "string" },
                  status: { type: "string" },
                  endDate: { type: "string", format: "date-time" },
                },
              },
              example: {
                event: "subscription.created",
                subscriptionId: "sub_abc123",
                userId: "clxyz123",
                productTypeId: "clpro456",
                endDate: "2027-01-01T00:00:00Z",
              },
            },
          },
        },
        responses: {
          200: { description: "Received", content: { "application/json": { schema: { type: "object", properties: { received: { type: "boolean" } } } } } },
          400: { description: "Unknown event or invalid payload" },
          401: { description: "Invalid webhook secret" },
        },
      },
    },
  },
};
