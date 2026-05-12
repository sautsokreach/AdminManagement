import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const SERVICE_KEY = process.env.SERVICE_API_KEY;

// GET /api/service/subscription?adminUserId=<id>
// Returns { features: string[] } — the enabled feature keys for the user's active subscription
export async function GET(req: NextRequest) {
  if (!SERVICE_KEY || req.headers.get("x-service-key") !== SERVICE_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminUserId = req.nextUrl.searchParams.get("adminUserId");
  if (!adminUserId) {
    return NextResponse.json({ features: [] });
  }

  const subscription = await db.subscription.findFirst({
    where: {
      userId: adminUserId,
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
  return NextResponse.json({ features });
}
