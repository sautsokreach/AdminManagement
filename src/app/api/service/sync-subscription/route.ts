import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";

const SERVICE_KEY = process.env.SERVICE_API_KEY;

// POST /api/service/sync-subscription
// Called by OnlinePosSystem after payment confirmation.
// Finds or creates a User by email, then upserts the Subscription.
// Body: { email, name?, planName, billingCycle, referenceCode, endDate }
export async function POST(req: NextRequest) {
  if (!SERVICE_KEY || req.headers.get("x-service-key") !== SERVICE_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, name, planName, billingCycle, referenceCode, endDate } = await req.json();
  if (!email || !planName) {
    return NextResponse.json({ error: "email and planName are required" }, { status: 400 });
  }

  const productType = await db.productType.findFirst({
    where: { name: planName, isActive: true },
  });
  if (!productType) {
    return NextResponse.json({ error: `Plan "${planName}" not found` }, { status: 404 });
  }

  // Find or create the user by email
  let user = await db.user.findUnique({ where: { email } });
  if (!user) {
    user = await db.user.create({
      data: {
        email,
        name: name ?? null,
        password: randomBytes(32).toString("hex"),
        role: "user",
      },
    });
  }

  // Upsert the subscription
  await db.subscription.upsert({
    where: { userId: user.id },
    update: {
      productTypeId: productType.id,
      status: "active",
      billingCycle: billingCycle ?? "monthly",
      externalSubscriptionId: referenceCode,
      startDate: new Date(),
      endDate: endDate ? new Date(endDate) : null,
    },
    create: {
      userId: user.id,
      productTypeId: productType.id,
      status: "active",
      billingCycle: billingCycle ?? "monthly",
      externalSubscriptionId: referenceCode,
      endDate: endDate ? new Date(endDate) : null,
    },
  });

  return NextResponse.json({ ok: true });
}
