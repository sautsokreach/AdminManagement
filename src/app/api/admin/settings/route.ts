import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const DEFAULTS: Record<string, string> = {
  trial_days: "30",
  khqr_account_id: "",
  khqr_merchant_name: "MY POS SYSTEM",
  khqr_merchant_city: "PHNOM PENH",
  khqr_currency: "USD",
};

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = await db.systemSetting.findMany();
  const settings = { ...DEFAULTS };
  for (const row of rows) settings[row.key] = row.value;

  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body: Record<string, string> = await req.json();
  const allowed = Object.keys(DEFAULTS);
  const entries = Object.entries(body).filter(([k]) => allowed.includes(k));

  await Promise.all(
    entries.map(([key, value]) =>
      db.systemSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
