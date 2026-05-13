import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";

const SERVICE_KEY = process.env.SERVICE_API_KEY;

// POST /api/service/upsert-user
// Called by OnlinePosSystem to find-or-create an AdminManagement user by email.
// Returns { userId } — the AdminManagement User.id to store as Company.adminUserId.
export async function POST(req: NextRequest) {
  if (!SERVICE_KEY || req.headers.get("x-service-key") !== SERVICE_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, name } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ userId: existing.id });
  }

  const user = await db.user.create({
    data: {
      email,
      name: name ?? null,
      // Unusable random password — this account is managed via OnlinePosSystem only
      password: randomBytes(32).toString("hex"),
      role: "user",
    },
  });

  return NextResponse.json({ userId: user.id }, { status: 201 });
}
