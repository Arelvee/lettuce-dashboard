import { Clock3, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { REFRESH_SECONDS } from "../../config/supabase";
import { formatDateTime } from "../../utils/format";
import ThesisLogo from "../common/ThesisLogo";
import StatusBadge from "../common/StatusBadge";

export default function DashboardHeader({
  loading,
  error,
  isMock,
  lastRefresh,
  onRefresh,
  profile,
}) {
  return (
    <header className="overflow-hidden rounded-lg border border-slate-800 bg-gradient-to-br from-slate-950 via-emerald-950 to-sky-950 text-white shadow-soft dark:border-white/10">
      <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase text-emerald-300">Lettuce Monitor</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">Realtime Growth Dashboard</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            {profile?.farm_name || "Manila sensor simulation"} with live sensor monitoring, pump status,
            and growth prediction outputs.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-center lg:min-w-[34rem]">
          <StatusBadge tone={error ? "amber" : isMock ? "sky" : "emerald"}>
            {error ? (
              <WifiOff className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Wifi className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            )}
            {error ? "Fallback data" : isMock ? "Preview data" : "Live Supabase"}
          </StatusBadge>
          <div className="flex min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
            <Clock3 className="h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
            <span className="truncate">
              <span className="font-semibold text-white">Last refresh:</span>{" "}
              {lastRefresh ? formatDateTime(lastRefresh) : "Starting"}
              <span className="hidden sm:inline"> / {REFRESH_SECONDS}s</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-wait disabled:opacity-70"
            disabled={loading}
            title="Refresh dashboard data"
          >
            {loading ? (
              <ThesisLogo size="xs" animated={false} loading decorative className="shadow-none" />
            ) : (
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            )}
            {loading ? "Syncing" : "Refresh"}
          </button>
        </div>
      </div>
    </header>
  );
}
