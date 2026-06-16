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

function teamLogo(match, side) {
  return match[`${side}Team`]?.logo || match[`${side}TeamLogo`] || null;
}

function TeamLine({ match, side }) {
  const logo = teamLogo(match, side);
  return (
    <div className="flex min-w-0 items-center gap-3 text-base font-bold">
      <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.03]">
        {logo && (
          <img
            src={logo}
            alt=""
            className="size-5 object-contain"
            loading="lazy"
            aria-hidden="true"
          />
        )}
      </span>
      <span className="min-w-0 flex-1 truncate">{teamName(match, side)}</span>
      <span className="font-mono text-lime-300">
        {match.score?.[side] ?? "-"}
      </span>
    </div>
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
            <TeamLine match={match} side="home" />
            <div className="mt-2">
              <TeamLine match={match} side="away" />
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
