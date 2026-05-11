"use client";
import { useState } from "react";

interface Props {
  id: string;
  initialMonthly: number | null;
  initialYearly: number | null;
}

export default function PricingForm({ id, initialMonthly, initialYearly }: Props) {
  const [monthly, setMonthly] = useState(initialMonthly?.toString() ?? "");
  const [yearly, setYearly] = useState(initialYearly?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/product-types/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceMonthly: monthly ? parseFloat(monthly) : null,
        priceYearly: yearly ? parseFloat(yearly) : null,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSave} className="rounded-xl bg-white border border-gray-100 shadow-sm p-6 space-y-4">
      <h2 className="font-semibold">Pricing (USD)</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Monthly Price ($)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            placeholder="e.g. 29.00"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={monthly}
            onChange={(e) => setMonthly(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Yearly Price ($)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            placeholder="e.g. 290.00"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={yearly}
            onChange={(e) => setYearly(e.target.value)}
          />
        </div>
      </div>
      {(initialMonthly || initialYearly) && (
        <p className="text-xs text-gray-400">
          Current: ${initialMonthly ?? "—"}/mo · ${initialYearly ?? "—"}/yr
        </p>
      )}
      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
      >
        {saved ? "Saved!" : saving ? "Saving…" : "Save Pricing"}
      </button>
    </form>
  );
}
