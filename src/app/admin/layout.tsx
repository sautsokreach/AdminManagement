import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/product-types", label: "Product Types" },
  { href: "/admin/subscriptions", label: "Subscriptions" },
  { href: "/admin/payment-requests", label: "Payment Requests" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/api-docs", label: "API Docs" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user?.role !== "admin") redirect("/login");

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 bg-indigo-900 text-white flex flex-col">
        <div className="px-6 py-5 text-lg font-bold border-b border-indigo-700">
          Admin Panel
        </div>
        <nav className="flex-1 py-4 space-y-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm hover:bg-indigo-700 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-6 py-4 text-xs text-indigo-300 border-t border-indigo-700">
          {session.user?.email}
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 p-8">{children}</main>
    </div>
  );
}
