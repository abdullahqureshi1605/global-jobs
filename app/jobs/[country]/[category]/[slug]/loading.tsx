export default function JobLoading() {
  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="animate-pulse">

          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />

          <div className="h-4 w-72 bg-slate-200 dark:bg-slate-800 rounded mt-5" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">

            <div className="lg:col-span-2 space-y-8">

              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">

                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />

                <div className="h-10 w-4/5 bg-slate-200 dark:bg-slate-800 rounded mt-4" />

                <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded mt-3" />

                <div className="flex gap-2 mt-6">
                  <div className="h-7 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                  <div className="h-7 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                  <div className="h-7 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                </div>

              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">

                <div className="h-7 w-52 bg-slate-200 dark:bg-slate-800 rounded" />

                <div className="space-y-4 mt-6">

                  {Array.from({ length: 10 }).map(
                    (_, index) => (
                      <div
                        key={index}
                        className="h-4 bg-slate-200 dark:bg-slate-800 rounded"
                      />
                    )
                  )}

                </div>

              </div>

            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 h-80">

              <div className="h-6 w-40 bg-slate-200 dark:bg-slate-800 rounded" />

              <div className="space-y-5 mt-6">

                {Array.from({ length: 6 }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded"
                    />
                  )
                )}

              </div>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}