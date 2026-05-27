import { Activity, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { REFRESH_SECONDS } from "../../config/supabase";
import { formatDateTime } from "../../utils/format";
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
    <header className="surface flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
          <Activity className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="section-title">Lettuce Monitor</p>
          <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">
            Realtime Growth Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {profile?.farm_name || "Manila sensor simulation"}, pump schedule, TFLite bottleneck, and XGBoost predictions.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <StatusBadge tone={error ? "amber" : isMock ? "sky" : "emerald"}>
          {error ? (
            <WifiOff className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Wifi className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
          )}
          {error ? "Fallback data" : isMock ? "Preview data" : "Live Supabase"}
        </StatusBadge>
        <div className="text-xs text-slate-500">
          <span className="font-medium text-slate-700">Last refresh:</span>{" "}
          {lastRefresh ? formatDateTime(lastRefresh) : "Starting"}
          <span className="hidden sm:inline"> / {REFRESH_SECONDS}s</span>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-70"
          disabled={loading}
          title="Refresh dashboard data"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
          Refresh
        </button>
      </div>
    </header>
  );
}
