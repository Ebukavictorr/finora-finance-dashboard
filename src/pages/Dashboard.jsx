import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Plus,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ShoppingBag,
  Utensils,
  Car,
  Zap,
  BriefcaseBusiness,
  Trash2,
  X,
} from "lucide-react";

const initialTransactions = [
  {
    id: 1,
    description: "Monthly salary",
    category: "Salary",
    type: "income",
    amount: 450000,
    date: "2026-10-24",
  },
  {
    id: 2,
    description: "Groceries",
    category: "Food",
    type: "expense",
    amount: 18500,
    date: "2026-10-25",
  },
  {
    id: 3,
    description: "Electricity bill",
    category: "Bills",
    type: "expense",
    amount: 22000,
    date: "2026-10-22",
  },
  {
    id: 4,
    description: "Freelance project",
    category: "Freelance",
    type: "income",
    amount: 85000,
    date: "2026-10-20",
  },
];

const categories = [
  "Food",
  "Transport",
  "Bills",
  "Shopping",
  "Housing",
  "Health",
  "Salary",
  "Freelance",
  "Business",
  "Other",
];

const categoryIcons = {
  Food: Utensils,
  Transport: Car,
  Bills: Zap,
  Shopping: ShoppingBag,
  Salary: BriefcaseBusiness,
  Freelance: BriefcaseBusiness,
  Business: TrendingUp,
};

const colors = [
  "bg-emerald-600",
  "bg-blue-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-rose-500",
];

function formatMoney(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getToday() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function Dashboard() {
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem("finora-transactions");
      return saved ? JSON.parse(saved) : initialTransactions;
    } catch {
      return initialTransactions;
    }
  });

  const [budget, setBudget] = useState(() => {
    try {
      return Number(localStorage.getItem("finora-budget")) || 300000;
    } catch {
      return 300000;
    }
  });

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [form, setForm] = useState({
    description: "",
    category: "Food",
    type: "expense",
    amount: "",
    date: getToday(),
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        "finora-transactions",
        JSON.stringify(transactions)
      );
    } catch {
      // The dashboard remains usable if browser storage is unavailable.
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem("finora-budget", String(budget));
    } catch {
      // Budget storage may be unavailable in private browsing.
    }
  }, [budget]);

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = income - expenses;
  const savingsRate = income
    ? Math.round((balance / income) * 100)
    : 0;

  const month = getToday().slice(0, 7);

  const monthlyExpenses = transactions
    .filter(
      (t) => t.type === "expense" && t.date.startsWith(month)
    )
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const budgetPercent = budget
    ? Math.round((monthlyExpenses / budget) * 100)
    : 0;

  const filteredTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
      .filter((t) => {
        const matchesSearch =
          t.description.toLowerCase().includes(search.toLowerCase()) ||
          t.category.toLowerCase().includes(search.toLowerCase());

        const matchesType = filter === "all" || t.type === filter;

        return matchesSearch && matchesType;
      });
  }, [transactions, search, filter]);

  const expenseCategories = categories
    .map((category) => ({
      name: category,
      total: transactions
        .filter(
          (t) => t.type === "expense" && t.category === category
        )
        .reduce((sum, t) => sum + Number(t.amount), 0),
    }))
    .filter((category) => category.total > 0)
    .sort((a, b) => b.total - a.total);

  function addTransaction(event) {
    event.preventDefault();

    const amount = Number(form.amount);
    const description = form.description.trim();

    if (!description || !form.date || !Number.isFinite(amount) || amount <= 0) {
      window.alert("Enter a description, valid amount, and date.");
      return;
    }

    setTransactions((current) => [
      {
        ...form,
        id: Date.now(),
        description,
        amount,
      },
      ...current,
    ]);

    setForm({
      description: "",
      category: "Food",
      type: "expense",
      amount: "",
      date: getToday(),
    });

    setShowForm(false);
  }

  function deleteTransaction(id) {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    setTransactions((current) => current.filter((t) => t.id !== id));
  }

  const cards = [
    {
      title: "Total Balance",
      value: formatMoney(balance),
      icon: Wallet,
      style: "dark",
    },
    {
      title: "Total Income",
      value: formatMoney(income),
      icon: TrendingUp,
    },
    {
      title: "Total Expenses",
      value: formatMoney(expenses),
      icon: TrendingDown,
    },
    {
      title: "Savings Rate",
      value: `${savingsRate}%`,
      icon: PiggyBank,
    },
  ];

  const monthLabel = new Date().toLocaleDateString("en-NG", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#f5f7f6] text-gray-900 md:flex">
      <aside className="border-r border-gray-100 bg-white p-5 md:min-h-screen md:w-64 md:shrink-0">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-700 text-xl font-bold text-white">
            F
          </div>
          <div>
            <h1 className="text-2xl font-bold">finora</h1>
            <p className="text-xs text-gray-500">Personal finance</p>
          </div>
        </Link>

        <p className="mb-3 mt-9 text-xs font-bold uppercase tracking-widest text-gray-400">
          Workspace
        </p>

        <nav className="flex gap-2 overflow-x-auto md:flex-col">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl bg-emerald-50 p-3 font-semibold text-emerald-800"
          >
            <LayoutDashboard size={19} />
            Overview
          </Link>

          <Link
            to="/transactions"
            className="flex items-center gap-3 rounded-xl p-3 text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeftRight size={19} />
            Transactions
          </Link>

          <Link
            to="/budgets"
            className="flex items-center gap-3 rounded-xl p-3 text-gray-600 hover:bg-gray-50"
          >
            <Wallet size={19} />
            Budgets
          </Link>
        </nav>

        <div className="mt-10 rounded-2xl bg-emerald-50 p-4">
          <PiggyBank className="mb-3 text-emerald-700" size={25} />
          <p className="font-bold">Small steps add up.</p>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Track your money and make better financial decisions.
          </p>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-4 sm:p-7 lg:p-9">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">{monthLabel}</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight">
              Dashboard
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Your money at a glance.
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800"
          >
            <Plus size={19} />
            Add transaction
          </button>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.title}
                className={`rounded-2xl border border-gray-100 p-5 shadow-sm ${
                  card.style === "dark"
                    ? "bg-emerald-700 text-white"
                    : "bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p
                    className={`text-sm ${
                      card.style === "dark" ? "text-emerald-50" : "text-gray-500"
                    }`}
                  >
                    {card.title}
                  </p>

                  <span
                    className={`grid h-10 w-10 place-items-center rounded-xl ${
                      card.style === "dark"
                        ? "bg-white/15"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    <Icon size={20} />
                  </span>
                </div>

                <p className="mt-5 break-words text-2xl font-bold">
                  {card.value}
                </p>

                <p
                  className={`mt-2 text-xs ${
                    card.style === "dark" ? "text-emerald-50" : "text-gray-400"
                  }`}
                >
                  {card.title === "Savings Rate"
                    ? "Income remaining after expenses"
                    : "Based on your recorded transactions"}
                </p>
              </article>
            );
          })}
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold">Cash flow</h3>
            <p className="mt-1 text-sm text-gray-500">
              Income compared with expenses
            </p>

            <div className="mt-8 space-y-6">
              <div>
                <div className="mb-2 flex justify-between gap-3 text-sm">
                  <span className="text-gray-500">Income</span>
                  <span className="font-semibold text-emerald-700">
                    {formatMoney(income)}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-gray-100">
                  <div className="h-3 w-full rounded-full bg-emerald-600" />
                </div>
              </div>

              <div>
                <div className="mb-2 flex justify-between gap-3 text-sm">
                  <span className="text-gray-500">Expenses</span>
                  <span className="font-semibold text-rose-600">
                    {formatMoney(expenses)}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-gray-100">
                  <div
                    className="h-3 rounded-full bg-rose-400"
                    style={{
                      width: `${
                        income > 0
                          ? Math.min((expenses / income) * 100, 100)
                          : expenses > 0
                            ? 100
                            : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Net balance</p>
                <p
                  className={`mt-1 text-2xl font-bold ${
                    balance >= 0 ? "text-emerald-700" : "text-rose-600"
                  }`}
                >
                  {formatMoney(balance)}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">Monthly budget</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {monthLabel} spending
                </p>
              </div>
              <Wallet className="text-emerald-700" size={23} />
            </div>

            <div className="mt-7 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">Spent</p>
                <p className="mt-1 text-2xl font-bold">
                  {formatMoney(monthlyExpenses)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Budget limit</p>
                <p className="mt-1 font-semibold">{formatMoney(budget)}</p>
              </div>
            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full transition-all ${
                  budgetPercent > 100
                    ? "bg-rose-500"
                    : budgetPercent >= 80
                      ? "bg-amber-500"
                      : "bg-emerald-600"
                }`}
                style={{ width: `${Math.min(budgetPercent, 100)}%` }}
              />
            </div>

            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>{budgetPercent}% used</span>
              <span>
                {formatMoney(Math.max(budget - monthlyExpenses, 0))} remaining
              </span>
            </div>

            <label className="mt-6 block text-sm font-semibold">
              Change monthly budget
              <input
                type="number"
                min="1"
                value={budget}
                onChange={(event) =>
                  setBudget(Math.max(1, Number(event.target.value) || 1))
                }
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3"
              />
            </label>
          </article>
        </section>

        <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold">Transactions</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add, search, filter, or delete records.
              </p>
            </div>

            <Link
              to="/transactions"
              className="text-sm font-semibold text-emerald-700 hover:underline"
            >
              View transactions page →
            </Link>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search transactions..."
              className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm"
            />

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm"
            >
              <option value="all">All transactions</option>
              <option value="income">Income</option>
              <option value="expense">Expenses</option>
            </select>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
                  <th className="py-3 pr-3">Description</th>
                  <th className="py-3 pr-3">Category</th>
                  <th className="py-3 pr-3">Date</th>
                  <th className="py-3 pr-3 text-right">Amount</th>
                  <th className="py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.map((transaction) => {
                  const Icon = categoryIcons[transaction.category] || Wallet;

                  return (
                    <tr key={transaction.id} className="border-b border-gray-50">
                      <td className="py-4 pr-3">
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                            <Icon size={17} />
                          </span>
                          <span className="font-semibold">
                            {transaction.description}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 pr-3 text-gray-500">
                        {transaction.category}
                      </td>

                      <td className="py-4 pr-3 text-gray-500">
                        {transaction.date}
                      </td>

                      <td
                        className={`py-4 pr-3 text-right font-semibold ${
                          transaction.type === "income"
                            ? "text-emerald-700"
                            : "text-gray-900"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "−"}
                        {formatMoney(transaction.amount)}
                      </td>

                      <td className="py-4 text-right">
                        <button
                          onClick={() => deleteTransaction(transaction.id)}
                          aria-label={`Delete ${transaction.description}`}
                          className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 size={17} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredTransactions.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-500">
                No transactions found.
              </p>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold">Spending breakdown</h3>
          <p className="mt-1 text-sm text-gray-500">
            Expenses by category
          </p>

          <div className="mt-5 space-y-4">
            {expenseCategories.length === 0 && (
              <p className="text-sm text-gray-500">
                Add expenses to see your breakdown.
              </p>
            )}

            {expenseCategories.map((category, index) => (
              <div key={category.name}>
                <div className="mb-2 flex justify-between gap-3 text-sm">
                  <span>{category.name}</span>
                  <span className="font-semibold">
                    {formatMoney(category.total)}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full ${
                      colors[index % colors.length]
                    }`}
                    style={{
                      width: `${
                        expenses ? (category.total / expenses) * 100 : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="py-8 text-center text-xs text-gray-400">
          Finora · Personal finance dashboard
        </footer>
      </main>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-950/40 p-4">
          <div className="my-auto w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold">Add transaction</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Record money coming in or going out.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                aria-label="Close form"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={addTransaction} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm font-semibold">
                  Type
                  <select
                    value={form.type}
                    onChange={(event) =>
                      setForm({ ...form, type: event.target.value })
                    }
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-3"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </label>

                <label className="text-sm font-semibold">
                  Amount (₦)
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={form.amount}
                    onChange={(event) =>
                      setForm({ ...form, amount: event.target.value })
                    }
                    placeholder="25000"
                    className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3"
                  />
                </label>
              </div>

              <label className="block text-sm font-semibold">
                Description
                <input
                  required
                  maxLength={70}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="e.g. Groceries or salary"
                  className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm font-semibold">
                  Category
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-3"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-semibold">
                  Date
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(event) =>
                      setForm({ ...form, date: event.target.value })
                    }
                    className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3"
                  />
                </label>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-3 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800"
                >
                  Save transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;