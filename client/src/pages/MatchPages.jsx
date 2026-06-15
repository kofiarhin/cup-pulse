import { ArrowRightIcon, MagnifyingGlassIcon, PulseIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { EmptyState, ErrorState, FreshnessBadge, LoadingState } from "../components/DataStates";
import { MatchList } from "../components/MatchList";
import { useCupData } from "../hooks/useCupData";

export function PageHeader({ eyebrow, title, description, meta }) {
  return (
    <div className="mb-8 grid gap-6 border-b border-white/10 pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-[-0.055em] sm:text-5xl">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-base leading-7 text-stone-400">{description}</p>}
      </div>
      <FreshnessBadge meta={meta} />
    </div>
  );
}

function MatchCollectionPage({
  title,
  description,
  path,
  eyebrow = "Tournament feed",
  searchable = false,
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const separator = path.includes("?") ? "&" : "?";
  const queryPath = `${path}${separator}page=${page}&limit=20${
    search ? `&search=${encodeURIComponent(search)}` : ""
  }`;
  const query = useCupData(["matches", path, page, search], queryPath);
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={description} meta={query.data?.meta} />
      {searchable && (
        <div className="mb-6 max-w-xl">
          <label htmlFor="match-search" className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-stone-400">
            Search {title.toLowerCase()}
          </label>
          <div className="flex items-center gap-3 border-b border-white/20 pb-3 focus-within:border-lime-300">
            <MagnifyingGlassIcon size={20} className="text-stone-500" aria-hidden="true" />
            <input
              id="match-search"
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Team or match"
              className="w-full bg-transparent text-base text-white outline-none placeholder:text-stone-600"
            />
          </div>
        </div>
      )}
      {query.isLoading ? (
        <LoadingState rows={5} />
      ) : query.isError ? (
        <ErrorState error={query.error} retry={query.refetch} />
      ) : query.data?.data?.length ? (
        <MatchList matches={query.data.data} />
      ) : (
        <EmptyState title={`No ${title.toLowerCase()} available`} />
      )}
      {(query.data?.pagination?.pages || 0) > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold disabled:opacity-30">Previous</button>
          <span className="font-mono text-xs text-stone-500">Page {page} of {query.data.pagination.pages}</span>
          <button type="button" disabled={page >= query.data.pagination.pages} onClick={() => setPage((value) => value + 1)} className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold disabled:opacity-30">Next</button>
        </div>
      )}
    </>
  );
}

export function HomePage() {
  const live = useCupData("home-live", "/matches/live?limit=4");
  const fixtures = useCupData("home-fixtures", "/fixtures?limit=4");
  const announcements = useCupData("announcements", "/announcements");
  const featured = useCupData("featured-content", "/featured-content");
  const meta = live.data?.meta || fixtures.data?.meta;
  return (
    <div>
      {announcements.data?.data?.length > 0 && (
        <section aria-label="Announcements" className="mb-8 divide-y divide-white/10 border-y border-white/10">
          {announcements.data.data.map((item) => (
            <div key={item.id} className="grid gap-2 py-4 sm:grid-cols-[12rem_1fr]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-300">{item.title}</p>
              <p className="text-sm leading-6 text-stone-300">{item.message}</p>
            </div>
          ))}
        </section>
      )}
      <section className="grid min-h-[30rem] items-end gap-10 border-b border-white/10 pb-10 lg:grid-cols-[1.5fr_0.7fr] lg:pb-14">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-lime-300">CupPulse / 2026</p>
          <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.93] tracking-[-0.07em] sm:text-6xl lg:text-7xl">
            The heartbeat of the World Cup.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-stone-400">
            Real fixtures, scores, standings, players, predictions and post-match stories, synchronized through CupPulse.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/live" className="inline-flex items-center gap-2 rounded-full bg-lime-300 px-5 py-3 text-sm font-black text-stone-950 transition active:scale-[0.98]">
              <PulseIcon size={18} weight="fill" /> Follow live
            </Link>
            <FreshnessBadge meta={meta} />
          </div>
        </div>
        <div className="border-l border-lime-300/40 pl-6 lg:mb-2">
          <p className="font-mono text-5xl font-black text-lime-300">48</p>
          <p className="mt-2 text-sm font-bold uppercase tracking-[0.18em] text-stone-500">Teams. One pulse.</p>
        </div>
      </section>
      <section className="grid gap-12 py-12 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="mb-5 flex items-end justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-300">Now</p><h2 className="mt-2 text-2xl font-black">Live matches</h2></div>
            <Link to="/live" className="text-sm font-bold text-stone-400 hover:text-white">View all</Link>
          </div>
          {live.isLoading ? <LoadingState rows={2} /> : live.data?.data?.length ? <MatchList matches={live.data.data} /> : <EmptyState title="No matches are live" description="Kickoff updates will appear automatically after the next cache refresh." />}
        </div>
        <div>
          <div className="mb-5"><p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-300">Next</p><h2 className="mt-2 text-2xl font-black">Upcoming fixtures</h2></div>
          {fixtures.isLoading ? <LoadingState rows={2} /> : fixtures.data?.data?.length ? <MatchList matches={fixtures.data.data} /> : <EmptyState title="Fixtures pending" />}
        </div>
      </section>
      {featured.data?.data?.length > 0 && (
        <section className="border-t border-white/10 py-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-300">Featured</p>
          <div className="mt-5 grid gap-px bg-white/10 md:grid-cols-[1.4fr_1fr]">
            {featured.data.data.map((item) => (
              <Link key={item.id} to={item.href || "/"} className="bg-stone-950 p-6 hover:bg-white/[0.035]">
                <h2 className="text-xl font-black">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-stone-400">{item.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export const LivePage = () => <MatchCollectionPage title="Live matches" description="In-play World Cup matches from the latest synchronized match window." path="/matches/live" eyebrow="Live pulse" />;
export const FixturesPage = () => <MatchCollectionPage title="Fixtures" description="The tournament schedule, searchable by team, date, group and stage." path="/fixtures" searchable />;
export const ResultsPage = () => <MatchCollectionPage title="Results" description="Completed matches and confirmed scorelines." path="/matches?status=finished" />;

export function MatchDetailPage() {
  const { id } = useParams();
  const query = useCupData(["match", id], `/matches/${id}`);
  const match = query.data?.data;
  if (query.isLoading) return <LoadingState rows={4} />;
  if (query.isError) return <ErrorState error={query.error} retry={query.refetch} />;
  return (
    <>
      <PageHeader eyebrow="Match centre" title="Match centre" description="Score, incidents, statistics and tournament context." meta={query.data?.meta} />
      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <section className="border-y border-white/10 py-10" aria-label="Match score">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{match?.status || "Scheduled"}</p>
          <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-center">
            <h2 className="text-xl font-black">{match?.homeTeam?.name || match?.homeTeamId || "Home team"}</h2>
            <div className="font-mono text-4xl font-black text-lime-300">{match?.score?.home ?? "–"} : {match?.score?.away ?? "–"}</div>
            <h2 className="text-xl font-black">{match?.awayTeam?.name || match?.awayTeamId || "Away team"}</h2>
          </div>
        </section>
        <aside className="space-y-3">
          <Link to={`/matches/${id}/prediction`} className="flex items-center justify-between border-b border-white/10 py-4 font-bold hover:text-lime-300">Match prediction <ArrowRightIcon /></Link>
          <Link to={`/matches/${id}/summary`} className="flex items-center justify-between border-b border-white/10 py-4 font-bold hover:text-lime-300">Match summary <ArrowRightIcon /></Link>
        </aside>
      </div>
    </>
  );
}

export function PredictionPage() {
  const { id } = useParams();
  const query = useCupData(["prediction", id], `/predictions/${id}`);
  const prediction = query.data?.data;
  return (
    <>
      <PageHeader eyebrow="Model output" title="Match prediction" description="A deterministic estimate built from real team and player form." meta={query.data?.meta} />
      {query.isLoading ? <LoadingState /> : query.isError ? <ErrorState error={query.error} retry={query.refetch} /> : (
        <div className="grid gap-8 lg:grid-cols-[1fr_0.7fr]">
          <div className="grid grid-cols-3 divide-x divide-white/10 border-y border-white/10 py-8 text-center">
            {[["Home", prediction?.homeWinProbability], ["Draw", prediction?.drawProbability], ["Away", prediction?.awayWinProbability]].map(([label, value]) => (
              <div key={label}><p className="font-mono text-3xl font-black text-lime-300">{value == null ? "–" : `${Math.round(value * 100)}%`}</p><p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-stone-500">{label}</p></div>
            ))}
          </div>
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Predicted score</p><p className="mt-3 font-mono text-6xl font-black">{prediction?.predictedScore || "–"}</p><p className="mt-5 text-sm leading-6 text-stone-400">{prediction?.rationale?.join(" ") || "Prediction inputs are not yet available."}</p></div>
        </div>
      )}
    </>
  );
}

export function SummaryPage() {
  const { id } = useParams();
  const query = useCupData(["summary", id], `/summaries/${id}`);
  const summary = query.data?.data;
  return (
    <>
      <PageHeader eyebrow="After the whistle" title="Match summary" description="A structured match report generated from confirmed match data." meta={query.data?.meta} />
      {query.isLoading ? <LoadingState /> : query.isError ? <ErrorState error={query.error} retry={query.refetch} /> : summary?.message ? (
        <EmptyState title={summary.message} description="CupPulse only publishes summaries from confirmed full-time data." />
      ) : (
        <article className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-black tracking-tight">{summary?.title}</h2>
          <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
            {summary?.sections?.map((section) => <section key={section.id} className="py-7"><h3 className="text-lg font-black">{section.title}</h3><p className="mt-3 leading-7 text-stone-300">{section.body}</p></section>)}
          </div>
        </article>
      )}
    </>
  );
}
