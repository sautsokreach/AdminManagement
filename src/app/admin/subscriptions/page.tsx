import { db } from "@/lib/db";

export default async function SubscriptionsPage() {
  const subscriptions = await db.subscription.findMany({
    include: {
      user: { select: { email: true, name: true } },
      productType: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const statusColor: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-600",
    expired: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Subscriptions</h1>

      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">User</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Product Type</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Start Date</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">End Date</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">External ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p>{sub.user.name ?? sub.user.email}</p>
                  {sub.user.name && (
                    <p className="text-xs text-gray-400">{sub.user.email}</p>
                  )}
                </td>
                <td className="px-4 py-3 font-medium">{sub.productType.name}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[sub.status]}`}>
                    {sub.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {sub.startDate.toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {sub.endDate ? sub.endDate.toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">
                  {sub.externalSubscriptionId ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
