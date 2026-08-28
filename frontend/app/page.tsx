import PortfolioTable from "@/components/PortfolioTable";

export default function Home() {
  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-100">Portfolio Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Live data updates every 15 seconds.
        </p>
      </div>
      {/* Stocks will be fetched from the backend in Step 5 */}
      <PortfolioTable stocks={[]} />
    </main>
  );
}
