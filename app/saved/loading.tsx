export default function SavedLoading() {
  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="animate-pulse">

          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />

          <div className="bg-slate-900 rounded-3xl p-8 mt-6">

            <div className="h-10 w-56 bg-slate-700 rounded" />

            <div className="h-4 w-80 bg-slate-700 rounded mt-4" />

          </div>

          <div className="space-y-4 mt-8">

            {Array.from({ length: 4 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6"
                >
                  <div className="h-6 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />

                  <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded mt-3" />

                  <div className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl mt-5" />
                </div>
              )
            )}

          </div>

        </div>

      </div>
    </main>
  );
}