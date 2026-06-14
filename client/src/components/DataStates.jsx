import { ArrowClockwiseIcon, DatabaseIcon, WarningIcon } from "@phosphor-icons/react";

export function FreshnessBadge({ meta }) {
  if (!meta) return null;
  const sourceLabel =
    meta.source === "mock"
      ? "Development fallback"
      : meta.stale
        ? "Cached data"
        : "Fresh data";
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.13em] ${
        meta.source === "mock"
          ? "border-amber-300/30 bg-amber-300/10 text-amber-200"
          : meta.stale
            ? "border-sky-300/25 bg-sky-300/10 text-sky-200"
            : "border-lime-300/25 bg-lime-300/10 text-lime-300"
      }`}
    >
      <DatabaseIcon size={14} weight="bold" aria-hidden="true" />
      {sourceLabel}
    </div>
  );
}

export function LoadingState({ rows = 3 }) {
  return (
    <div className="divide-y divide-white/10 border-y border-white/10" aria-label="Loading data">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="grid animate-pulse grid-cols-[3rem_1fr_4rem] gap-4 py-5">
          <div className="size-10 rounded-full bg-white/10" />
          <div className="space-y-2">
            <div className="h-4 w-2/3 rounded bg-white/10" />
            <div className="h-3 w-1/3 rounded bg-white/5" />
          </div>
          <div className="h-8 rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title = "Nothing to show yet", description }) {
  return (
    <div className="border-y border-white/10 py-16 text-center">
      <SoccerBallMark />
      <h2 className="mt-5 text-xl font-bold tracking-tight">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-400">
        {description || "The latest synchronized World Cup data will appear here."}
      </p>
    </div>
  );
}

export function ErrorState({ error, retry }) {
  return (
    <div className="border border-rose-300/20 bg-rose-300/5 p-6">
      <WarningIcon size={28} className="text-rose-300" aria-hidden="true" />
      <h2 className="mt-4 text-lg font-bold">Data could not be loaded</h2>
      <p className="mt-2 text-sm text-stone-400">{error?.message}</p>
      {retry && (
        <button
          type="button"
          onClick={retry}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-stone-950 transition active:scale-[0.98]"
        >
          <ArrowClockwiseIcon size={16} weight="bold" />
          Try again
        </button>
      )}
    </div>
  );
}

function SoccerBallMark() {
  return (
    <span className="mx-auto grid size-12 place-items-center rounded-full border border-white/10 bg-white/5">
      <span className="size-3 rounded-full bg-lime-300" />
    </span>
  );
}
