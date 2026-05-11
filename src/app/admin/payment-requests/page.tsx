import Link from "next/link";

// This page links the admin to the OnlinePosSystem payment confirmation area.
// Actual payment confirmation happens in OnlinePosSystem via its admin settings.
export default function PaymentRequestsPage() {
  const posUrl = process.env.NEXT_PUBLIC_POS_URL ?? "http://localhost:3000";

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Payment Requests</h1>
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6 space-y-3">
        <p className="text-sm text-gray-600">
          Payment requests are submitted by companies in the OnlinePosSystem. To review and confirm
          them, go to the POS system&apos;s admin area:
        </p>
        <a
          href={`${posUrl}/dashboard/settings/subscriptions`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
        >
          Open POS Subscription Manager →
        </a>
        <p className="text-xs text-gray-400">
          After confirming a payment there, the subscription is automatically synced back to this system.
        </p>
      </div>

      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800 space-y-1">
        <p className="font-medium">How to confirm a payment</p>
        <ol className="list-decimal list-inside space-y-0.5 text-amber-700">
          <li>Company owner pays via KHQR and clicks &quot;I&apos;ve Made the Payment&quot;</li>
          <li>Log in to OnlinePosSystem with an account that has <code className="font-mono bg-amber-100 px-1 rounded">settings:manage_users</code> permission</li>
          <li>Navigate to Settings → Subscriptions</li>
          <li>Find the pending request and click &quot;Confirm&quot;</li>
          <li>The subscription is activated and synced here automatically</li>
        </ol>
      </div>
    </div>
  );
}
