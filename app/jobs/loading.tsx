export default function JobsLoading() {
  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="animate-pulse">

          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />

          <div className="h-10 w-80 bg-slate-200 dark:bg-slate-800 rounded mt-3" />

          <div className="h-4 w-full max-w-2xl bg-slate-200 dark:bg-slate-800 rounded mt-4" />

          {/* Search block */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 mt-8">

            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">

              <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl" />

              <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl" />

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">

              {Array.from({ length: 5 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl"
                  />
                )
              )}

            </div>

          </div>

          {/* Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

            {Array.from({ length: 6 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6"
                >
                  <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />

                  <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded mt-3" />

                  <div className="flex gap-2 mt-5">
                    <div className="h-7 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    <div className="h-7 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                  </div>

                  <div className="h-10 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl mt-6" />
                </div>
              )
            )}

          </div>

        </div>

      </div>
    </main>
  );
}