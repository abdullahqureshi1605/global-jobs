export default function AdminPlaceholder({
  title,
  eyebrow,
  description,
  status,
}: {
  title: string;
  eyebrow: string;
  description: string;
  status: string;
}) {
  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm font-semibold text-cyan-400">{eyebrow}</div>
        <h1 className="mt-2 text-3xl font-black tracking-tight">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          {description}
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="text-sm font-bold">Module Status</div>
        <div className="mt-3 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-200">
          {status}
        </div>
      </div>
    </div>
  );
}
