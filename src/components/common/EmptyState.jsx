import { DatabaseZap } from "lucide-react";

export default function EmptyState({ title, message }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
      <DatabaseZap className="h-9 w-9 text-slate-400" aria-hidden="true" />
      <h3 className="mt-3 text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">{message}</p>
    </div>
  );
}

