"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function NewFeaturePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [error, setError] = useState("");

  function autoKey(name: string) {
    return name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch(`/api/product-types/${id}/features`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        key: form.get("key"),
        description: form.get("description"),
        isEnabled: form.get("isEnabled") === "true",
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to create feature");
    } else {
      router.push(`/admin/product-types/${id}`);
      router.refresh();
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <Link href={`/admin/product-types/${id}`} className="text-sm text-gray-400 hover:text-gray-600">
        ← Back to Product Type
      </Link>
      <h1 className="text-2xl font-bold">Add Feature</h1>

      <form onSubmit={handleSubmit} className="rounded-xl bg-white border border-gray-100 shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Feature Name</label>
          <input
            name="name"
            type="text"
            required
            placeholder="e.g. Export CSV"
            onChange={(e) => {
              const keyInput = e.currentTarget.form?.elements.namedItem("key") as HTMLInputElement;
              if (keyInput && !keyInput.dataset.touched) {
                keyInput.value = autoKey(e.target.value);
              }
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Key <span className="text-gray-400 font-mono text-xs">(unique slug, never change after creation)</span></label>
          <input
            name="key"
            type="text"
            required
            placeholder="export_csv"
            onInput={(e) => { (e.currentTarget as HTMLInputElement).dataset.touched = "1"; }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea name="description" rows={2}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select name="isEnabled"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit"
          className="w-full rounded-md bg-indigo-600 py-2 text-sm text-white font-medium hover:bg-indigo-700">
          Add Feature
        </button>
      </form>
    </div>
  );
}
