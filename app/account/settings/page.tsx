export default function SettingsPage() {
  return (
    <div className="w-full px-5 py-7 lg:px-8 lg:py-9">
      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#b88410]">
        Account
      </p>

      <h2 className="mt-2 text-3xl font-black text-[#071a35]">
        Settings
      </h2>

      <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-xl font-black text-[#071a35]">
          Account settings
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Security, preferences and notification controls will be managed here.
        </p>
      </div>
    </div>
  );
}
