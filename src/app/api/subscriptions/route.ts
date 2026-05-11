import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const subscriptions = await db.subscription.findMany({
    include: {
      user: { select: { id: true, email: true, name: true } },
      productType: { include: { features: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(subscriptions);
}

export async function POST(req: NextRequest) {
  // Allow both admin-session calls and service-key calls (from OnlinePosSystem on payment confirm)
  const serviceKey = req.headers.get("x-service-key");
  const isServiceCall = serviceKey && serviceKey === process.env.SERVICE_API_KEY;

  if (!isServiceCall) {
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const body = await req.json();
  const { userId, productTypeId, productTypeName, billingCycle, externalSubscriptionId, endDate } = body;

  if (!userId || (!productTypeId && !productTypeName)) {
    return NextResponse.json({ error: "userId and productTypeId (or productTypeName) are required" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) {
    return NextResponse.json({ error: `User not found: ${userId}` }, { status: 404 });
  }

  // Resolve productType by id or by name
  let productType = productTypeId
    ? await db.productType.findUnique({ where: { id: productTypeId }, select: { id: true } })
    : await db.productType.findUnique({ where: { name: productTypeName }, select: { id: true } });

  if (!productType) {
    return NextResponse.json({ error: "Product type not found" }, { status: 404 });
  }
  const resolvedProductTypeId = productType.id;

  const subscription = await db.subscription.upsert({
    where: { userId },
    create: {
      userId,
      productTypeId: resolvedProductTypeId,
      externalSubscriptionId,
      billingCycle: billingCycle ?? "monthly",
      endDate: endDate ? new Date(endDate) : undefined,
      status: "active",
    },
    update: {
      productTypeId: resolvedProductTypeId,
      externalSubscriptionId,
      billingCycle: billingCycle ?? "monthly",
      endDate: endDate ? new Date(endDate) : undefined,
      status: "active",
    },
    include: {
      user: { select: { id: true, email: true, name: true } },
      productType: true,
    },
  });

  return NextResponse.json(subscription, { status: 201 });
}
