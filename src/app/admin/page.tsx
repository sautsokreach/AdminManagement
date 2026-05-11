import { db } from "@/lib/db";

export default async function AdminDashboard() {
  const [userCount, productTypeCount, activeSubscriptionCount] = await Promise.all([
    db.user.count(),
    db.productType.count({ where: { isActive: true } }),
    db.subscription.count({ where: { status: "active" } }),
  ]);

  const stats = [
    { label: "Total Users", value: userCount },
    { label: "Active Product Types", value: productTypeCount },
    { label: "Active Subscriptions", value: activeSubscriptionCount },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-3 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="mt-1 text-3xl font-bold text-indigo-600">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
