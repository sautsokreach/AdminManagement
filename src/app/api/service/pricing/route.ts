import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Service-to-service: returns active plan pricing and trial settings.
// Called by OnlinePosSystem to populate the subscription/upgrade page.
export async function GET(req: NextRequest) {
  const serviceKey = req.headers.get("x-service-key");
  if (!serviceKey || serviceKey !== process.env.SERVICE_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [productTypes, settings] = await Promise.all([
    db.productType.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        priceMonthly: true,
        priceYearly: true,
        features: { where: { isEnabled: true }, select: { key: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    db.systemSetting.findMany(),
  ]);

  const settingsMap: Record<string, string> = {
    trial_days: "30",
    khqr_account_id: "",
    khqr_merchant_name: "MY POS SYSTEM",
    khqr_merchant_city: "PHNOM PENH",
    khqr_currency: "USD",
  };
  for (const s of settings) settingsMap[s.key] = s.value;

  return NextResponse.json({
    plans: productTypes.map((p) => ({
      ...p,
      priceMonthly: p.priceMonthly ? Number(p.priceMonthly) : null,
      priceYearly: p.priceYearly ? Number(p.priceYearly) : null,
    })),
    trialDays: parseInt(settingsMap.trial_days),
    khqr: {
      accountId: settingsMap.khqr_account_id,
      merchantName: settingsMap.khqr_merchant_name,
      merchantCity: settingsMap.khqr_merchant_city,
      currency: settingsMap.khqr_currency as "USD" | "KHR",
    },
  });
}
