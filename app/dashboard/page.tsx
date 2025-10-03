import ExitIntentPrompt from "@/components/misc/ExitIntentPrompt";

export default function Dashboard() {
  // TODO: read addresses from localStorage (Visitor) or Supabase (Public/Private)
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Portfolio</h1>
      <p className="text-gray-600 mt-2">Add addresses or connect a wallet to see totals.</p>
      <ExitIntentPrompt />
    </main>
  );
}

