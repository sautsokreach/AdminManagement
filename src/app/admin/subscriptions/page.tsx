import { db } from "@/lib/db";
import SubscriptionsClient from "./SubscriptionsClient";

export default async function SubscriptionsPage() {
  const [rawSubs, plans] = await Promise.all([
    db.subscription.findMany({
      include: {
        user: { select: { email: true, name: true } },
        productType: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.productType.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const subscriptions = rawSubs.map((s) => ({
    id: s.id,
    status: s.status,
    billingCycle: s.billingCycle,
    startDate: s.startDate.toISOString(),
    endDate: s.endDate?.toISOString() ?? null,
    externalSubscriptionId: s.externalSubscriptionId,
    user: s.user,
    productType: s.productType,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {subscriptions.length} subscription{subscriptions.length !== 1 ? "s" : ""}
        </p>
      </div>
      <SubscriptionsClient subscriptions={subscriptions} plans={plans} />
    </div>
  );
}
