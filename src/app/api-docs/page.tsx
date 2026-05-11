import { swaggerSpec } from "@/lib/swagger";
import SwaggerUIComponent from "./SwaggerUI";

export const metadata = { title: "API Docs — Admin Management" };

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Admin Management — API Docs</h1>
        <a href="/admin" className="text-sm text-indigo-600 hover:underline">← Admin Panel</a>
      </div>
      <SwaggerUIComponent spec={swaggerSpec} />
    </div>
  );
}
