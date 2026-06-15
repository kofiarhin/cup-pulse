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
import { AdminLayout } from "./admin/AdminLayout";
import {
  AdminDashboardPage,
  AdminLoginPage,
} from "./admin/AdminLoginPage";
import {
  AdminAnnouncementsPage,
  AdminFeaturedContentPage,
  AdminHealthPage,
  AdminSyncPage,
} from "./admin/AdminPages";
import { getAdminToken } from "./api/adminApi";

function ProtectedAdmin() {
  return getAdminToken() ? <AdminLayout /> : <Navigate to="/admin" replace />;
}

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
      <Route path="admin" element={<AdminLoginPage />} />
      <Route element={<ProtectedAdmin />}>
        <Route path="admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="admin/sync" element={<AdminSyncPage />} />
        <Route path="admin/health" element={<AdminHealthPage />} />
        <Route path="admin/announcements" element={<AdminAnnouncementsPage />} />
        <Route path="admin/featured" element={<AdminFeaturedContentPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}
