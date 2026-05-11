import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  if (secret !== process.env.BILLING_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { event, subscriptionId, userId, productTypeId, status, endDate } = body;

  if (!event || !subscriptionId || !userId) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (event === "subscription.created") {
    const user = await db.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) {
      return NextResponse.json({ error: `User not found: ${userId}` }, { status: 404 });
    }
  }

  switch (event) {
    case "subscription.created":
      await db.subscription.upsert({
        where: { userId },
        create: {
          userId,
          productTypeId,
          externalSubscriptionId: subscriptionId,
          status: "active",
          endDate: endDate ? new Date(endDate) : undefined,
        },
        update: {
          productTypeId,
          externalSubscriptionId: subscriptionId,
          status: "active",
          endDate: endDate ? new Date(endDate) : undefined,
        },
      });
      break;

    case "subscription.cancelled":
      await db.subscription.updateMany({
        where: { externalSubscriptionId: subscriptionId },
        data: { status: "cancelled" },
      });
      break;

    case "subscription.expired":
      await db.subscription.updateMany({
        where: { externalSubscriptionId: subscriptionId },
        data: { status: "expired" },
      });
      break;

    default:
      return NextResponse.json({ error: "Unknown event" }, { status: 400 });
  }

  return NextResponse.json({ received: true });
}
