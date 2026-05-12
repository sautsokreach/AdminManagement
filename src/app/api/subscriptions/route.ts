import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const SERVICE_KEY = process.env.SERVICE_API_KEY;

function isServiceAuth(req: NextRequest) {
  return SERVICE_KEY && req.headers.get("x-service-key") === SERVICE_KEY;
}

// GET — admin session only
export async function GET(req: NextRequest) {
  if (!isServiceAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const subs = await db.subscription.findMany({
    include: {
      user: { select: { id: true, email: true, name: true } },
      productType: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(subs);
}

// POST — called by OnlinePosSystem after confirming a payment
// Accepts service key auth
// Body: { userId, productTypeName, billingCycle, externalSubscriptionId, endDate }
export async function POST(req: NextRequest) {
  if (!isServiceAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { userId, productTypeName, billingCycle, externalSubscriptionId, endDate } = body;

  if (!userId || !productTypeName) {
    return NextResponse.json({ error: "userId and productTypeName are required" }, { status: 400 });
  }

  const productType = await db.productType.findFirst({
    where: { name: productTypeName, isActive: true },
  });
  if (!productType) {
    return NextResponse.json({ error: `Plan "${productTypeName}" not found` }, { status: 404 });
  }

  const subscription = await db.subscription.upsert({
    where: { userId },
    update: {
      productTypeId: productType.id,
      status: "active",
      billingCycle: billingCycle ?? "monthly",
      externalSubscriptionId,
      startDate: new Date(),
      endDate: endDate ? new Date(endDate) : null,
    },
    create: {
      userId,
      productTypeId: productType.id,
      status: "active",
      billingCycle: billingCycle ?? "monthly",
      externalSubscriptionId,
      endDate: endDate ? new Date(endDate) : null,
    },
  });

  return NextResponse.json(subscription, { status: 201 });
}
