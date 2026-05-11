"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function NewProductTypePage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/product-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        description: form.get("description"),
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to create product type");
    } else {
      router.push("/admin/product-types");
      router.refresh();
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <Link href="/admin/product-types" className="text-sm text-gray-400 hover:text-gray-600">
        ← Product Types
      </Link>
      <h1 className="text-2xl font-bold">New Product Type</h1>

      <form onSubmit={handleSubmit} className="rounded-xl bg-white border border-gray-100 shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input name="name" type="text" required placeholder="e.g. Pro"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea name="description" rows={3} placeholder="Optional description"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit"
          className="w-full rounded-md bg-indigo-600 py-2 text-sm text-white font-medium hover:bg-indigo-700">
          Create Product Type
        </button>
      </form>
    </div>
  );
}
