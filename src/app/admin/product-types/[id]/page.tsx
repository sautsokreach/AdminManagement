import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import PricingForm from "./PricingForm";

export default async function ProductTypeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const type = await db.productType.findUnique({
    where: { id },
    include: { features: { orderBy: { createdAt: "asc" } } },
  });

  if (!type) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/product-types" className="text-sm text-gray-400 hover:text-gray-600">
          ← Product Types
        </Link>
      </div>

      <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{type.name}</h1>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            type.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
          }`}>
            {type.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        {type.description && <p className="text-sm text-gray-500">{type.description}</p>}
      </div>

      {/* Pricing */}
      <PricingForm
        id={type.id}
        initialMonthly={type.priceMonthly ? Number(type.priceMonthly) : null}
        initialYearly={type.priceYearly ? Number(type.priceYearly) : null}
      />

      {/* Features */}
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Features</h2>
          <Link
            href={`/admin/product-types/${id}/features/new`}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700"
          >
            Add Feature
          </Link>
        </div>

        {type.features.length === 0 ? (
          <p className="text-sm text-gray-400">No features yet.</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {type.features.map((f) => (
              <li key={f.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{f.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{f.key}</p>
                  {f.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{f.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    f.isEnabled
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {f.isEnabled ? "Enabled" : "Disabled"}
                  </span>
                  <Link
                    href={`/admin/product-features/${f.id}`}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
