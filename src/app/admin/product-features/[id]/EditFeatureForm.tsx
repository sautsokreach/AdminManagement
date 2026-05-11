"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Feature {
  id: string;
  name: string;
  key: string;
  description: string | null;
  isEnabled: boolean;
  productTypeId: string;
}

export default function EditFeatureForm({ feature }: { feature: Feature }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch(`/api/product-features/${feature.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        description: form.get("description"),
        isEnabled: form.get("isEnabled") === "true",
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to update feature");
    } else {
      router.push(`/admin/product-types/${feature.productTypeId}`);
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this feature? This cannot be undone.")) return;
    await fetch(`/api/product-features/${feature.id}`, { method: "DELETE" });
    router.push(`/admin/product-types/${feature.productTypeId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl bg-white border border-gray-100 shadow-sm p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Key <span className="text-gray-400 text-xs">(read-only)</span></label>
        <input
          value={feature.key}
          readOnly
          className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-mono text-gray-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input name="name" type="text" required defaultValue={feature.name}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea name="description" rows={2} defaultValue={feature.description ?? ""}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <select name="isEnabled" defaultValue={feature.isEnabled ? "true" : "false"}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </select>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-3">
        <button type="submit"
          className="flex-1 rounded-md bg-indigo-600 py-2 text-sm text-white font-medium hover:bg-indigo-700">
          Save Changes
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="rounded-md border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </form>
  );
}
