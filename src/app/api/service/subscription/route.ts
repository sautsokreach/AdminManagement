import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const SERVICE_KEY = process.env.SERVICE_API_KEY;

// GET /api/service/subscription?email=<email>
// Returns { features: string[] } — the enabled feature keys for the user's active subscription
export async function GET(req: NextRequest) {
  if (!SERVICE_KEY || req.headers.get("x-service-key") !== SERVICE_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ features: [] });
  }

  const user = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) {
    return NextResponse.json({ features: [] });
  }

  const subscription = await db.subscription.findFirst({
    where: {
      userId: user.id,
      status: "active",
    },
    include: {
      productType: {
        include: { features: { where: { isEnabled: true } } },
      },
    },
  });

  if (!subscription) {
    return NextResponse.json({ features: [] });
  }

  const features = subscription.productType.features.map((f) => f.key);
  return NextResponse.json({ features, planName: subscription.productType.name });
}
