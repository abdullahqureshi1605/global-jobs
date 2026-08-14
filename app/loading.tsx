export default function Loading() {
  return (
    <main className="min-h-[70vh] bg-slate-100 dark:bg-slate-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="animate-pulse">

          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-3" />

          <div className="h-10 w-72 bg-slate-200 dark:bg-slate-800 rounded" />

          <div className="h-4 w-full max-w-2xl bg-slate-200 dark:bg-slate-800 rounded mt-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">

            {Array.from({ length: 6 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6"
                >
                  <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />

                  <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded mt-3" />

                  <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded mt-6" />

                  <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded mt-2" />

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