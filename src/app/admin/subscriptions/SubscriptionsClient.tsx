"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Plan = { id: string; name: string };
type Subscription = {
  id: string;
  status: string;
  billingCycle: string;
  startDate: string;
  endDate: string | null;
  externalSubscriptionId: string | null;
  user: { name: string | null; email: string };
  productType: { id: string; name: string };
};

const STATUS_COLOR: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
  expired: "bg-gray-100 text-gray-500",
};

export default function SubscriptionsClient({
  subscriptions,
  plans,
}: {
  subscriptions: Subscription[];
  plans: Plan[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [changePlanTarget, setChangePlanTarget] = useState<Subscription | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Subscription | null>(null);

  async function toggleCancel(sub: Subscription) {
    const newStatus = sub.status === "active" ? "cancelled" : "active";
    setLoading(sub.id);
    try {
      await fetch(`/api/subscriptions/${sub.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function savePlanChange() {
    if (!changePlanTarget || !selectedPlanId) return;
    setLoading(changePlanTarget.id);
    try {
      await fetch(`/api/subscriptions/${changePlanTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productTypeId: selectedPlanId }),
      });
      setChangePlanTarget(null);
      setSelectedPlanId("");
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setLoading(deleteTarget.id);
    try {
      await fetch(`/api/subscriptions/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        {subscriptions.length === 0 ? (
          <div className="px-4 py-16 text-center text-gray-400 text-sm">
            No subscriptions yet. They are created automatically when a company completes payment in OnlinePosSystem.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Plan</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">User</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Billing</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Start</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">End</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium capitalize">{sub.productType.name}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{sub.user.name ?? sub.user.email}</p>
                    {sub.user.name && (
                      <p className="text-xs text-gray-400">{sub.user.email}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[sub.status] ?? "bg-gray-100 text-gray-500"}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 capitalize">{sub.billingCycle}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(sub.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        disabled={loading === sub.id || sub.status === "expired"}
                        onClick={() => toggleCancel(sub)}
                        className={`rounded px-2 py-1 text-xs font-medium disabled:opacity-50 transition-colors ${
                          sub.status === "active"
                            ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {loading === sub.id ? "…" : sub.status === "active" ? "Cancel" : "Reactivate"}
                      </button>

                      <button
                        disabled={loading === sub.id}
                        onClick={() => {
                          setChangePlanTarget(sub);
                          setSelectedPlanId(sub.productType.id);
                        }}
                        className="rounded px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 disabled:opacity-50 transition-colors"
                      >
                        Change Plan
                      </button>

                      <button
                        disabled={loading === sub.id}
                        onClick={() => setDeleteTarget(sub)}
                        className="rounded px-2 py-1 text-xs font-medium bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Change Plan Modal */}
      {changePlanTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-80 space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Change Plan</h2>
              <p className="text-sm text-gray-500 mt-1">
                {changePlanTarget.user.name ?? changePlanTarget.user.email}
              </p>
            </div>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setChangePlanTarget(null); setSelectedPlanId(""); }}
                className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={loading === changePlanTarget.id || !selectedPlanId}
                onClick={savePlanChange}
                className="rounded bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {loading === changePlanTarget.id ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-80 space-y-4">
            <h2 className="text-lg font-semibold">Delete Subscription?</h2>
            <p className="text-sm text-gray-600">
              This will permanently remove the{" "}
              <span className="font-medium capitalize">{deleteTarget.productType.name}</span> subscription
              for <span className="font-medium">{deleteTarget.user.name ?? deleteTarget.user.email}</span>.
              This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={loading === deleteTarget.id}
                onClick={confirmDelete}
                className="rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loading === deleteTarget.id ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
