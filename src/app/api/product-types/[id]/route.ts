import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const type = await db.productType.findUnique({
    where: { id },
    include: { features: true },
  });

  if (!type) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(type);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name, description, isActive } = body;

  const type = await db.productType.update({
    where: { id },
    data: { name, description, isActive },
    include: { features: true },
  });

  return NextResponse.json(type);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await db.productType.update({ where: { id }, data: { isActive: false } });
  return new NextResponse(null, { status: 204 });
}
