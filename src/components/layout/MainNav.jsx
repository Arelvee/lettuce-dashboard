import { Leaf, LayoutDashboard, LogOut, UserRound } from "lucide-react";

export default function MainNav({ activePage, profile, onNavigate, onSignOut }) {
  return (
    <nav className="surface sticky top-3 z-20 flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={() => onNavigate("dashboard")}
        className="focus-ring flex items-center gap-3 rounded-lg px-2 py-1 text-left"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
          <Leaf className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-950">Lettuce Predict</p>
          <p className="text-xs text-slate-500">{profile?.farm_name || "Vertical farm system"}</p>
        </div>
      </button>

      <div className="flex items-center gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => onNavigate("dashboard")}
          className={`focus-ring inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold ${
            activePage === "dashboard"
              ? "bg-slate-950 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
          Dashboard
        </button>
        <button
          type="button"
          onClick={() => onNavigate("profile")}
          className={`focus-ring inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold ${
            activePage === "profile"
              ? "bg-slate-950 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <UserRound className="h-4 w-4" aria-hidden="true" />
          Profile
        </button>
        <button
          type="button"
          onClick={onSignOut}
          className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </nav>
  );
}

