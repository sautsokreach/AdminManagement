import { db } from "@/lib/db";
import Link from "next/link";

export default async function ProductTypesPage() {
  const types = await db.productType.findMany({
    include: { features: true, _count: { select: { subscriptions: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Product Types</h1>
        <Link
          href="/admin/product-types/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
        >
          New Product Type
        </Link>
      </div>

      <div className="grid gap-4">
        {types.map((type) => (
          <div
            key={type.id}
            className="rounded-xl bg-white border border-gray-100 shadow-sm p-5 flex items-start justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-base">{type.name}</h2>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  type.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {type.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              {type.description && (
                <p className="text-sm text-gray-500">{type.description}</p>
              )}
              <div className="flex gap-4 text-xs text-gray-400">
                <span>{type.features.length} feature{type.features.length !== 1 ? "s" : ""}</span>
                <span>{type._count.subscriptions} subscriber{type._count.subscriptions !== 1 ? "s" : ""}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {type.features.map((f) => (
                  <span
                    key={f.id}
                    className={`rounded px-2 py-0.5 text-xs border ${
                      f.isEnabled
                        ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 bg-gray-50 text-gray-400 line-through"
                    }`}
                  >
                    {f.key}
                  </span>
                ))}
              </div>
            </div>
            <Link
              href={`/admin/product-types/${type.id}`}
              className="text-sm text-indigo-600 hover:underline"
            >
              Manage
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
