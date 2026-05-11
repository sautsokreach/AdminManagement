import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Service-to-service endpoint — authenticated by X-Service-Key header, not by user session.
// Called by OnlinePosSystem to resolve which feature keys are active for a given company.
export async function GET(req: NextRequest) {
  const serviceKey = req.headers.get("x-service-key");
  if (!serviceKey || serviceKey !== process.env.SERVICE_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminUserId = req.nextUrl.searchParams.get("adminUserId");
  if (!adminUserId) {
    return NextResponse.json({ error: "adminUserId is required" }, { status: 400 });
  }

  const subscription = await db.subscription.findUnique({
    where: { userId: adminUserId },
    include: {
      productType: {
        include: { features: { where: { isEnabled: true } } },
      },
    },
  });

  if (!subscription || subscription.status !== "active") {
    return NextResponse.json({ features: [] });
  }

  const features = subscription.productType.features.map((f) => f.key);
  return NextResponse.json({ features, productType: subscription.productType.name });
}
