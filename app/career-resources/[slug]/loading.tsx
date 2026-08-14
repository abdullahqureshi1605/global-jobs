export default function ResourceArticleLoading() {
  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="animate-pulse">

          <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />

          <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded mt-5" />

          <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 mt-6">

            <div className="h-6 w-28 bg-slate-700 rounded" />

            <div className="h-12 w-4/5 bg-slate-700 rounded mt-6" />

            <div className="h-4 w-full bg-slate-700 rounded mt-5" />

            <div className="h-4 w-2/3 bg-slate-700 rounded mt-2" />

          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 mt-8">

            <div className="space-y-4">

              {Array.from({ length: 12 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className={`h-4 bg-slate-200 dark:bg-slate-800 rounded ${
                      index % 4 === 0
                        ? "w-3/4"
                        : "w-full"
                    }`}
                  />
                )
              )}

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}