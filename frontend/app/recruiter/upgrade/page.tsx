import Link from "next/link";

export default function RecruiterUpgradePage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
            Recruiter billing
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
            Upgrade
          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Paid-plan billing has not been connected to a payment provider yet.
            No fake prices, balances, or payment status are displayed here.
          </p>

          <Link
            href="/recruiter/dashboard"
            className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white"
          >
            Back to Dashboard
          </Link>
        </section>
      </div>
    </main>
  );
}
