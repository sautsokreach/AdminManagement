import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const SERVICE_KEY = process.env.SERVICE_API_KEY;

export async function GET(req: NextRequest) {
  if (!SERVICE_KEY || req.headers.get("x-service-key") !== SERVICE_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [plans, settings] = await Promise.all([
    db.productType.findMany({
      where: { isActive: true },
      include: { features: { where: { isEnabled: true } } },
      orderBy: { createdAt: "asc" },
    }),
    db.systemSetting.findMany(),
  ]);

  const cfg = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  return NextResponse.json({
    plans: plans.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      priceMonthly: p.priceMonthly ? Number(p.priceMonthly) : null,
      priceYearly: p.priceYearly ? Number(p.priceYearly) : null,
      features: p.features.map((f) => ({ key: f.key, name: f.name })),
    })),
    trialDays: cfg.trial_days ? parseInt(cfg.trial_days) : 30,
    khqr: {
      accountId: cfg.khqr_account_id ?? "",
      merchantName: cfg.khqr_merchant_name ?? "",
      merchantCity: cfg.khqr_merchant_city ?? "",
      currency: cfg.khqr_currency ?? "USD",
    },
  });
}
