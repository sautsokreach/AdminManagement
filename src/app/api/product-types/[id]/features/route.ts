import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const features = await db.productFeature.findMany({
    where: { productTypeId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(features);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name, key, description, isEnabled } = body;

  if (!name || !key) {
    return NextResponse.json({ error: "Name and key are required" }, { status: 400 });
  }

  const feature = await db.productFeature.create({
    data: { productTypeId: id, name, key, description, isEnabled: isEnabled ?? true },
  });

  return NextResponse.json(feature, { status: 201 });
}
