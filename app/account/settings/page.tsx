export default function SettingsPage() {
  return (
    <div className="w-full px-5 py-5 lg:px-8 lg:py-6">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#b88410]">
        Account
      </p>

      <h2 className="mt-2 text-[13px] font-black text-[#071a35]">
        Settings
      </h2>

      <div className="mt-5 rounded-[2px] border border-slate-200 bg-white p-4">
        <h3 className="text-[13px] font-black text-[#071a35]">
          Account settings
        </h3>

        <p className="mt-2 text-[13px] leading-6 text-slate-500">
          Security, preferences and notification controls will be managed here.
        </p>
      </div>
    </div>
  );
}

