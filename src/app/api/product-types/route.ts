import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const types = await db.productType.findMany({
    include: { features: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(types);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, description } = body;

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const type = await db.productType.create({
    data: { name, description },
    include: { features: true },
  });

  return NextResponse.json(type, { status: 201 });
}
