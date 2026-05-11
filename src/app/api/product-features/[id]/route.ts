import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const feature = await db.productFeature.findUnique({ where: { id } });
  if (!feature) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(feature);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name, description, isEnabled } = body;

  const feature = await db.productFeature.update({
    where: { id },
    data: { name, description, isEnabled },
  });

  return NextResponse.json(feature);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await db.productFeature.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
