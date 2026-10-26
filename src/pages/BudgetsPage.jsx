import { Link } from "react-router-dom";
import { ArrowLeft, Wallet } from "lucide-react";

export default function BudgetsPage() {
  return (
    <main className="min-h-screen bg-[#f5f7f6] p-6 sm:p-10">
      <Link
        to="/"
        className="inline-flex items-center gap-2 font-semibold text-emerald-700"
      >
        <ArrowLeft size={18} />
        Back to dashboard
      </Link>

      <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <Wallet size={32} className="text-emerald-700" />

        <h1 className="mt-4 text-3xl font-bold">Budgets</h1>

        <p className="mt-3 text-gray-500">
          Your monthly budget limit can be changed on the main dashboard.
        </p>

        <Link
          to="/"
          className="mt-6 inline-block rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white"
        >
          Manage budget
        </Link>
      </div>
    </main>
  );
}