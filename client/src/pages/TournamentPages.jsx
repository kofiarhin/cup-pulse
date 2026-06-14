import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { EmptyState, ErrorState, LoadingState } from "../components/DataStates";
import { useCupData } from "../hooks/useCupData";
import { PageHeader } from "./MatchPages";

function SearchField({ id, label, value, onChange }) {
  return (
    <div className="mb-7 max-w-xl">
      <label htmlFor={id} className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-stone-400">
        {label}
      </label>
      <div className="flex items-center gap-3 border-b border-white/20 pb-3 focus-within:border-lime-300">
        <MagnifyingGlassIcon size={20} className="text-stone-500" aria-hidden="true" />
        <input
          id={id}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent text-base outline-none placeholder:text-stone-600"
          placeholder="Type a name"
        />
      </div>
    </div>
  );
}

export function StandingsPage() {
  const query = useCupData("standings", "/standings?limit=100");
  const standings = query.data?.data || [];
  return (
    <>
      <PageHeader eyebrow="Group phase" title="Standings" description="Group positions, qualification status and official tiebreak data." meta={query.data?.meta} />
      {query.isLoading ? <LoadingState rows={8} /> : query.isError ? <ErrorState error={query.error} retry={query.refetch} /> : (
        <div className="overflow-x-auto border-y border-white/10">
          <table className="w-full min-w-[44rem] border-collapse text-left" aria-label="World Cup standings">
            <thead className="text-xs uppercase tracking-[0.14em] text-stone-500">
              <tr><th className="py-4 pr-4">Pos</th><th className="py-4 pr-4">Team</th><th className="px-3 py-4 text-center">P</th><th className="px-3 py-4 text-center">W</th><th className="px-3 py-4 text-center">D</th><th className="px-3 py-4 text-center">L</th><th className="px-3 py-4 text-center">GD</th><th className="py-4 pl-3 text-right">Pts</th></tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {standings.map((row) => (
                <tr key={row.id} className="text-sm">
                  <td className="py-4 pr-4 font-mono text-stone-500">{row.position ?? "-"}</td>
                  <td className="py-4 pr-4 font-bold">{row.team?.name || row.teamId || "Team pending"}<span className="ml-3 text-xs font-normal text-stone-600">{row.group}</span></td>
                  <td className="px-3 py-4 text-center font-mono">{row.played ?? 0}</td><td className="px-3 py-4 text-center font-mono">{row.won ?? 0}</td><td className="px-3 py-4 text-center font-mono">{row.drawn ?? 0}</td><td className="px-3 py-4 text-center font-mono">{row.lost ?? 0}</td><td className="px-3 py-4 text-center font-mono">{row.goalDifference ?? 0}</td><td className="py-4 pl-3 text-right font-mono text-lg font-black text-lime-300">{row.points ?? 0}</td>
                </tr>
              ))}
              {standings.length === 0 && <tr><td colSpan="8" className="py-14 text-center text-sm text-stone-500">Standings will appear after synchronized group data is available.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export function BracketPage() {
  const query = useCupData("bracket", "/matches?limit=100");
  const matches = (query.data?.data || []).filter((match) => match.stage && !String(match.stage).toLowerCase().includes("group"));
  const stages = [...new Set(matches.map((match) => match.stage))];
  return (
    <>
      <PageHeader eyebrow="Road to the final" title="Knockout bracket" description="A data-driven view that adapts to confirmed 2026 knockout pairings." meta={query.data?.meta} />
      {query.isLoading ? <LoadingState rows={5} /> : query.isError ? <ErrorState error={query.error} retry={query.refetch} /> : (
        <section aria-label="Knockout bracket" className="overflow-x-auto border-y border-white/10 py-7">
          {stages.length === 0 ? <EmptyState title="Knockout pairings pending" description="Confirmed pairings will populate this bracket without placeholder teams." /> : (
            <div className="grid min-w-max auto-cols-[17rem] grid-flow-col gap-8">
              {stages.map((stage) => <div key={stage}><h2 className="mb-5 text-xs font-black uppercase tracking-[0.18em] text-lime-300">{stage}</h2><div className="space-y-5">{matches.filter((match) => match.stage === stage).map((match) => <Link key={match.id} to={`/matches/${match.id}`} className="block border border-white/10 p-4 hover:border-lime-300/40"><div className="flex justify-between font-bold"><span>{match.homeTeam?.name || match.homeTeamId || "TBC"}</span><span className="font-mono">{match.score?.home ?? "-"}</span></div><div className="mt-3 flex justify-between font-bold"><span>{match.awayTeam?.name || match.awayTeamId || "TBC"}</span><span className="font-mono">{match.score?.away ?? "-"}</span></div></Link>)}</div></div>)}
            </div>
          )}
        </section>
      )}
    </>
  );
}

function DirectoryPage({ type }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const plural = type === "team" ? "teams" : "players";
  const query = useCupData([plural, search, page], `/${plural}?page=${page}&limit=24${search ? `&search=${encodeURIComponent(search)}` : ""}`);
  const records = query.data?.data || [];
  return (
    <>
      <PageHeader eyebrow="Tournament directory" title={type === "team" ? "Teams" : "Players"} description={type === "team" ? "Browse confirmed tournament nations, groups and squad links." : "Search synchronized player profiles and recent tournament statistics."} meta={query.data?.meta} />
      <SearchField id={`${type}-search`} label={`Search ${plural}`} value={search} onChange={(value) => { setSearch(value); setPage(1); }} />
      {query.isLoading ? <LoadingState rows={6} /> : query.isError ? <ErrorState error={query.error} retry={query.refetch} /> : records.length === 0 ? <EmptyState title={`No ${plural} available`} /> : (
        <div className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {records.map((record) => <Link key={record.id} to={`/${plural}/${record.id}`} className="group bg-stone-950 p-6 hover:bg-white/[0.035]"><div className="flex items-center gap-4"><div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-full border border-white/10 bg-white/5">{record.crestUrl || record.imageUrl ? <img src={record.crestUrl || record.imageUrl} alt="" className="size-full object-cover" /> : <span className="text-sm font-black text-lime-300">{record.code || record.name?.slice(0, 2).toUpperCase()}</span>}</div><div className="min-w-0"><h2 className="truncate text-lg font-black">{record.name}</h2><p className="mt-1 text-sm text-stone-500">{record.position || record.country || record.group || "Details pending"}</p></div></div></Link>)}
        </div>
      )}
      {(query.data?.pagination?.pages || 0) > 1 && <div className="mt-7 flex justify-between"><button disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="rounded-full border border-white/15 px-4 py-2 disabled:opacity-30">Previous</button><button disabled={page >= query.data.pagination.pages} onClick={() => setPage((value) => value + 1)} className="rounded-full border border-white/15 px-4 py-2 disabled:opacity-30">Next</button></div>}
    </>
  );
}

export const TeamsPage = () => <DirectoryPage type="team" />;
export const PlayersPage = () => <DirectoryPage type="player" />;

function DetailStat({ label, value }) {
  return <div className="border-t border-white/10 py-4"><dt className="text-xs font-bold uppercase tracking-[0.15em] text-stone-500">{label}</dt><dd className="mt-2 text-lg font-black">{value ?? "Not available"}</dd></div>;
}

export function TeamDetailPage() {
  const { id } = useParams();
  const teamQuery = useCupData(["team", id], `/teams/${id}`);
  const playersQuery = useCupData(["team-players", id], `/players?teamId=${id}&limit=100`);
  const team = teamQuery.data?.data;
  if (teamQuery.isLoading) return <LoadingState rows={5} />;
  if (teamQuery.isError) return <ErrorState error={teamQuery.error} retry={teamQuery.refetch} />;
  return <><PageHeader eyebrow={team?.code || "National team"} title={team?.name || "Team details"} description={`${team?.country || "Country pending"} / ${team?.group ? `Group ${team.group}` : "Group assignment pending"}`} meta={teamQuery.data?.meta} /><div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr]"><dl><DetailStat label="Group" value={team?.group} /><DetailStat label="World ranking" value={team?.ranking} /><DetailStat label="Recent form" value={team?.form?.label} /></dl><section aria-label={`${team?.name || "Team"} squad`}><h2 className="text-xl font-black">Squad</h2><div className="mt-5 divide-y divide-white/10 border-y border-white/10">{playersQuery.data?.data?.length ? playersQuery.data.data.map((player) => <Link key={player.id} to={`/players/${player.id}`} className="flex justify-between py-4 font-bold hover:text-lime-300"><span>{player.name}</span><span className="text-sm text-stone-500">{player.position || "Position pending"}</span></Link>) : <p className="py-10 text-center text-sm text-stone-500">Confirmed squad data is not available yet.</p>}</div></section></div></>;
}

export function PlayerDetailPage() {
  const { id } = useParams();
  const query = useCupData(["player", id], `/players/${id}`);
  const player = query.data?.data;
  if (query.isLoading) return <LoadingState rows={5} />;
  if (query.isError) return <ErrorState error={query.error} retry={query.refetch} />;
  const stats = player?.statistics || {};
  return <><PageHeader eyebrow={player?.position || "Player"} title={player?.name || "Player details"} description={`Availability: ${player?.availability || "unknown"}`} meta={query.data?.meta} /><dl className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4"><DetailStat label="Minutes" value={stats.minutes} /><DetailStat label="Goals" value={stats.goals} /><DetailStat label="Assists" value={stats.assists} /><DetailStat label="Clean sheets" value={stats.cleanSheets} /><DetailStat label="Saves" value={stats.saves} /><DetailStat label="Cards" value={stats.cards} /><DetailStat label="Defensive contribution" value={stats.defensiveContribution} /><DetailStat label="Goal contribution" value={stats.goalContribution} /></dl></>;
}
