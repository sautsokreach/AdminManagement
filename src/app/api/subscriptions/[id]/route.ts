import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await db.subscription.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const sub = await db.subscription.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, name: true } },
      productType: { include: { features: true } },
    },
  });

  if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(sub);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, productTypeId, endDate } = body;

  const sub = await db.subscription.update({
    where: { id },
    data: {
      status,
      productTypeId,
      endDate: endDate ? new Date(endDate) : undefined,
    },
    include: {
      user: { select: { id: true, email: true, name: true } },
      productType: true,
    },
  });

  return NextResponse.json(sub);
}
