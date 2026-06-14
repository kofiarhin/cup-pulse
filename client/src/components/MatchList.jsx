import { ArrowRightIcon } from "@phosphor-icons/react";
import { Link } from "react-router-dom";

function teamName(match, side) {
  return (
    match[`${side}Team`]?.name ||
    match[`${side}TeamName`] ||
    match[`${side}TeamId`] ||
    "To be confirmed"
  );
}

export function MatchList({ matches = [] }) {
  return (
    <div className="divide-y divide-white/10 border-y border-white/10">
      {matches.map((match) => (
        <Link
          key={match.id}
          to={`/matches/${match.id}`}
          className="group grid grid-cols-[1fr_auto] items-center gap-4 py-5 transition hover:bg-white/[0.025] active:translate-y-px sm:grid-cols-[8rem_1fr_auto]"
        >
          <div className="hidden text-xs font-semibold uppercase tracking-[0.15em] text-stone-500 sm:block">
            {match.status || "Scheduled"}
          </div>
          <div>
            <div className="flex items-center gap-3 text-base font-bold">
              <span className="min-w-0 flex-1 truncate">{teamName(match, "home")}</span>
              <span className="font-mono text-lime-300">
                {match.score?.home ?? "–"}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-3 text-base font-bold">
              <span className="min-w-0 flex-1 truncate">{teamName(match, "away")}</span>
              <span className="font-mono text-lime-300">
                {match.score?.away ?? "–"}
              </span>
            </div>
            <p className="mt-3 text-xs text-stone-500 sm:hidden">
              {match.status || "Scheduled"}
            </p>
          </div>
          <ArrowRightIcon
            size={20}
            className="text-stone-600 transition-transform group-hover:translate-x-1 group-hover:text-white"
            aria-hidden="true"
          />
        </Link>
      ))}
    </div>
  );
}
