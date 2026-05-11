import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Admin Management</h1>
        <p className="text-gray-500">Manage users, subscriptions, and product features.</p>
        <Link
          href="/admin"
          className="inline-block rounded-md bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700"
        >
          Go to Admin
        </Link>
      </div>
    </main>
  );
}
