import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import EditFeatureForm from "./EditFeatureForm";
import Link from "next/link";

export default async function EditFeaturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const feature = await db.productFeature.findUnique({
    where: { id },
    include: { productType: true },
  });
  if (!feature) notFound();

  return (
    <div className="max-w-lg space-y-6">
      <Link
        href={`/admin/product-types/${feature.productTypeId}`}
        className="text-sm text-gray-400 hover:text-gray-600"
      >
        ← {feature.productType.name}
      </Link>
      <h1 className="text-2xl font-bold">Edit Feature</h1>
      <EditFeatureForm feature={feature} />
    </div>
  );
}
