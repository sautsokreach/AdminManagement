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
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { userId, productTypeId, externalSubscriptionId, endDate } = body;

  if (!userId || !productTypeId) {
    return NextResponse.json({ error: "userId and productTypeId are required" }, { status: 400 });
  }

  const [user, productType] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { id: true } }),
    db.productType.findUnique({ where: { id: productTypeId }, select: { id: true } }),
  ]);

  if (!user) {
    return NextResponse.json({ error: `User not found: ${userId}` }, { status: 404 });
  }
  if (!productType) {
    return NextResponse.json({ error: `Product type not found: ${productTypeId}` }, { status: 404 });
  }

  const subscription = await db.subscription.upsert({
    where: { userId },
    create: {
      userId,
      productTypeId,
      externalSubscriptionId,
      endDate: endDate ? new Date(endDate) : undefined,
      status: "active",
    },
    update: {
      productTypeId,
      externalSubscriptionId,
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
