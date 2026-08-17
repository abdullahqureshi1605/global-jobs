"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function AdminLogoutButton() {
  return (
    <button
      type="button"
      onClick={() =>
        signOut({
          callbackUrl:
            "/admin/login",
        })
      }
      className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-700 hover:text-white"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </button>
  );
}