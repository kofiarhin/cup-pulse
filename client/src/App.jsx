import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import {
  FixturesPage,
  HomePage,
  LivePage,
  MatchDetailPage,
  PredictionPage,
  ResultsPage,
  SummaryPage,
} from "./pages/MatchPages";
import {
  BracketPage,
  PlayerDetailPage,
  PlayersPage,
  StandingsPage,
  TeamDetailPage,
  TeamsPage,
} from "./pages/TournamentPages";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="live" element={<LivePage />} />
        <Route path="fixtures" element={<FixturesPage />} />
        <Route path="results" element={<ResultsPage />} />
        <Route path="matches/:id" element={<MatchDetailPage />} />
        <Route path="matches/:id/prediction" element={<PredictionPage />} />
        <Route path="matches/:id/summary" element={<SummaryPage />} />
        <Route path="standings" element={<StandingsPage />} />
        <Route path="bracket" element={<BracketPage />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="teams/:id" element={<TeamDetailPage />} />
        <Route path="players" element={<PlayersPage />} />
        <Route path="players/:id" element={<PlayerDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}
