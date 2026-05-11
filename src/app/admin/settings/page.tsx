"use client";
import { useEffect, useState } from "react";

interface Settings {
  trial_days: string;
  khqr_account_id: string;
  khqr_merchant_name: string;
  khqr_merchant_city: string;
  khqr_currency: string;
}

const DEFAULT: Settings = {
  trial_days: "30",
  khqr_account_id: "",
  khqr_merchant_name: "",
  khqr_merchant_city: "PHNOM PENH",
  khqr_currency: "USD",
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState<Settings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setForm({ ...DEFAULT, ...data });
        setLoading(false);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <p className="text-sm text-gray-400">Loading…</p>;

  return (
    <div className="max-w-lg space-y-8">
      <h1 className="text-2xl font-bold">System Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Trial */}
        <section className="rounded-xl bg-white border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Free Trial</h2>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Trial Duration (days)
            </label>
            <input
              type="number"
              min={1}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.trial_days}
              onChange={(e) => setForm((f) => ({ ...f, trial_days: e.target.value }))}
              required
            />
            <p className="text-xs text-gray-400">
              New companies get this many days of free access.
            </p>
          </div>
        </section>

        {/* KHQR */}
        <section className="rounded-xl bg-white border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">KHQR Payment Settings</h2>
          <p className="text-xs text-gray-400">
            These details are embedded in the QR code shown to customers.
          </p>

          {[
            { key: "khqr_account_id" as const, label: "Bakong Account ID", placeholder: "012345678@bakong", hint: "Your Bakong app ID (phone@bakong or merchant ID)" },
            { key: "khqr_merchant_name" as const, label: "Merchant Name", placeholder: "MY COMPANY", hint: "Shown in the KHQR receipt (max 25 chars)" },
            { key: "khqr_merchant_city" as const, label: "Merchant City", placeholder: "PHNOM PENH", hint: "City shown in the QR receipt (max 15 chars)" },
          ].map(({ key, label, placeholder, hint }) => (
            <div key={key} className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">{label}</label>
              <input
                type="text"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={placeholder}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
              <p className="text-xs text-gray-400">{hint}</p>
            </div>
          ))}

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Currency</label>
            <select
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.khqr_currency}
              onChange={(e) => setForm((f) => ({ ...f, khqr_currency: e.target.value }))}
            >
              <option value="USD">USD (US Dollar)</option>
              <option value="KHR">KHR (Cambodian Riel)</option>
            </select>
          </div>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {saved ? "Saved!" : saving ? "Saving…" : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
